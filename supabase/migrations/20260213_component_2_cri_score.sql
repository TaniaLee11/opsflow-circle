-- Component 2: Compliance Risk Index (CRI)
-- Quantitative scoring system (0-100)
-- Created: February 13, 2026

CREATE TABLE IF NOT EXISTS cri_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  score_breakdown JSONB NOT NULL,
  -- Example breakdown:
  -- {
  --   "cash_flow_volatility": { "score": 85, "weight": 0.20, "data_source": "quickbooks" },
  --   "tax_reserve_adequacy": { "score": 60, "weight": 0.25, "data_source": "quickbooks" },
  --   "missed_deadlines": { "score": 90, "weight": 0.20, "data_source": "platform" },
  --   "payroll_liabilities": { "score": 100, "weight": 0.15, "data_source": "payroll" },
  --   "entity_alignment": { "score": 75, "weight": 0.10, "data_source": "profile" },
  --   "grant_compliance": { "score": null, "weight": 0.10, "data_source": "none" }
  -- }
  risk_level TEXT CHECK (risk_level IN ('healthy', 'attention', 'warning', 'critical')),
  alerts_triggered TEXT[],
  calculated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS cri_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER,
  risk_level TEXT,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cri_scores_user_id ON cri_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_cri_scores_risk_level ON cri_scores(risk_level);
CREATE INDEX IF NOT EXISTS idx_cri_history_user_id ON cri_history(user_id);
CREATE INDEX IF NOT EXISTS idx_cri_history_calculated_at ON cri_history(calculated_at);

-- Enable RLS
ALTER TABLE cri_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cri_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cri_scores
CREATE POLICY "Users can view their own CRI score" ON cri_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert/update CRI scores" ON cri_scores
  FOR ALL USING (true);

CREATE POLICY "Owner can view all CRI scores" ON cri_scores
  FOR SELECT USING (auth.email() = 'tanya@virtualopsassist.com');

-- RLS Policies for cri_history
CREATE POLICY "Users can view their own CRI history" ON cri_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert CRI history" ON cri_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner can view all CRI history" ON cri_history
  FOR SELECT USING (auth.email() = 'tanya@virtualopsassist.com');

-- Function to calculate risk level from score
CREATE OR REPLACE FUNCTION calculate_risk_level(score INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF score >= 80 THEN
    RETURN 'healthy';
  ELSIF score >= 60 THEN
    RETURN 'attention';
  ELSIF score >= 40 THEN
    RETURN 'warning';
  ELSE
    RETURN 'critical';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to update risk_level when score changes
CREATE OR REPLACE FUNCTION update_cri_risk_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.risk_level := calculate_risk_level(NEW.score);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cri_risk_level
  BEFORE INSERT OR UPDATE OF score ON cri_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_cri_risk_level();

-- Trigger to log CRI history
CREATE OR REPLACE FUNCTION log_cri_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO cri_history (user_id, score, risk_level, calculated_at)
  VALUES (NEW.user_id, NEW.score, NEW.risk_level, NEW.calculated_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_cri_history
  AFTER INSERT OR UPDATE OF score ON cri_scores
  FOR EACH ROW
  EXECUTE FUNCTION log_cri_history();
