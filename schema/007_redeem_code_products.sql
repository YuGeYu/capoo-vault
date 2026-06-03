ALTER TABLE remove_bg_redeem_codes ADD COLUMN product_code TEXT NOT NULL DEFAULT 'remove_bg_member_monthly';
ALTER TABLE remove_bg_redeem_codes ADD COLUMN amount TEXT NOT NULL DEFAULT '0.000';
ALTER TABLE remove_bg_redeem_codes ADD COLUMN duration_days INTEGER NOT NULL DEFAULT 30;

CREATE INDEX IF NOT EXISTS idx_remove_bg_redeem_codes_product ON remove_bg_redeem_codes(product_code);
