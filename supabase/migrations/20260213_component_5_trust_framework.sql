-- Component 5: Engineered AI Trust Framework
-- Making VOPSy's reasoning transparent and trustworthy
-- Created: February 13, 2026

CREATE TABLE IF NOT EXISTS vopsy_reasoning_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID,
  action_type TEXT, -- 'recommendation', 'alert', 'execution', 'escalation'
  reasoning TEXT NOT NULL, -- human-readable explanation
  data_sources TEXT[], -- ['quickbooks', 'stripe', 'compliance_rules', 'cri_score']
  confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
  user_accepted BOOLEAN, -- did user follow the recommendation?
  user_override BOOLEAN DEFAULT false, -- did user explicitly override?
  override_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trust metrics per user
CREATE TABLE IF NOT EXISTS trust_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_recommendations INTEGER DEFAULT 0,
  accepted_count INTEGER DEFAULT 0,
  overridden_count INTEGER DEFAULT 0,
  escalations_accepted INTEGER DEFAULT 0,
  escalations_ignored INTEGER DEFAULT 0,
  trust_score NUMERIC(5,2), -- calculated acceptance rate
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vopsy_reasoning_log_user_id ON vopsy_reasoning_log(user_id);
CREATE INDEX IF NOT EXISTS idx_vopsy_reasoning_log_conversation_id ON vopsy_reasoning_log(conversation_id);
CREATE INDEX IF NOT EXISTS idx_vopsy_reasoning_log_action_type ON vopsy_reasoning_log(action_type);
CREATE INDEX IF NOT EXISTS idx_vopsy_reasoning_log_confidence_level ON vopsy_reasoning_log(confidence_level);
CREATE INDEX IF NOT EXISTS idx_trust_metrics_user_id ON trust_metrics(user_id);

-- Enable RLS
ALTER TABLE vopsy_reasoning_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vopsy_reasoning_log
CREATE POLICY "Users can view their own reasoning log" ON vopsy_reasoning_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert reasoning log" ON vopsy_reasoning_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own reasoning log" ON vopsy_reasoning_log
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owner can view all reasoning logs" ON vopsy_reasoning_log
  FOR SELECT USING (auth.email() = 'tanya@virtualopsassist.com');

-- RLS Policies for trust_metrics
CREATE POLICY "Users can view their own trust metrics" ON trust_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage trust metrics" ON trust_metrics
  FOR ALL USING (true);

CREATE POLICY "Owner can view all trust metrics" ON trust_metrics
  FOR SELECT USING (auth.email() = 'tanya@virtualopsassist.com');

-- Function to calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(user_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_recs INTEGER;
  accepted INTEGER;
  trust_score NUMERIC;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE user_accepted IS NOT NULL),
    COUNT(*) FILTER (WHERE user_accepted = true)
  INTO total_recs, accepted
  FROM vopsy_reasoning_log
  WHERE user_id = user_uuid;

  IF total_recs = 0 THEN
    RETURN NULL;
  END IF;

  trust_score := (accepted::NUMERIC / total_recs::NUMERIC) * 100;
  
  RETURN ROUND(trust_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update trust metrics
CREATE OR REPLACE FUNCTION update_trust_metrics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO trust_metrics (
    user_id,
    total_recommendations,
    accepted_count,
    overridden_count,
    trust_score,
    updated_at
  )
  SELECT 
    NEW.user_id,
    COUNT(*) FILTER (WHERE user_accepted IS NOT NULL),
    COUNT(*) FILTER (WHERE user_accepted = true),
    COUNT(*) FILTER (WHERE user_override = true),
    calculate_trust_score(NEW.user_id),
    now()
  FROM vopsy_reasoning_log
  WHERE user_id = NEW.user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_recommendations = EXCLUDED.total_recommendations,
    accepted_count = EXCLUDED.accepted_count,
    overridden_count = EXCLUDED.overridden_count,
    trust_score = EXCLUDED.trust_score,
    updated_at = EXCLUDED.updated_at;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update trust metrics when reasoning log is updated
CREATE TRIGGER trigger_update_trust_metrics
  AFTER UPDATE OF user_accepted, user_override ON vopsy_reasoning_log
  FOR EACH ROW
  WHEN (OLD.user_accepted IS DISTINCT FROM NEW.user_accepted OR OLD.user_override IS DISTINCT FROM NEW.user_override)
  EXECUTE FUNCTION update_trust_metrics();
