import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Защита: проверка секретного ключа (для cron)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Создаём клиент Supabase для работы с куками (хотя в cron они не нужны)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Для cron-задач установка кук не требуется
        },
      },
    }
  );

  const today = new Date().toISOString().slice(0, 10);
  const weekStart = getWeekStartDate(today);

  // Получаем всех пользователей с их XP, сортируем по убыванию
  const { data: users, error } = await supabase
    .from('user_gamification')
    .select('user_id, xp')
    .order('xp', { ascending: false });

  if (error) {
    console.error('Snapshot error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!users || users.length === 0) {
    return NextResponse.json({ success: true, message: 'No users found' });
  }

  // Формируем снэпшоты с типами
  const snapshots = users.map((user: { user_id: string; xp: number }, idx: number) => ({
    user_id: user.user_id,
    rank: idx + 1,
    xp_total: user.xp,
    week_start_date: weekStart,
    calculated_at: new Date().toISOString(),
  }));

  // Удаляем старые снэпшоты за эту неделю
  const { error: deleteError } = await supabase
    .from('leaderboard_snapshots')
    .delete()
    .eq('week_start_date', weekStart);

  if (deleteError) {
    console.error('Delete error:', deleteError);
    // Продолжаем, возможно записей не было
  }

  // Вставляем новые снэпшоты
  const { error: insertError } = await supabase
    .from('leaderboard_snapshots')
    .insert(snapshots);

  if (insertError) {
    console.error('Insert error:', insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: snapshots.length });
}

// Вспомогательная функция: возвращает понедельник текущей недели в формате YYYY-MM-DD
function getWeekStartDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = воскресенье, 1 = понедельник...
  // Корректируем так, чтобы неделя начиналась с понедельника
  const diff = (day === 0 ? 6 : day - 1);
  date.setDate(date.getDate() - diff);
  return date.toISOString().slice(0, 10);
}