-- GoHighLevel Pipeline Integration Tables

-- Integrations table (update if exists, create if not)
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  api_key TEXT,
  location_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Track which users are managed by owner's GHL
CREATE TABLE IF NOT EXISTS managed_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  ghl_sub_account_id TEXT,
  managed_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'replaced_by_user', 'cancelled')),
  replaced_at TIMESTAMPTZ,
  replaced_by_provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline summary data for fast loading
CREATE TABLE IF NOT EXISTS pipeline_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider TEXT NOT NULL,
  total_contacts INTEGER DEFAULT 0,
  total_deals INTEGER DEFAULT 0,
  open_deals INTEGER DEFAULT 0,
  won_deals INTEGER DEFAULT 0,
  lost_deals INTEGER DEFAULT 0,
  total_value DECIMAL(12,2) DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  sms_sent INTEGER DEFAULT 0,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integrations
CREATE POLICY "Users can view own integrations"
  ON integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON integrations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can view all integrations"
  ON integrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'tania@virtualopsassist.com'
    )
  );

-- RLS Policies for managed_pipeline
CREATE POLICY "Users can view own managed pipeline"
  ON managed_pipeline FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can view all managed pipelines"
  ON managed_pipeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'tania@virtualopsassist.com'
    )
  );

CREATE POLICY "Owner can manage all pipelines"
  ON managed_pipeline FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'tania@virtualopsassist.com'
    )
  );

-- RLS Policies for pipeline_summary
CREATE POLICY "Users can view own pipeline summary"
  ON pipeline_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can view all pipeline summaries"
  ON pipeline_summary FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'tania@virtualopsassist.com'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_integrations_user_provider ON integrations(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_managed_pipeline_user ON managed_pipeline(user_id);
CREATE INDEX IF NOT EXISTS idx_managed_pipeline_status ON managed_pipeline(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_summary_user ON pipeline_summary(user_id);
