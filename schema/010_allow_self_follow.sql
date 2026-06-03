PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS user_follows_next (
  follower_user_id TEXT NOT NULL,
  following_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (follower_user_id, following_user_id),
  FOREIGN KEY (follower_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO user_follows_next (follower_user_id, following_user_id, created_at)
SELECT follower_user_id, following_user_id, created_at
FROM user_follows;

DROP TABLE user_follows;

ALTER TABLE user_follows_next RENAME TO user_follows;

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_user_id);

PRAGMA foreign_keys = ON;
