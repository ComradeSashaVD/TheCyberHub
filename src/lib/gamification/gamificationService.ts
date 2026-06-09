import { supabase } from '@/lib/supabaseClient'; // синхронный клиент
import { UserGamification } from '@/types/gamification';
import { XP_REWARDS, DAILY_LIKE_XP_LIMIT } from './constants';
import { getLevelFromXp } from './xpCalculator';
import { getUserStats } from './userStats';

export class GamificationService {
  // Поле для доступа к Supabase (синхронный клиент)
  private supabase = supabase;

  async getUserGamification(userId: string): Promise<UserGamification | null> {
    const { data, error } = await this.supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    // Преобразование snake_case → camelCase
    return {
      userId: data.user_id,
      xp: data.xp,
      level: data.level,
      streak: data.streak,
      streakLastUpdated: data.streak_last_updated,
      totalXpEarned: data.total_xp_earned,
      dailyLikeXp: data.daily_like_xp,
      dailyLikeXpDate: data.daily_like_xp_date,
      lastXpGainedAt: data.last_xp_gained_at ? new Date(data.last_xp_gained_at) : null,
    };
  }

  async awardXp(
    userId: string,
    amount: number,
    source: string,
    description?: string,
    metadata?: any
  ): Promise<{ newXp: number; newLevel: number; levelUp: boolean }> {
    let gam = await this.getUserGamification(userId);
    if (!gam) {
      await this.supabase.from('user_gamification').insert({ user_id: userId });
      gam = await this.getUserGamification(userId);
      if (!gam) throw new Error('Failed to create gamification record');
    }

    const oldLevel = gam.level;
    const newXpTotal = gam.xp + amount;
    const newLevel = getLevelFromXp(newXpTotal);
    const levelUp = newLevel > oldLevel;

    await this.supabase
      .from('user_gamification')
      .update({
        xp: newXpTotal,
        level: newLevel,
        total_xp_earned: gam.totalXpEarned + amount,
        last_xp_gained_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    await this.supabase.from('xp_history').insert({
      user_id: userId,
      amount,
      source,
      description,
      metadata,
    });

    await this.checkAndUnlockAchievements(userId, source, metadata);
    return { newXp: newXpTotal, newLevel, levelUp };
  }

  async handleChallengeSolve(userId: string, challengeId: string, difficulty: string) {
    const xpReward = XP_REWARDS.CHALLENGE_SOLVE[difficulty as keyof typeof XP_REWARDS.CHALLENGE_SOLVE] || 50;
    return this.awardXp(userId, xpReward, 'challenge_solve', `Solved challenge ${challengeId}`, { challengeId, difficulty });
  }

  async handleDailyLogin(userId: string): Promise<{ xpGained: number; streak: number }> {
    const gam = await this.getUserGamification(userId);
    if (!gam) throw new Error('User gamification not found');

    const today = new Date().toISOString().slice(0, 10);
    const lastDate = gam.streakLastUpdated;
    let newStreak = gam.streak;
    let multiplier = 1;

    if (lastDate === today) return { xpGained: 0, streak: newStreak };
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate === yesterday) newStreak += 1;
    else newStreak = 1;

    if (newStreak >= 5) multiplier = 3;
    else multiplier = [1, 1.5, 2, 2.5][newStreak - 1] || 1;

    const xpGained = Math.floor(XP_REWARDS.DAILY_LOGIN_BASE * multiplier);
    await this.supabase
      .from('user_gamification')
      .update({ streak: newStreak, streak_last_updated: today })
      .eq('user_id', userId);

    await this.awardXp(userId, xpGained, 'daily_login', `Daily login streak ${newStreak}`, { streak: newStreak });
    return { xpGained, streak: newStreak };
  }

  async handleLikeReceived(userId: string, postAuthorId: string): Promise<number> {
    if (userId === postAuthorId) return 0;
    const gam = await this.getUserGamification(postAuthorId);
    if (!gam) return 0;
    const today = new Date().toISOString().slice(0, 10);
    let dailyLikeXp = gam.dailyLikeXp;
    let dailyLikeXpDate = gam.dailyLikeXpDate;

    if (dailyLikeXpDate !== today) {
      dailyLikeXp = 0;
      dailyLikeXpDate = today;
    }
    if (dailyLikeXp >= DAILY_LIKE_XP_LIMIT) return 0;

    const xpToAdd = XP_REWARDS.LIKE_RECEIVED;
    const newDaily = Math.min(dailyLikeXp + xpToAdd, DAILY_LIKE_XP_LIMIT);
    await this.supabase
      .from('user_gamification')
      .update({ daily_like_xp: newDaily, daily_like_xp_date: today })
      .eq('user_id', postAuthorId);

    await this.awardXp(postAuthorId, xpToAdd, 'like_received', 'Received like on post', { fromUserId: userId });
    return xpToAdd;
  }

  async checkAndUnlockAchievements(userId: string, source: string, metadata?: any): Promise<string[]> {
    // 1. Получаем все достижения
    const { data: allAchievements } = await this.supabase.from('achievements').select('*');
    if (!allAchievements) return [];

    // 2. Получаем уже разблокированные
    const { data: earned } = await this.supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
    const earnedIds = new Set(earned?.map((e: { achievement_id: string }) => e.achievement_id) || []);

    // 3. Получаем статистику пользователя
    const stats = await getUserStats(userId);

    const newlyUnlocked: string[] = [];

    for (const ach of allAchievements) {
      if (earnedIds.has(ach.id)) continue;

      const req = ach.requirements as any;
      let progress = 0;
      let achieved = false;

      switch (req.type) {
        case 'solve_challenges':
          progress = stats.totalSolvedChallenges;
          achieved = progress >= req.target;
          break;
        case 'solve_challenges_category':
          const cat = req.additional?.category;
          progress = stats.solvedByCategory[cat] || 0;
          achieved = progress >= req.target;
          break;
        case 'create_topics':
          progress = stats.topicsCreated;
          achieved = progress >= req.target;
          break;
        case 'solution_marked':
          progress = stats.solutionsMarked;
          achieved = progress >= req.target;
          break;
        case 'add_friends':
          progress = stats.friendsCount;
          achieved = progress >= req.target;
          break;
        case 'followers':
          progress = stats.followersCount;
          achieved = progress >= req.target;
          break;
        case 'complete_learning_paths':
          progress = stats.completedLearningPaths;
          achieved = progress >= req.target;
          break;
        case 'read_cheatsheets':
          progress = stats.readCheatsheets;
          achieved = progress >= req.target;
          break;
        case 'event_participation':
          progress = stats.eventsAttended;
          achieved = progress >= req.target;
          break;
        case 'mentor_sessions':
          progress = stats.mentorSessionsAsMentor;
          achieved = progress >= req.target;
          break;
        case 'mentee_session':
          progress = stats.mentorSessionsAsMentee;
          achieved = progress >= req.target;
          break;
        case 'streak_days':
          progress = stats.currentStreak;
          achieved = progress >= req.target;
          break;
        case 'first_solve_challenge':
          if (metadata?.challengeId && metadata?.firstSolve === true) {
            achieved = true;
            progress = 1;
          }
          break;
        default:
          achieved = false;
      }

      if (achieved) {
        await this.supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: ach.id,
          progress: req.target,
          earned_at: new Date().toISOString(),
        });
        await this.awardXp(userId, ach.xp_reward, 'achievement_unlocked', `Unlocked achievement: ${ach.name}`, { achievementId: ach.id });
        newlyUnlocked.push(ach.id);
      }
    }
    return newlyUnlocked;
  }
}

export const gamificationService = new GamificationService();