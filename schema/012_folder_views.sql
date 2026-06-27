ALTER TABLE folders ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_folders_view_count ON folders(view_count);
