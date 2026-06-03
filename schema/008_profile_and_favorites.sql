ALTER TABLE users ADD COLUMN public_id INTEGER;

WITH ordered_users AS (
  SELECT
    id,
    10000 + ROW_NUMBER() OVER (ORDER BY datetime(created_at), username) AS next_public_id
  FROM users
  WHERE public_id IS NULL
)
UPDATE users
SET public_id = (
  SELECT next_public_id
  FROM ordered_users
  WHERE ordered_users.id = users.id
)
WHERE public_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id);

CREATE TABLE IF NOT EXISTS user_favorites (
  user_id TEXT NOT NULL,
  folder_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, folder_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_folder ON user_favorites(folder_id);
