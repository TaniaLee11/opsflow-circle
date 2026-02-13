-- Component 1: Compliance Intelligence Engine
-- The architecture powering VOPSy's compliance interpretation
-- Created: February 13, 2026

-- Regulatory rule framework
CREATE TABLE IF NOT EXISTS compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_category TEXT CHECK (rule_category IN ('tax', 'payroll', 'licensing', 'nonprofit', 'entity', 'reporting')),
  entity_types TEXT[] NOT NULL, -- ['llc', 's_corp', '501c3', 'sole_prop', 'partnership']
  jurisdiction TEXT DEFAULT 'federal', -- federal, state:NY, etc.
  description TEXT NOT NULL,
  threshold_logic JSONB, -- conditions that trigger this rule
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical', 'escalation')),
  effective_date DATE,
  expiration_date DATE,
  source_reference TEXT, -- IRS code, state statute, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User compliance profile
CREATE TABLE IF NOT EXISTS user_compliance_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  state TEXT NOT NULL,
  industry TEXT,
  has_employees BOOLEAN DEFAULT false,
  employee_count INTEGER DEFAULT 0,
  is_nonprofit BOOLEAN DEFAULT false,
  tax_year_end TEXT DEFAULT 'december',
  quarterly_estimated_tax BOOLEAN DEFAULT false,
  grant_funded BOOLEAN DEFAULT false,
  licenses JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Compliance events tracked
CREATE TABLE IF NOT EXISTS compliance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES compliance_rules(id),
  event_type TEXT CHECK (event_type IN ('deadline', 'violation', 'warning', 'resolved', 'escalated')),
  description TEXT,
  due_date DATE,
  status TEXT CHECK (status IN ('upcoming', 'overdue', 'completed', 'escalated', 'waived')),
  resolved_by TEXT, -- 'ai', 'user', 'advisor', 'system'
  resolved_at TIMESTAMPTZ,
  cri_impact INTEGER, -- how many points this affects CRI score
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_compliance_rules_entity_types ON compliance_rules USING GIN(entity_types);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_category ON compliance_rules(rule_category);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_jurisdiction ON compliance_rules(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_user_compliance_profile_user_id ON user_compliance_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_events_user_id ON compliance_events(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_events_status ON compliance_events(status);
CREATE INDEX IF NOT EXISTS idx_compliance_events_due_date ON compliance_events(due_date);

-- Enable RLS
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_compliance_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compliance_rules (reference data, readable by all)
CREATE POLICY "Compliance rules readable by all authenticated users" ON compliance_rules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owner can manage compliance rules" ON compliance_rules
  FOR ALL USING (auth.email() = 'tanya@virtualopsassist.com');

-- RLS Policies for user_compliance_profile
CREATE POLICY "Users can view their own compliance profile" ON user_compliance_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own compliance profile" ON user_compliance_profile
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compliance profile" ON user_compliance_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can view all compliance profiles" ON user_compliance_profile
  FOR SELECT USING (auth.email() = 'tanya@virtualopsassist.com');

-- RLS Policies for compliance_events
CREATE POLICY "Users can view their own compliance events" ON compliance_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert compliance events" ON compliance_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own compliance events" ON compliance_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owner can view all compliance events" ON compliance_events
  FOR SELECT USING (auth.email() = 'tanya@virtualopsassist.com');
