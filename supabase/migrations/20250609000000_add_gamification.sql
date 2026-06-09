-- Таблица геймификации пользователей
CREATE TABLE IF NOT EXISTS user_gamification (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  streak_last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  daily_like_xp INTEGER NOT NULL DEFAULT 0,
  daily_like_xp_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_xp_gained_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица достижений (предзаполним)
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('common', 'rare', 'epic', 'legendary')),
  category TEXT NOT NULL,
  requirements JSONB NOT NULL,
  xp_reward INTEGER NOT NULL
);

-- Таблица пользовательских достижений
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, achievement_id)
);

-- Таблица истории XP
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица снэпшотов лидерборда
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  xp_total INTEGER NOT NULL,
  week_start_date DATE NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, week_start_date)
);

-- Индексы для производительности
CREATE INDEX idx_user_gamification_xp ON user_gamification(xp DESC);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_xp_history_user_created ON xp_history(user_id, created_at DESC);
CREATE INDEX idx_leaderboard_snapshots_week_rank ON leaderboard_snapshots(week_start_date, rank);

-- Функция автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON user_gamification
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка достижений (данные из achievements.ts)
INSERT INTO achievements (id, name, description, icon, tier, category, requirements, xp_reward) VALUES
('ctf_novice', 'CTF Novice', 'Решите 5 челленджей', 'Trophy', 'common', 'ctf_master', '{"type": "solve_challenges", "target": 5}', 50),
('ctf_expert', 'CTF Expert', 'Решите 25 челленджей', 'Award', 'rare', 'ctf_master', '{"type": "solve_challenges", "target": 25}', 150),
('ctf_master', 'CTF Master', 'Решите 100 челленджей', 'Medal', 'epic', 'ctf_master', '{"type": "solve_challenges", "target": 100}', 500),
('ctf_legend', 'CTF Legend', 'Решите 500 челленджей', 'Crown', 'legendary', 'ctf_master', '{"type": "solve_challenges", "target": 500}', 2000),
('web_hacker', 'Web Hacker', 'Решите 10 Web челленджей', 'Globe', 'rare', 'ctf_master', '{"type": "solve_challenges_category", "target": 10, "additional": {"category": "web"}}', 100),
('crypto_breaker', 'Crypto Breaker', 'Решите 10 Crypto челленджей', 'Lock', 'rare', 'ctf_master', '{"type": "solve_challenges_category", "target": 10, "additional": {"category": "crypto"}}', 100),
('pwner', 'Pwner', 'Решите 10 Pwn челленджей', 'Terminal', 'rare', 'ctf_master', '{"type": "solve_challenges_category", "target": 10, "additional": {"category": "pwn"}}', 100),
('reverse_engineer', 'Reverse Engineer', 'Решите 10 Reverse челленджей', 'Code', 'rare', 'ctf_master', '{"type": "solve_challenges_category", "target": 10, "additional": {"category": "reverse"}}', 100),
('forensics_expert', 'Forensics Expert', 'Решите 10 Forensics челленджей', 'Search', 'rare', 'ctf_master', '{"type": "solve_challenges_category", "target": 10, "additional": {"category": "forensics"}}', 100),
('first_topic', 'First Topic', 'Создайте свою первую тему на форуме', 'MessageSquare', 'common', 'forum_activity', '{"type": "create_topics", "target": 1}', 20),
('prolific_poster', 'Prolific Poster', 'Создайте 20 тем на форуме', 'MessagesSquare', 'rare', 'forum_activity', '{"type": "create_topics", "target": 20}', 150),
('forum_legend', 'Forum Legend', 'Создайте 100 тем', 'Megaphone', 'epic', 'forum_activity', '{"type": "create_topics", "target": 100}', 500),
('helpful_member', 'Helpful Member', 'Ваш ответ отмечен как решение 5 раз', 'CheckCircle', 'rare', 'forum_activity', '{"type": "solution_marked", "target": 5}', 100),
('super_helpful', 'Super Helpful', 'Ваш ответ отмечен как решение 25 раз', 'Heart', 'epic', 'forum_activity', '{"type": "solution_marked", "target": 25}', 300),
('friendly', 'Friendly', 'Добавьте 5 друзей', 'Users', 'common', 'social', '{"type": "add_friends", "target": 5}', 50),
('popular', 'Popular', 'Получите 20 подписчиков', 'UserPlus', 'rare', 'social', '{"type": "followers", "target": 20}', 100),
('influencer', 'Influencer', 'Получите 100 подписчиков', 'Star', 'epic', 'social', '{"type": "followers", "target": 100}', 300),
('eager_learner', 'Eager Learner', 'Завершите 1 Learning Path', 'BookOpen', 'common', 'learning', '{"type": "complete_learning_paths", "target": 1}', 50),
('dedicated_student', 'Dedicated Student', 'Завершите 5 Learning Paths', 'GraduationCap', 'rare', 'learning', '{"type": "complete_learning_paths", "target": 5}', 200),
('scholar', 'Scholar', 'Прочитайте 20 Cheatsheets', 'Library', 'epic', 'learning', '{"type": "read_cheatsheets", "target": 20}', 150),
('event_participant', 'Event Participant', 'Примите участие в мероприятии', 'Calendar', 'common', 'special', '{"type": "event_participation", "target": 1}', 50),
('event_junkie', 'Event Junkie', 'Примите участие в 10 мероприятиях', 'Ticket', 'rare', 'special', '{"type": "event_participation", "target": 10}', 200),
('mentor_apprentice', 'Mentor Apprentice', 'Завершите сессию в качестве ученика', 'School', 'common', 'special', '{"type": "mentee_session", "target": 1}', 50),
('mentor_hero', 'Mentor Hero', 'Проведите 10 сессий в качестве ментора', 'Shield', 'epic', 'special', '{"type": "mentor_sessions", "target": 10}', 500),
('first_blood', 'First Blood', 'Первым решите новый челлендж', 'Sword', 'legendary', 'rare', '{"type": "first_solve_challenge", "target": 1}', 1000),
('bug_hunter', 'Bug Hunter', 'Найдите баг на платформе', 'Bug', 'legendary', 'rare', '{"type": "report_bug", "target": 1}', 1500),
('streak_master', 'Streak Master', '30 дней ежедневных входов подряд', 'Flame', 'epic', 'special', '{"type": "streak_days", "target": 30}', 500),
('challenge_consecutive', 'Challenge Streak', 'Решите 5 CTF подряд без пропуска дней', 'Zap', 'rare', 'ctf_master', '{"type": "consecutive_challenges", "target": 5}', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  tier = EXCLUDED.tier,
  category = EXCLUDED.category,
  requirements = EXCLUDED.requirements,
  xp_reward = EXCLUDED.xp_reward;

-- Функция для инициализации записи геймификации при создании профиля (триггер)
CREATE OR REPLACE FUNCTION init_user_gamification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_gamification (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_profile_insert
AFTER INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION init_user_gamification();

-- Создаем запись для существующих пользователей (если нет)
INSERT INTO user_gamification (user_id)
SELECT id FROM profiles WHERE id NOT IN (SELECT user_id FROM user_gamification);