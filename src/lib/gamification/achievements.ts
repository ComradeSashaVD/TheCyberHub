import { Achievement } from '@/types/gamification';

export const ACHIEVEMENTS_LIST: Achievement[] = [
  // CTF Master категория (многоуровневые)
  { id: 'ctf_novice', name: 'CTF Novice', description: 'Решите 5 челленджей', icon: 'Trophy', tier: 'common', category: 'ctf_master', requirements: { type: 'solve_challenges', target: 5 }, xpReward: 50 },
  { id: 'ctf_expert', name: 'CTF Expert', description: 'Решите 25 челленджей', icon: 'Award', tier: 'rare', category: 'ctf_master', requirements: { type: 'solve_challenges', target: 25 }, xpReward: 150 },
  { id: 'ctf_master', name: 'CTF Master', description: 'Решите 100 челленджей', icon: 'Medal', tier: 'epic', category: 'ctf_master', requirements: { type: 'solve_challenges', target: 100 }, xpReward: 500 },
  { id: 'ctf_legend', name: 'CTF Legend', description: 'Решите 500 челленджей', icon: 'Crown', tier: 'legendary', category: 'ctf_master', requirements: { type: 'solve_challenges', target: 500 }, xpReward: 2000 },
  // По категориям
  { id: 'web_hacker', name: 'Web Hacker', description: 'Решите 10 Web челленджей', icon: 'Globe', tier: 'rare', category: 'ctf_master', requirements: { type: 'solve_challenges_category', target: 10, additional: { category: 'web' } }, xpReward: 100 },
  { id: 'crypto_breaker', name: 'Crypto Breaker', description: 'Решите 10 Crypto челленджей', icon: 'Lock', tier: 'rare', category: 'ctf_master', requirements: { type: 'solve_challenges_category', target: 10, additional: { category: 'crypto' } }, xpReward: 100 },
  { id: 'pwner', name: 'Pwner', description: 'Решите 10 Pwn челленджей', icon: 'Terminal', tier: 'rare', category: 'ctf_master', requirements: { type: 'solve_challenges_category', target: 10, additional: { category: 'pwn' } }, xpReward: 100 },
  { id: 'reverse_engineer', name: 'Reverse Engineer', description: 'Решите 10 Reverse челленджей', icon: 'Code', tier: 'rare', category: 'ctf_master', requirements: { type: 'solve_challenges_category', target: 10, additional: { category: 'reverse' } }, xpReward: 100 },
  { id: 'forensics_expert', name: 'Forensics Expert', description: 'Решите 10 Forensics челленджей', icon: 'Search', tier: 'rare', category: 'ctf_master', requirements: { type: 'solve_challenges_category', target: 10, additional: { category: 'forensics' } }, xpReward: 100 },
  // Forum activity
  { id: 'first_topic', name: 'First Topic', description: 'Создайте свою первую тему на форуме', icon: 'MessageSquare', tier: 'common', category: 'forum_activity', requirements: { type: 'create_topics', target: 1 }, xpReward: 20 },
  { id: 'prolific_poster', name: 'Prolific Poster', description: 'Создайте 20 тем на форуме', icon: 'MessagesSquare', tier: 'rare', category: 'forum_activity', requirements: { type: 'create_topics', target: 20 }, xpReward: 150 },
  { id: 'forum_legend', name: 'Forum Legend', description: 'Создайте 100 тем', icon: 'Megaphone', tier: 'epic', category: 'forum_activity', requirements: { type: 'create_topics', target: 100 }, xpReward: 500 },
  { id: 'helpful_member', name: 'Helpful Member', description: 'Ваш ответ отмечен как решение 5 раз', icon: 'CheckCircle', tier: 'rare', category: 'forum_activity', requirements: { type: 'solution_marked', target: 5 }, xpReward: 100 },
  { id: 'super_helpful', name: 'Super Helpful', description: 'Ваш ответ отмечен как решение 25 раз', icon: 'Heart', tier: 'epic', category: 'forum_activity', requirements: { type: 'solution_marked', target: 25 }, xpReward: 300 },
  // Social
  { id: 'friendly', name: 'Friendly', description: 'Добавьте 5 друзей', icon: 'Users', tier: 'common', category: 'social', requirements: { type: 'add_friends', target: 5 }, xpReward: 50 },
  { id: 'popular', name: 'Popular', description: 'Получите 20 подписчиков', icon: 'UserPlus', tier: 'rare', category: 'social', requirements: { type: 'followers', target: 20 }, xpReward: 100 },
  { id: 'influencer', name: 'Influencer', description: 'Получите 100 подписчиков', icon: 'Star', tier: 'epic', category: 'social', requirements: { type: 'followers', target: 100 }, xpReward: 300 },
  // Learning
  { id: 'eager_learner', name: 'Eager Learner', description: 'Завершите 1 Learning Path', icon: 'BookOpen', tier: 'common', category: 'learning', requirements: { type: 'complete_learning_paths', target: 1 }, xpReward: 50 },
  { id: 'dedicated_student', name: 'Dedicated Student', description: 'Завершите 5 Learning Paths', icon: 'GraduationCap', tier: 'rare', category: 'learning', requirements: { type: 'complete_learning_paths', target: 5 }, xpReward: 200 },
  { id: 'scholar', name: 'Scholar', description: 'Прочитайте 20 Cheatsheets', icon: 'Library', tier: 'epic', category: 'learning', requirements: { type: 'read_cheatsheets', target: 20 }, xpReward: 150 },
  // Special
  { id: 'event_participant', name: 'Event Participant', description: 'Примите участие в мероприятии', icon: 'Calendar', tier: 'common', category: 'special', requirements: { type: 'event_participation', target: 1 }, xpReward: 50 },
  { id: 'event_junkie', name: 'Event Junkie', description: 'Примите участие в 10 мероприятиях', icon: 'Ticket', tier: 'rare', category: 'special', requirements: { type: 'event_participation', target: 10 }, xpReward: 200 },
  { id: 'mentor_apprentice', name: 'Mentor Apprentice', description: 'Завершите сессию в качестве ученика', icon: 'School', tier: 'common', category: 'special', requirements: { type: 'mentee_session', target: 1 }, xpReward: 50 },
  { id: 'mentor_hero', name: 'Mentor Hero', description: 'Проведите 10 сессий в качестве ментора', icon: 'Shield', tier: 'epic', category: 'special', requirements: { type: 'mentor_sessions', target: 10 }, xpReward: 500 },
  // Rare
  { id: 'first_blood', name: 'First Blood', description: 'Первым решите новый челлендж', icon: 'Sword', tier: 'legendary', category: 'rare', requirements: { type: 'first_solve_challenge', target: 1 }, xpReward: 1000 },
  { id: 'bug_hunter', name: 'Bug Hunter', description: 'Найдите баг на платформе', icon: 'Bug', tier: 'legendary', category: 'rare', requirements: { type: 'report_bug', target: 1 }, xpReward: 1500 },
  { id: 'streak_master', name: 'Streak Master', description: '30 дней ежедневных входов подряд', icon: 'Flame', tier: 'epic', category: 'special', requirements: { type: 'streak_days', target: 30 }, xpReward: 500 },
  { id: 'challenge_consecutive', name: 'Challenge Streak', description: 'Решите 5 CTF подряд без пропуска дней', icon: 'Zap', tier: 'rare', category: 'ctf_master', requirements: { type: 'consecutive_challenges', target: 5 }, xpReward: 100 },
];