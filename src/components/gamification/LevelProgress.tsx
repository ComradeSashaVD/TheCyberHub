'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentLevelProgress } from '@/lib/gamification/xpCalculator';

interface LevelProgressProps {
  xp: number;
  level: number;
  showDetails?: boolean;
}

export function LevelProgress({ xp, level, showDetails = true }: LevelProgressProps) {
  const { currentLevelXp, xpNeededForNextLevel, progressPercent } = getCurrentLevelProgress(xp);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Level {level}</span>
        {showDetails && (
          <span className="text-muted-foreground">
            {currentLevelXp} / {xpNeededForNextLevel} XP
          </span>
        )}
      </div>
      <Progress value={progressPercent} className="h-2" />
    </div>
  );
}