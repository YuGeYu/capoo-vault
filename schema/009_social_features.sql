PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS folder_likes (
  user_id TEXT NOT NULL,
  folder_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, folder_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_folder_likes_folder ON folder_likes(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_likes_user ON folder_likes(user_id);

CREATE TABLE IF NOT EXISTS user_follows (
  follower_user_id TEXT NOT NULL,
  following_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (follower_user_id, following_user_id),
  FOREIGN KEY (follower_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (follower_user_id != following_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_user_id);

CREATE TABLE IF NOT EXISTS folder_comments (
  id TEXT PRIMARY KEY,
  folder_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_folder_comments_folder ON folder_comments(folder_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_folder_comments_user ON folder_comments(user_id, created_at);
