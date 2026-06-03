CREATE TABLE IF NOT EXISTS remove_bg_memberships (
  user_id TEXT PRIMARY KEY,
  plan_code TEXT NOT NULL DEFAULT 'remove_bg_member',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TEXT NOT NULL,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS remove_bg_daily_usage (
  user_id TEXT NOT NULL,
  usage_date TEXT NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  last_download_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, usage_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_remove_bg_memberships_status ON remove_bg_memberships(status);
CREATE INDEX IF NOT EXISTS idx_remove_bg_daily_usage_date ON remove_bg_daily_usage(usage_date);
