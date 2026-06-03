CREATE TABLE IF NOT EXISTS ai_api_keys_multi (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO ai_api_keys_multi (
  id, user_id, key_hash, key_prefix, note, status, created_at, updated_at, last_used_at
)
SELECT
  id,
  user_id,
  key_hash,
  key_prefix,
  '',
  status,
  created_at,
  updated_at,
  last_used_at
FROM ai_api_keys;

DROP TABLE IF EXISTS ai_api_keys;
ALTER TABLE ai_api_keys_multi RENAME TO ai_api_keys;

CREATE INDEX IF NOT EXISTS idx_ai_api_keys_status ON ai_api_keys(status);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_user_id ON ai_api_keys(user_id);
