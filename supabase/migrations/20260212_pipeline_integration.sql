-- Pipeline Integration Tables
-- Supports GoHighLevel, HubSpot, Mailchimp, ActiveCampaign, Constant Contact, Klaviyo

-- Integrations table (if not exists)
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gohighlevel', 'hubspot', 'mailchimp', 'activecampaign', 'constantcontact', 'klaviyo', 'stripe', 'quickbooks', 'google_drive', 'gmail')),
  access_token TEXT,
  refresh_token TEXT,
  api_key TEXT,
  location_id TEXT,  -- For GoHighLevel sub-accounts
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error')),
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
  managed_by UUID REFERENCES auth.users(id),  -- owner's user_id
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'replaced_by_user', 'cancelled')),
  replaced_at TIMESTAMPTZ,                    -- when user connected their own tool
  replaced_by_provider TEXT,                  -- 'gohighlevel', 'hubspot', 'mailchimp', etc.
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline summary data (cached for fast loading)
CREATE TABLE IF NOT EXISTS pipeline_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  total_contacts INTEGER DEFAULT 0,
  total_deals INTEGER DEFAULT 0,
  total_campaigns INTEGER DEFAULT 0,
  active_campaigns INTEGER DEFAULT 0,
  emails_sent_30d INTEGER DEFAULT 0,
  emails_opened_30d INTEGER DEFAULT 0,
  emails_clicked_30d INTEGER DEFAULT 0,
  sms_sent_30d INTEGER DEFAULT 0,
  deals_won_30d INTEGER DEFAULT 0,
  deals_lost_30d INTEGER DEFAULT 0,
  revenue_30d DECIMAL(10,2) DEFAULT 0,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Pipeline contacts (simplified, synced from external CRM)
CREATE TABLE IF NOT EXISTS pipeline_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,  -- ID in the external system
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT,  -- lead, prospect, client, etc.
  tags TEXT[],
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, provider, external_id)
);

-- Pipeline deals/opportunities
CREATE TABLE IF NOT EXISTS pipeline_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  contact_id UUID REFERENCES pipeline_contacts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  value DECIMAL(10,2),
  stage TEXT,
  probability INTEGER,  -- 0-100
  expected_close_date DATE,
  status TEXT CHECK (status IN ('open', 'won', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, provider, external_id)
);

-- RLS Policies
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_deals ENABLE ROW LEVEL SECURITY;

-- Integrations: users can only see their own
CREATE POLICY "Users can view their own integrations" ON integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations" ON integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" ON integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" ON integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Owner can see all integrations
CREATE POLICY "Owner can view all integrations" ON integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'tania@virtualopsassist.com'
    )
  );

-- Managed pipeline: users can see their own, owner can see all
CREATE POLICY "Users can view their managed pipeline status" ON managed_pipeline
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = managed_by);

CREATE POLICY "Owner can manage pipeline assignments" ON managed_pipeline
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'tania@virtualopsassist.com'
    )
  );

-- Pipeline summary: users see their own, owner sees all
CREATE POLICY "Users can view their pipeline summary" ON pipeline_summary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Owner can view all pipeline summaries" ON pipeline_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'tania@virtualopsassist.com'
    )
  );

-- Pipeline contacts: users see their own
CREATE POLICY "Users can view their pipeline contacts" ON pipeline_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their pipeline contacts" ON pipeline_contacts
  FOR ALL USING (auth.uid() = user_id);

-- Pipeline deals: users see their own
CREATE POLICY "Users can view their pipeline deals" ON pipeline_deals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their pipeline deals" ON pipeline_deals
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_integrations_user_provider ON integrations(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_managed_pipeline_user ON managed_pipeline(user_id);
CREATE INDEX IF NOT EXISTS idx_managed_pipeline_managed_by ON managed_pipeline(managed_by);
CREATE INDEX IF NOT EXISTS idx_pipeline_summary_user ON pipeline_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_contacts_user ON pipeline_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_deals_user ON pipeline_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_deals_status ON pipeline_deals(user_id, status);
