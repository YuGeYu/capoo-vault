CREATE TABLE IF NOT EXISTS folder_view_boosts (
  folder_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active')),
  started_at TEXT NOT NULL,
  base_real_view_count INTEGER NOT NULL DEFAULT 0,
  base_display_view_count INTEGER NOT NULL DEFAULT 0,
  target_display_view_count INTEGER NOT NULL,
  rate_per_hour INTEGER NOT NULL DEFAULT 12,
  created_by_user_id TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);
