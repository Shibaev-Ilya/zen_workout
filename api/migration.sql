CREATE TABLE IF NOT EXISTS sporttracker_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    login VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sporttracker_trainings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES sporttracker_users(id) ON DELETE CASCADE,
    exercises JSONB NOT NULL,
    duration INTEGER NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sporttracker_custom_exercises (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES sporttracker_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS sporttracker_one_rm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sporttracker_users(id) ON DELETE CASCADE,
    exercise_name VARCHAR(255) NOT NULL,
    one_rm NUMERIC(10, 2) NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, exercise_name)
);

CREATE INDEX IF NOT EXISTS idx_trainings_user ON sporttracker_trainings(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_one_rm_user ON sporttracker_one_rm(user_id, exercise_name);
