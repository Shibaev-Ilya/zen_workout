-- Таблица повторных максимумов (1RM)

CREATE TABLE IF NOT EXISTS sporttracker_one_rm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sporttracker_users(id) ON DELETE CASCADE,
    exercise_name VARCHAR(255) NOT NULL,
    one_rm NUMERIC(10, 2) NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, exercise_name)
);

CREATE INDEX IF NOT EXISTS idx_one_rm_user ON sporttracker_one_rm(user_id, exercise_name);
