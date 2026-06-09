import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { UserGamification, XpHistoryEntry, Achievement, UserAchievement } from '@/types/gamification';

export function useUserGamification(userId?: string) {
  return useQuery({
    queryKey: ['gamification', userId],
    queryFn: async () => {
      const res = await fetchApi(`/api/gamification/user/${userId}`);
      return res.json() as Promise<UserGamification>;
    },
    enabled: !!userId,
  });
}

export function useLeaderboard(filter: string = 'overall', period: string = 'all', page: number = 1) {
  return useQuery({
    queryKey: ['leaderboard', filter, period, page],
    queryFn: async () => {
      const res = await fetchApi(`/api/gamification/leaderboard?filter=${filter}&period=${period}&page=${page}`);
      return res.json();
    },
  });
}

export function useAchievements(userId?: string) {
  return useQuery({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      const res = await fetchApi(`/api/gamification/achievements?userId=${userId}`);
      return res.json() as Promise<{ all: Achievement[]; earned: UserAchievement[] }>;
    },
    enabled: !!userId,
  });
}

export function useXpHistory(userId?: string, limit: number = 20) {
  return useQuery({
    queryKey: ['xpHistory', userId, limit],
    queryFn: async () => {
      const res = await fetchApi(`/api/gamification/xp/history?userId=${userId}&limit=${limit}`);
      return res.json() as Promise<XpHistoryEntry[]>;
    },
    enabled: !!userId,
  });
}

export function useGamificationLeaderboard(
    filter: 'overall' | 'ctf' | 'forum' | 'events' = 'overall',
    period: 'all' | 'month' | 'week' = 'all',
    page: number = 1
) {
    return useQuery({
        queryKey: ['gamification-leaderboard', filter, period, page],
        queryFn: async () => {
            const res = await fetchApi(`/api/gamification/leaderboard?filter=${filter}&period=${period}&page=${page}`);
            return res.json();
        },
    });
}