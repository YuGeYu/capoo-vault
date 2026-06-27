UPDATE announcements
SET sort_order = -1000,
    updated_at = datetime('now')
WHERE id = 'notice_20260627_site_updates';
