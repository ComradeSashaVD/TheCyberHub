import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { gamificationService } from '@/lib/gamification/gamificationService';

// Схема валидации входных данных
const submitSchema = z.object({
  flag: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 1. Аутентификация пользователя
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  // 2. Rate limiting (защита от накрутки)
  const limitKey = `submit:${userId}`;
  const { allowed, reset } = rateLimit(limitKey);
  if (!allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many attempts, try later' },
      { status: 429, headers: { 'X-RateLimit-Reset': reset.toString() } }
    );
  }

  // 3. Получение challenge из БД
  const challengeId = params.id;
  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('*')
    .eq('_id', challengeId)     // или 'id' – уточните по вашей схеме
    .single();

  if (challengeError || !challenge) {
    return NextResponse.json({ success: false, message: 'Challenge not found' }, { status: 404 });
  }

  // 4. Проверка, не решён ли уже этот челлендж пользователем
  const { data: existingSolve, error: solveCheckError } = await supabase
    .from('solves')  // предположительно таблица решений, может называться user_challenge_solves
    .select('id')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingSolve) {
    return NextResponse.json({ success: false, message: 'Challenge already solved' }, { status: 400 });
  }

  // 5. Валидация тела запроса
  const body = await request.json();
  const parseResult = submitSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ success: false, message: 'Invalid flag format' }, { status: 400 });
  }
  const { flag } = parseResult.data;

  // 6. Проверка флага (сравнение с сохранённым в БД)
  // Обычно флаг хранится в поле `flag` таблицы `challenges`
  const isCorrect = (flag.trim() === challenge.flag);
  if (!isCorrect) {
    return NextResponse.json({ success: false, message: 'Incorrect flag' }, { status: 200 });
  }

  // 7. Сохраняем решение в БД
  const { error: insertError } = await supabase
    .from('solves')
    .insert({
      challenge_id: challengeId,
      user_id: userId,
      solved_at: new Date().toISOString(),
      points_earned: challenge.currentPoints,
    });

  if (insertError) {
    console.error('Failed to save solve:', insertError);
    return NextResponse.json({ success: false, message: 'Failed to record solve' }, { status: 500 });
  }

  // 8. Обновляем solveCount у челленджа (инкремент)
  await supabase
    .from('challenges')
    .update({ solveCount: (challenge.solveCount || 0) + 1 })
    .eq('_id', challengeId);

  // 9. 🎮 Начисляем XP через систему геймификации
  let xpAwarded = 0;
  try {
    const result = await gamificationService.handleChallengeSolve(
      userId,
      challengeId,
      challenge.difficulty  // ожидается 'easy', 'medium', 'hard', 'expert'
    );
    xpAwarded = result.newXp; // или можно получить из metadata, но пока так
  } catch (err) {
    console.error('Gamification XP award failed:', err);
    // Не прерываем выполнение, XP может не начислиться, но решение уже записано
  }

  // 10. Возвращаем успешный ответ
  return NextResponse.json({
    success: true,
    message: 'Correct flag! Challenge solved! 🎉',
    xpAwarded,
  });
}