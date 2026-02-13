-- Stripe Financial Integration Tables
-- Purpose: Store user financial data from Stripe Connect and platform SaaS metrics

-- 1. User Financial Summary (from Stripe Connect)
CREATE TABLE IF NOT EXISTS user_financial_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  provider TEXT DEFAULT 'stripe_connect',
  
  -- Revenue metrics
  total_revenue_30d NUMERIC DEFAULT 0,
  total_revenue_90d NUMERIC DEFAULT 0,
  total_revenue_ytd NUMERIC DEFAULT 0,
  
  -- Invoice metrics
  outstanding_invoices INTEGER DEFAULT 0,
  overdue_invoices INTEGER DEFAULT 0,
  overdue_amount NUMERIC DEFAULT 0,
  
  -- Transaction data
  recent_charges JSONB DEFAULT '[]'::jsonb,        -- last 10 transactions
  monthly_trend JSONB DEFAULT '[]'::jsonb,         -- [{month, revenue, expenses}]
  
  -- Health indicators
  cash_flow_status TEXT DEFAULT 'unknown',         -- 'healthy', 'warning', 'critical'
  payout_schedule JSONB DEFAULT '{}'::jsonb,
  
  -- Stripe Connect data
  stripe_account_id TEXT,
  stripe_account_type TEXT,                        -- 'standard', 'express', 'custom'
  
  -- Sync tracking
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'pending',              -- 'pending', 'syncing', 'success', 'error'
  sync_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Platform Metrics (Owner SaaS Analytics)
CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  
  -- Subscription metrics
  mrr NUMERIC DEFAULT 0,                           -- Monthly Recurring Revenue
  total_subscribers INTEGER DEFAULT 0,
  subscribers_by_tier JSONB DEFAULT '{}'::jsonb,   -- {"free": 50, "assistant": 12, ...}
  
  -- Growth metrics
  new_signups_week INTEGER DEFAULT 0,
  new_signups_month INTEGER DEFAULT 0,
  churn_count_month INTEGER DEFAULT 0,
  churn_rate NUMERIC DEFAULT 0,
  
  -- Revenue metrics
  failed_payments INTEGER DEFAULT 0,
  arpu NUMERIC DEFAULT 0,                          -- Average Revenue Per User
  revenue_by_tier JSONB DEFAULT '{}'::jsonb,       -- {"assistant": 479.88, ...}
  
  -- Customer health
  at_risk_subscribers JSONB DEFAULT '[]'::jsonb,   -- [{user_id, email, tier, reason}]
  ltv_estimate NUMERIC DEFAULT 0,                  -- Customer Lifetime Value
  
  -- Sync tracking
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Financial Transactions (detailed transaction log)
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Transaction details
  transaction_id TEXT NOT NULL,                    -- Stripe charge/payment ID
  transaction_type TEXT NOT NULL,                  -- 'charge', 'refund', 'payout', 'invoice'
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,                            -- 'succeeded', 'pending', 'failed'
  
  -- Related entities
  customer_id TEXT,
  customer_email TEXT,
  description TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  transaction_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE(user_id, transaction_id)
);

-- 4. Financial Alerts (VOPSy proactive alerts)
CREATE TABLE IF NOT EXISTS financial_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Alert details
  alert_type TEXT NOT NULL,                        -- 'overdue_invoice', 'low_cash_flow', 'unusual_charge', etc.
  severity TEXT NOT NULL,                          -- 'info', 'warning', 'critical'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Action tracking
  action_taken BOOLEAN DEFAULT FALSE,
  action_details TEXT,
  
  -- Status
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_financial_summary_user_id ON user_financial_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_date ON platform_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_alerts_user_id ON financial_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_alerts_dismissed ON financial_alerts(dismissed) WHERE NOT dismissed;

-- RLS Policies

-- user_financial_summary: Users can only see their own data
ALTER TABLE user_financial_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial summary"
  ON user_financial_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all financial summaries"
  ON user_financial_summary FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- platform_metrics: Only owner can view
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view platform metrics"
  ON platform_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.email = 'tania@virtualopsassist.com'
    )
  );

CREATE POLICY "Service role can manage platform metrics"
  ON platform_metrics FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- financial_transactions: Users can only see their own
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON financial_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions"
  ON financial_transactions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- financial_alerts: Users can view and dismiss their own
ALTER TABLE financial_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON financial_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON financial_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all alerts"
  ON financial_alerts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_financial_summary_updated_at
  BEFORE UPDATE ON user_financial_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
