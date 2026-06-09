export type AchievementTier = 'common' | 'rare' | 'epic' | 'legendary';
export type AchievementCategory = 
  | 'ctf_master' 
  | 'forum_activity' 
  | 'social' 
  | 'learning' 
  | 'special' 
  | 'rare';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // имя иконки из lucide или другой библиотеки
  tier: AchievementTier;
  category: AchievementCategory;
  requirements: AchievementRequirement;
  xpReward: number;
}

export interface AchievementRequirement {
  type: string; // 'solve_challenges', 'create_topics', 'streak_days', etc.
  target: number;
  additional?: Record<string, any>; // для категорий челленджей и т.п.
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  earnedAt: Date;
  progress: number; // текущий прогресс (0..target)
}

export interface UserGamification {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  streakLastUpdated: string; // YYYY-MM-DD
  totalXpEarned: number;
  dailyLikeXp: number;
  dailyLikeXpDate: string; // YYYY-MM-DD
  lastXpGainedAt: Date | null;
}

export interface XpHistoryEntry {
  id?: string;
  userId: string;
  amount: number;
  source: string; // 'challenge_solve', 'post_created', 'like_received', 'daily_login', ...
  description: string | null;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  xp: number; // или другой тип очков в зависимости от фильтра
  positionChange?: number; // изменение позиции за неделю
}

export type LeaderboardFilter = 'overall' | 'ctf' | 'forum' | 'events';
export type LeaderboardPeriod = 'all' | 'month' | 'week';