CREATE TABLE IF NOT EXISTS r2_monthly_metrics (
  month TEXT PRIMARY KEY,
  measured_at TEXT NOT NULL,
  object_count INTEGER NOT NULL,
  total_bytes INTEGER NOT NULL,
  referenced_count INTEGER NOT NULL,
  unreferenced_count INTEGER NOT NULL,
  unreferenced_bytes INTEGER NOT NULL,
  protected_unreferenced_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
