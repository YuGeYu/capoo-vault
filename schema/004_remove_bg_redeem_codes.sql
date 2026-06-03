CREATE TABLE IF NOT EXISTS remove_bg_redeem_codes (
  code TEXT PRIMARY KEY,
  product_code TEXT NOT NULL DEFAULT 'remove_bg_member_monthly',
  amount TEXT NOT NULL DEFAULT '0.000',
  duration_days INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed')),
  created_by_user_id TEXT,
  redeemed_by_user_id TEXT,
  redeemed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (redeemed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_remove_bg_redeem_codes_status ON remove_bg_redeem_codes(status);
CREATE INDEX IF NOT EXISTS idx_remove_bg_redeem_codes_redeemed_by ON remove_bg_redeem_codes(redeemed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_remove_bg_redeem_codes_product ON remove_bg_redeem_codes(product_code);
