CREATE TABLE IF NOT EXISTS billing_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'alipay',
  product_code TEXT NOT NULL DEFAULT 'remove_bg_member_monthly',
  subject TEXT NOT NULL,
  total_amount TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'closed', 'failed')),
  gateway_trade_no TEXT,
  paid_at TEXT,
  expires_at TEXT,
  meta_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_billing_orders_user_id ON billing_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_orders_status ON billing_orders(status);
