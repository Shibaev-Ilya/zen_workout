-- Миграция с device-token на логин/пароль.
-- Внимание: старые пользователи без login станут недоступны —
-- их нужно зарегистрировать заново или проставить login/password_hash вручную.

ALTER TABLE sporttracker_users ADD COLUMN IF NOT EXISTS login VARCHAR(64);
ALTER TABLE sporttracker_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Удаляем старых пользователей без логина (и каскадом их данные)
DELETE FROM sporttracker_users WHERE login IS NULL OR password_hash IS NULL;

ALTER TABLE sporttracker_users ALTER COLUMN login SET NOT NULL;
ALTER TABLE sporttracker_users ALTER COLUMN password_hash SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'sporttracker_users_login_key'
    ) THEN
        ALTER TABLE sporttracker_users ADD CONSTRAINT sporttracker_users_login_key UNIQUE (login);
    END IF;
END $$;

ALTER TABLE sporttracker_users DROP COLUMN IF EXISTS token;
