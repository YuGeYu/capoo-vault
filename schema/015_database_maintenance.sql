DROP INDEX IF EXISTS idx_sessions_token_hash;

CREATE TABLE IF NOT EXISTS database_monthly_metrics (
  month TEXT PRIMARY KEY,
  measured_at TEXT NOT NULL,
  database_size_bytes INTEGER NOT NULL,
  assets_count INTEGER NOT NULL,
  sessions_count INTEGER NOT NULL,
  expired_sessions_before_cleanup INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
