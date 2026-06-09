// Логика расчёта XP и уровней

import { LEVEL_FORMULA } from './constants';

/**
 * Вычисляет необходимый XP для достижения указанного уровня
 * @param level - целевой уровень (1-100)
 * @returns количество XP, необходимое для перехода с 0 XP на этот уровень
 */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return LEVEL_FORMULA.BASE_XP;
  let xp = 0;
  for (let i = 1; i < level; i++) {
    xp += Math.floor(LEVEL_FORMULA.BASE_XP * Math.pow(LEVEL_FORMULA.GROWTH_FACTOR, i - 1));
  }
  return xp;
}

/**
 * Вычисляет уровень по текущему XP
 * @param xp - текущее количество опыта
 * @returns уровень (1..MAX_LEVEL)
 */
export function getLevelFromXp(xp: number): number {
  let level = 1;
  let required = LEVEL_FORMULA.BASE_XP;
  let accumulated = 0;
  while (xp >= accumulated + required && level < LEVEL_FORMULA.MAX_LEVEL) {
    accumulated += required;
    level++;
    required = Math.floor(LEVEL_FORMULA.BASE_XP * Math.pow(LEVEL_FORMULA.GROWTH_FACTOR, level - 1));
  }
  return level;
}

/**
 * Возвращает XP, накопленные в текущем уровне, и XP, необходимые для следующего уровня
 */
export function getCurrentLevelProgress(xp: number): {
  currentLevelXp: number;
  xpNeededForNextLevel: number;
  level: number;
  progressPercent: number;
} {
  const level = getLevelFromXp(xp);
  const xpForCurrentLevel = xpRequiredForLevel(level);
  const xpForNextLevel = xpRequiredForLevel(level + 1);
  const currentLevelXp = xp - (level === 1 ? 0 : xpRequiredForLevel(level));
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = Math.min(100, (currentLevelXp / xpNeeded) * 100);
  return {
    currentLevelXp,
    xpNeededForNextLevel: xpNeeded,
    level,
    progressPercent: isNaN(progressPercent) ? 0 : progressPercent,
  };
}