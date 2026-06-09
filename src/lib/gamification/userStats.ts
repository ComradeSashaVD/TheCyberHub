import { supabase } from '@/lib/supabaseClient';

export interface UserStats {
  totalSolvedChallenges: number;
  solvedByCategory: Record<string, number>;
  topicsCreated: number;
  solutionsMarked: number;
  friendsCount: number;
  followersCount: number;
  completedLearningPaths: number;
  readCheatsheets: number;
  eventsAttended: number;
  mentorSessionsAsMentor: number;
  mentorSessionsAsMentee: number;
  currentStreak: number;
  consecutiveChallengeDays: number;
  firstSolvesCount: number;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const [solvedRes, topicsRes, solutionsRes, friendsRes, followersRes, learningRes, cheatsheetsRes, eventsRes, mentorMentorRes, mentorMenteeRes, streakRes, firstSolvesRes] = await Promise.all([
    supabase.from('user_challenge_solves').select('challenge_id, challenges!inner(category)', { count: 'exact' }).eq('user_id', userId),
    supabase.from('forum_topics').select('id', { count: 'exact' }).eq('author_id', userId),
    supabase.from('forum_posts').select('id', { count: 'exact' }).eq('author_id', userId).eq('is_solution', true),
    supabase.from('friends').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
    supabase.from('user_learning_paths').select('id', { count: 'exact' }).eq('user_id', userId).eq('completed', true),
    supabase.from('user_cheatsheet_progress').select('id', { count: 'exact' }).eq('user_id', userId).eq('completed', true),
    supabase.from('event_participants').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('mentor_sessions').select('id', { count: 'exact' }).eq('mentor_id', userId).eq('status', 'completed'),
    supabase.from('mentor_sessions').select('id', { count: 'exact' }).eq('mentee_id', userId).eq('status', 'completed'),
    supabase.from('user_gamification').select('streak').eq('user_id', userId).single(),
    supabase.from('user_challenge_solves').select('id', { count: 'exact' }).eq('user_id', userId).eq('first_solve', true),
  ]);

  const solvedData = solvedRes.data || [];
  const solvedByCategory: Record<string, number> = {};
  solvedData.forEach((item: any) => {
    const cat = item.challenges?.category || 'unknown';
    solvedByCategory[cat] = (solvedByCategory[cat] || 0) + 1;
  });

  return {
    totalSolvedChallenges: solvedRes.count || 0,
    solvedByCategory,
    topicsCreated: topicsRes.count || 0,
    solutionsMarked: solutionsRes.count || 0,
    friendsCount: friendsRes.count || 0,
    followersCount: followersRes.count || 0,
    completedLearningPaths: learningRes.count || 0,
    readCheatsheets: cheatsheetsRes.count || 0,
    eventsAttended: eventsRes.count || 0,
    mentorSessionsAsMentor: mentorMentorRes.count || 0,
    mentorSessionsAsMentee: mentorMenteeRes.count || 0,
    currentStreak: streakRes.data?.streak || 0,
    consecutiveChallengeDays: 0,
    firstSolvesCount: firstSolvesRes.count || 0,
  };
}