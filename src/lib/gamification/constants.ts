// Константы для геймификации: XP за действия, множители и т.д.

export const XP_REWARDS = {
  CHALLENGE_SOLVE: {
    easy: 50,
    medium: 150,
    hard: 350,
    expert: 500,
  },
  BLOG_POST_CREATE: 30,
  LIKE_RECEIVED: 5,
  FORUM_TOPIC_CREATE: 20,
  FORUM_SOLUTION_MARK: 50,
  EVENT_PARTICIPATION: 100,
  LEARNING_PATH_COMPLETE: 200,
  DAILY_LOGIN_BASE: 10,
  FIRST_CHALLENGE_DAILY_BONUS: 25,
  STREAK_BONUS_MULTIPLIER: { // для ежедневного входа
    1: 1,
    2: 1.5,
    3: 2,
    4: 2.5,
    5: 3, // и для 5+
  },
  CONSECUTIVE_5_CHALLENGES_BONUS: 100,
} as const;

export const LEVEL_FORMULA = {
  BASE_XP: 100,
  GROWTH_FACTOR: 1.5,
  MAX_LEVEL: 100,
};

export const DAILY_LIKE_XP_LIMIT = 100;

export const LEADERBOARD_CACHE_TTL = 60 * 5; // 5 минут

// Достижения (определим позже, но константы для категорий)
export const ACHIEVEMENT_CATEGORIES = {
  CTF_MASTER: 'ctf_master',
  FORUM_ACTIVITY: 'forum_activity',
  SOCIAL: 'social',
  LEARNING: 'learning',
  SPECIAL: 'special',
  RARE: 'rare',
} as const;