-- Component 3: Human-AI Escalation Governance Protocol
-- Defines when AI acts vs. when humans must intervene
-- Created: February 13, 2026

CREATE TABLE IF NOT EXISTS escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL, -- 'cri_threshold', 'deadline', 'tax_liability', 'audit', 'legal', 'payroll', 'grant'
  trigger_condition JSONB NOT NULL,
  -- Example: { "cri_score_below": 40 }
  -- Example: { "tax_liability_exceeds": 5000, "reserve_below": 2000 }
  -- Example: { "keyword_detected": ["audit", "IRS notice", "legal action"] }
  ai_authority TEXT CHECK (ai_authority IN ('execute', 'recommend', 'alert', 'stop')),
  human_required TEXT CHECK (human_required IN ('none', 'user_action', 'advisor_review', 'licensed_professional', 'institutional')),
  escalation_message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical', 'urgent')),
  tier_minimum TEXT DEFAULT 'free', -- minimum tier where this rule applies
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escalation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES escalation_rules(id),
  trigger_data JSONB,
  action_taken TEXT, -- 'alerted_user', 'escalated_to_advisor', 'stopped_execution', 'logged_only'
  resolved BOOLEAN DEFAULT false,
  resolved_by TEXT, -- 'user', 'advisor', 'system'
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_escalation_rules_trigger_type ON escalation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_escalation_rules_severity ON escalation_rules(severity);
CREATE INDEX IF NOT EXISTS idx_escalation_log_user_id ON escalation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_escalation_log_resolved ON escalation_log(resolved);

-- Enable RLS
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for escalation_rules (reference data)
CREATE POLICY "Escalation rules readable by all authenticated users" ON escalation_rules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owner can manage escalation rules" ON escalation_rules
  FOR ALL USING (auth.email() = 'tanya@virtualopsassist.com');

-- RLS Policies for escalation_log
CREATE POLICY "Users can view their own escalation log" ON escalation_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert escalation log" ON escalation_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own escalation log" ON escalation_log
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owner can view all escalation logs" ON escalation_log
  FOR SELECT USING (auth.email() = 'tanya@virtualopsassist.com');

CREATE POLICY "Advisors can view escalation logs for their clients" ON escalation_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_tier IN ('advisory', 'enterprise')
    )
  );
