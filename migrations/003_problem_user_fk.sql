ALTER TABLE problems
  ADD COLUMN IF NOT EXISTS user_id INTEGER,
  ADD CONSTRAINT fk_problems_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_problems_user_id ON problems(user_id);


