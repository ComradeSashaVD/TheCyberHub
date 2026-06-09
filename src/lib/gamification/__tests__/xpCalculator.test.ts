import { describe, it, expect } from 'vitest';
import { xpRequiredForLevel, getLevelFromXp, getCurrentLevelProgress } from '../xpCalculator';

describe('xpCalculator', () => {
  it('calculates required XP for level 1', () => {
    expect(xpRequiredForLevel(1)).toBe(100);
  });
  it('calculates required XP for level 2', () => {
    expect(xpRequiredForLevel(2)).toBe(100 + 150); // 250
  });
  it('calculates required XP for level 3', () => {
    expect(xpRequiredForLevel(3)).toBe(100 + 150 + 225); // 475
  });
  it('gets level from XP', () => {
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(99)).toBe(1);
    expect(getLevelFromXp(100)).toBe(2);
    expect(getLevelFromXp(249)).toBe(2);
    expect(getLevelFromXp(250)).toBe(3);
    expect(getLevelFromXp(474)).toBe(3);
    expect(getLevelFromXp(475)).toBe(4);
  });
  it('returns current level progress', () => {
    const progress = getCurrentLevelProgress(150);
    expect(progress.level).toBe(2);
    expect(progress.currentLevelXp).toBe(50);
    expect(progress.xpNeededForNextLevel).toBe(150);
    expect(progress.progressPercent).toBeCloseTo(33.33, 1);
  });
});