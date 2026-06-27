CREATE INDEX IF NOT EXISTS idx_folders_status_updated_at ON folders(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_folders_owner_updated_at ON folders(owner_user_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_assets_folder_sort_created ON assets(folder_id, sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_review_logs_folder_created ON review_logs(folder_id, created_at);
