-- Component 6: Machine Learning Optimization Loop
-- Human corrections improve AI over time
-- Created: February 13, 2026

CREATE TABLE IF NOT EXISTS advisory_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  advisor_id UUID REFERENCES profiles(id), -- the human who made the correction
  original_recommendation TEXT NOT NULL,
  correction TEXT NOT NULL,
  correction_type TEXT CHECK (correction_type IN (
    'wrong_interpretation', 'wrong_threshold', 'wrong_entity_rule',
    'missed_context', 'over_escalation', 'under_escalation',
    'wrong_data_source', 'timing_error', 'jurisdiction_error'
  )),
  entity_type TEXT, -- what type of organization was this for
  rule_category TEXT, -- which compliance area
  severity TEXT,
  applied_to_system BOOLEAN DEFAULT false, -- has this been incorporated
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Aggregated learning metrics
CREATE TABLE IF NOT EXISTS ml_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_period TEXT, -- '2026-02', '2026-Q1'
  total_recommendations INTEGER,
  correction_rate NUMERIC(5,4), -- % that needed correction
  false_positive_rate NUMERIC(5,4),
  false_negative_rate NUMERIC(5,4),
  avg_confidence_accuracy NUMERIC(5,4),
  top_correction_types JSONB, -- most common correction categories
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_advisory_corrections_user_id ON advisory_corrections(user_id);
CREATE INDEX IF NOT EXISTS idx_advisory_corrections_advisor_id ON advisory_corrections(advisor_id);
CREATE INDEX IF NOT EXISTS idx_advisory_corrections_correction_type ON advisory_corrections(correction_type);
CREATE INDEX IF NOT EXISTS idx_advisory_corrections_entity_type ON advisory_corrections(entity_type);
CREATE INDEX IF NOT EXISTS idx_advisory_corrections_applied ON advisory_corrections(applied_to_system);
CREATE INDEX IF NOT EXISTS idx_ml_performance_metric_period ON ml_performance(metric_period);

-- Enable RLS
ALTER TABLE advisory_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for advisory_corrections
CREATE POLICY "Users can view corrections for their own recommendations" ON advisory_corrections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Advisors can insert corrections" ON advisory_corrections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_tier IN ('advisory', 'enterprise')
    )
  );

CREATE POLICY "Owner can view all corrections" ON advisory_corrections
  FOR SELECT USING (auth.email() = 'tanya@virtualopsassist.com');

CREATE POLICY "Owner can manage all corrections" ON advisory_corrections
  FOR ALL USING (auth.email() = 'tanya@virtualopsassist.com');

-- RLS Policies for ml_performance
CREATE POLICY "ML performance readable by owner" ON ml_performance
  FOR SELECT USING (auth.email() = 'tanya@virtualopsassist.com');

CREATE POLICY "System can insert ML performance" ON ml_performance
  FOR INSERT WITH CHECK (true);

-- Function to calculate correction rate for a period
CREATE OR REPLACE FUNCTION calculate_correction_rate(period TEXT)
RETURNS NUMERIC AS $$
DECLARE
  total_recs INTEGER;
  corrections INTEGER;
  rate NUMERIC;
BEGIN
  -- Get total recommendations for the period
  SELECT COUNT(*) INTO total_recs
  FROM vopsy_reasoning_log
  WHERE TO_CHAR(created_at, 'YYYY-MM') = period;

  -- Get corrections for the period
  SELECT COUNT(*) INTO corrections
  FROM advisory_corrections
  WHERE TO_CHAR(created_at, 'YYYY-MM') = period;

  IF total_recs = 0 THEN
    RETURN 0;
  END IF;

  rate := (corrections::NUMERIC / total_recs::NUMERIC);
  
  RETURN ROUND(rate, 4);
END;
$$ LANGUAGE plpgsql;

-- Function to get top correction types for a period
CREATE OR REPLACE FUNCTION get_top_correction_types(period TEXT, top_n INTEGER DEFAULT 5)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'correction_type', correction_type,
      'count', count,
      'percentage', ROUND((count::NUMERIC / SUM(count) OVER ()) * 100, 2)
    )
  )
  INTO result
  FROM (
    SELECT 
      correction_type,
      COUNT(*) as count
    FROM advisory_corrections
    WHERE TO_CHAR(created_at, 'YYYY-MM') = period
    GROUP BY correction_type
    ORDER BY count DESC
    LIMIT top_n
  ) subquery;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;
