'use client';

import { useUserGamification, useAchievements, useXpHistory } from '@/hooks/useGamification';
import { LevelProgress } from '@/components/gamification/LevelProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Flame, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Achievement, UserAchievement } from '@/types/gamification';

interface GamificationTabProps {
  userId: string;
}

type AchievementWithStatus = Achievement & {
  earned: boolean;
  earnedAt: Date | null;
  progress: number;
};

export function GamificationTab({ userId }: GamificationTabProps) {
  const { data: gam, isLoading: gamLoading } = useUserGamification(userId);
  const { data: achievementsData, isLoading: achLoading } = useAchievements(userId);
  const { data: xpHistory } = useXpHistory(userId, 10);

  // Приводим данные к единому формату
  const achievements: AchievementWithStatus[] = (() => {
    if (!achievementsData) return [];
    if (Array.isArray(achievementsData)) {
      return achievementsData as AchievementWithStatus[];
    }
    if ('all' in achievementsData && 'earned' in achievementsData) {
      const earnedMap = new Map(
        (achievementsData.earned || []).map((e: UserAchievement) => [e.achievementId, e])
      );
      return (achievementsData.all || []).map((ach: Achievement) => ({
        ...ach,
        earned: earnedMap.has(ach.id),
        earnedAt: earnedMap.get(ach.id)?.earnedAt || null,
        progress: earnedMap.get(ach.id)?.progress || 0,
      }));
    }
    return [];
  })();

  if (gamLoading || achLoading) return <div className="p-4">Loading gamification...</div>;
  if (!gam) return <div className="p-4">No gamification data</div>;

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Level {gam.level}</CardTitle>
        </CardHeader>
        <CardContent>
          <LevelProgress xp={gam.xp} level={gam.level} showDetails={true} />
          <div className="flex justify-between mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Flame className="h-4 w-4" /> Streak: {gam.streak} days</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Total XP: {gam.totalXpEarned}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Achievements
            <Badge variant="secondary">{earnedCount}/{totalCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="earned">Earned</TabsTrigger>
              <TabsTrigger value="locked">Locked</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(ach => <AchievementCard key={ach.id} achievement={ach} />)}
            </TabsContent>
            <TabsContent value="earned">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.filter(a => a.earned).map(ach => <AchievementCard key={ach.id} achievement={ach} />)}
              </div>
            </TabsContent>
            <TabsContent value="locked">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.filter(a => !a.earned).map(ach => <AchievementCard key={ach.id} achievement={ach} />)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent XP Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {xpHistory?.map(entry => (
              <div key={entry.id} className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{entry.source}</p>
                  <p className="text-xs text-muted-foreground">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</p>
                </div>
                <span className="font-bold text-green-600">+{entry.amount}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AchievementCardProps {
  achievement: AchievementWithStatus;
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const target = (achievement.requirements as any)?.target;
  const progressPercent = target ? (achievement.progress / target) * 100 : 0;
  return (
    <div className={`border rounded-lg p-3 ${achievement.earned ? 'bg-muted/50' : 'opacity-80'}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{achievement.icon}</div>
        <div className="flex-1">
          <div className="font-semibold">{achievement.name}</div>
          <div className="text-sm text-muted-foreground">{achievement.description}</div>
          <div className="flex justify-between items-center mt-2">
            <Badge variant="outline" className="text-xs">{achievement.tier}</Badge>
            <span className="text-xs text-green-600">+{achievement.xpReward} XP</span>
          </div>
          {!achievement.earned && target && (
            <div className="mt-2">
              <Progress value={progressPercent} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">{achievement.progress} / {target}</p>
            </div>
          )}
          {achievement.earned && achievement.earnedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Earned {formatDistanceToNow(new Date(achievement.earnedAt), { addSuffix: true })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}