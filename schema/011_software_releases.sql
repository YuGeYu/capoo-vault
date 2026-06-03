CREATE TABLE IF NOT EXISTS software_releases (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'prod',
  version TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  items_json TEXT NOT NULL DEFAULT '[]',
  download_type TEXT NOT NULL DEFAULT 'quark',
  download_label TEXT NOT NULL DEFAULT '打开夸克网盘',
  download_url TEXT NOT NULL,
  download_code TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'recommended' CHECK (severity IN ('normal', 'recommended', 'critical')),
  is_active INTEGER NOT NULL DEFAULT 1,
  published_at TEXT NOT NULL,
  created_by_user_id TEXT,
  updated_by_user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(project_id, channel, version)
);

CREATE INDEX IF NOT EXISTS idx_software_releases_lookup
  ON software_releases(project_id, channel, is_active, published_at);
