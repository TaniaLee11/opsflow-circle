-- Create integration_catalog table for dynamic integration management
CREATE TABLE IF NOT EXISTS integration_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  category TEXT NOT NULL,
  oauth_provider TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  popular BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_integration_catalog_category ON integration_catalog(category);
CREATE INDEX IF NOT EXISTS idx_integration_catalog_popular ON integration_catalog(popular);
CREATE INDEX IF NOT EXISTS idx_integration_catalog_enabled ON integration_catalog(enabled);

-- Create integration_requests table for user requests
CREATE TABLE IF NOT EXISTS integration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_name TEXT NOT NULL,
  integration_url TEXT,
  use_case TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on user_id and status
CREATE INDEX IF NOT EXISTS idx_integration_requests_user ON integration_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_requests_status ON integration_requests(status);

-- Enable RLS
ALTER TABLE integration_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integration_catalog (read-only for all authenticated users)
CREATE POLICY "Anyone can view enabled integrations"
  ON integration_catalog FOR SELECT
  TO authenticated
  USING (enabled = true);

-- RLS Policies for integration_requests
CREATE POLICY "Users can view their own requests"
  ON integration_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests"
  ON integration_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests"
  ON integration_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_integration_catalog_updated_at
  BEFORE UPDATE ON integration_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_requests_updated_at
  BEFORE UPDATE ON integration_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
