import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { gamificationService } from '@/lib/gamification/gamificationService';
import { z } from 'zod';

// Схема валидации для POST-запроса
const awardXpSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive(),
  source: z.string(),
  description: z.string().optional(),
  metadata: z.any().optional(),
});

export async function GET(request: NextRequest) {
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

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Получение данных геймификации текущего пользователя (если нужно)
  const { data, error } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: user.id, gamification: data || null }, { status: 200 });
}

export async function POST(request: NextRequest) {
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

  // 1. Аутентификация
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Проверка прав администратора
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Валидация входных данных
  const body = await request.json();
  const parsed = awardXpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error },
      { status: 400 }
    );
  }

  const { userId, amount, source, description, metadata } = parsed.data;

  // 4. Rate limiting (ключ на основе userId администратора? Лучше на основе userId, кому начисляем)
  const limitKey = `xp:admin:${user.id}:user:${userId}`;
  const { allowed, reset } = rateLimit(limitKey);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests, try later' },
      { status: 429, headers: { 'X-RateLimit-Reset': reset.toString() } }
    );
  }

  // 5. Начисление XP через сервис
  try {
    const result = await gamificationService.awardXp(
      userId,
      amount,
      source,
      description,
      metadata
    );
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('XP award error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}