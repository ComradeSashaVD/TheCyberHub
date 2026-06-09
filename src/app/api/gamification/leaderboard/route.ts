import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Создаём клиент Supabase для работы с куками запроса
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Для публичного эндпоинта установка кук не требуется
        },
      },
    }
  );

  // Получаем параметры пагинации из URL
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  // Запрос к таблице user_gamification с JOIN на profiles
  const { data, error, count } = await supabase
    .from('user_gamification')
    .select(
      `
      user_id,
      xp,
      level,
      profiles!inner (
        username,
        avatar_url
      )
    `,
      { count: 'exact' }
    )
    .order('xp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Формируем массив записей с рангом
  const entries = (data || []).map((item: any, idx: number) => ({
    rank: offset + idx + 1,
    userId: item.user_id,
    username: item.profiles.username,
    avatarUrl: item.profiles.avatar_url,
    level: item.level,
    xp: item.xp,
  }));

  // Возвращаем ответ с пагинацией
  return NextResponse.json({
    data: entries,
    pagination: {
      page,
      limit,
      total: count || 0,
    },
  });
}