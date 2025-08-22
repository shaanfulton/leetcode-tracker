CREATE TABLE IF NOT EXISTS problems (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  difficulty TEXT,
  tags TEXT[] DEFAULT '{}',
  minutes_to_solve INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


