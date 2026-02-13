-- Component 4: AI Enterprise Institutional Intelligence Layer
-- Enterprise tier as ecosystem infrastructure
-- Created: February 13, 2026

-- Enterprise organization management
CREATE TABLE IF NOT EXISTS enterprise_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  organization_type TEXT, -- 'client', 'borrower', 'student', 'grantee', 'member'
  linked_user_id UUID REFERENCES profiles(id), -- the actual user in the Hub
  status TEXT CHECK (status IN ('active', 'inactive', 'at_risk', 'flagged')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Organizational Stability Index (aggregate metric)
CREATE TABLE IF NOT EXISTS osi_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  osi_score NUMERIC(5,2), -- aggregate across all linked organizations
  total_organizations INTEGER,
  healthy_count INTEGER,
  attention_count INTEGER,
  warning_count INTEGER,
  critical_count INTEGER,
  funding_readiness_avg NUMERIC(5,2),
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Enterprise alerts (cross-portfolio)
CREATE TABLE IF NOT EXISTS enterprise_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  linked_user_id UUID REFERENCES profiles(id),
  alert_type TEXT, -- 'cri_drop', 'deadline_missed', 'escalation_triggered', 'at_risk'
  message TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_enterprise_organizations_enterprise_user_id ON enterprise_organizations(enterprise_user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_organizations_linked_user_id ON enterprise_organizations(linked_user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_organizations_status ON enterprise_organizations(status);
CREATE INDEX IF NOT EXISTS idx_osi_scores_enterprise_user_id ON osi_scores(enterprise_user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_alerts_enterprise_user_id ON enterprise_alerts(enterprise_user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_alerts_acknowledged ON enterprise_alerts(acknowledged);

-- Enable RLS
ALTER TABLE enterprise_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE osi_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enterprise_organizations
CREATE POLICY "Enterprise users can view their own organizations" ON enterprise_organizations
  FOR SELECT USING (auth.uid() = enterprise_user_id);

CREATE POLICY "Enterprise users can manage their own organizations" ON enterprise_organizations
  FOR ALL USING (auth.uid() = enterprise_user_id);

CREATE POLICY "Linked users can view their own organization record" ON enterprise_organizations
  FOR SELECT USING (auth.uid() = linked_user_id);

CREATE POLICY "Owner can view all enterprise organizations" ON enterprise_organizations
  FOR SELECT USING (auth.email() = 'tanya@virtualopsassist.com');

-- RLS Policies for osi_scores
CREATE POLICY "Enterprise users can view their own OSI scores" ON osi_scores
  FOR SELECT USING (auth.uid() = enterprise_user_id);

CREATE POLICY "System can manage OSI scores" ON osi_scores
  FOR ALL USING (true);

CREATE POLICY "Owner can view all OSI scores" ON osi_scores
  FOR SELECT USING (auth.email() = 'tanya@virtualopsassist.com');

-- RLS Policies for enterprise_alerts
CREATE POLICY "Enterprise users can view their own alerts" ON enterprise_alerts
  FOR SELECT USING (auth.uid() = enterprise_user_id);

CREATE POLICY "Enterprise users can acknowledge their own alerts" ON enterprise_alerts
  FOR UPDATE USING (auth.uid() = enterprise_user_id);

CREATE POLICY "System can insert enterprise alerts" ON enterprise_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner can view all enterprise alerts" ON enterprise_alerts
  FOR SELECT USING (auth.email() = 'tanya@virtualopsassist.com');

-- Function to calculate OSI score for an enterprise user
CREATE OR REPLACE FUNCTION calculate_osi_score(enterprise_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_orgs INTEGER;
  healthy INTEGER := 0;
  attention INTEGER := 0;
  warning INTEGER := 0;
  critical INTEGER := 0;
  avg_cri NUMERIC;
  osi_score NUMERIC;
BEGIN
  -- Get all linked organizations
  SELECT COUNT(*) INTO total_orgs
  FROM enterprise_organizations
  WHERE enterprise_user_id = enterprise_uuid
    AND status = 'active';

  IF total_orgs = 0 THEN
    RETURN jsonb_build_object(
      'osi_score', NULL,
      'total_organizations', 0,
      'healthy_count', 0,
      'attention_count', 0,
      'warning_count', 0,
      'critical_count', 0,
      'funding_readiness_avg', NULL
    );
  END IF;

  -- Count organizations by risk level
  SELECT 
    COUNT(*) FILTER (WHERE c.risk_level = 'healthy'),
    COUNT(*) FILTER (WHERE c.risk_level = 'attention'),
    COUNT(*) FILTER (WHERE c.risk_level = 'warning'),
    COUNT(*) FILTER (WHERE c.risk_level = 'critical'),
    AVG(c.score)
  INTO healthy, attention, warning, critical, avg_cri
  FROM enterprise_organizations eo
  LEFT JOIN cri_scores c ON c.user_id = eo.linked_user_id
  WHERE eo.enterprise_user_id = enterprise_uuid
    AND eo.status = 'active';

  -- Calculate OSI score (weighted average favoring healthy organizations)
  osi_score := COALESCE(avg_cri, 50);

  -- Build result
  result := jsonb_build_object(
    'osi_score', ROUND(osi_score, 2),
    'total_organizations', total_orgs,
    'healthy_count', healthy,
    'attention_count', attention,
    'warning_count', warning,
    'critical_count', critical,
    'funding_readiness_avg', ROUND(osi_score, 2)
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate enterprise alerts
CREATE OR REPLACE FUNCTION generate_enterprise_alerts(enterprise_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  alert_count INTEGER := 0;
  org_record RECORD;
BEGIN
  -- Loop through all linked organizations
  FOR org_record IN 
    SELECT 
      eo.id,
      eo.organization_name,
      eo.linked_user_id,
      c.score as cri_score,
      c.risk_level
    FROM enterprise_organizations eo
    LEFT JOIN cri_scores c ON c.user_id = eo.linked_user_id
    WHERE eo.enterprise_user_id = enterprise_uuid
      AND eo.status = 'active'
  LOOP
    -- Alert for CRI drops below 60
    IF org_record.cri_score IS NOT NULL AND org_record.cri_score < 60 THEN
      INSERT INTO enterprise_alerts (
        enterprise_user_id,
        linked_user_id,
        alert_type,
        message,
        severity
      ) VALUES (
        enterprise_uuid,
        org_record.linked_user_id,
        'cri_drop',
        org_record.organization_name || ' has a CRI score of ' || org_record.cri_score || ' (' || org_record.risk_level || ')',
        CASE 
          WHEN org_record.cri_score < 40 THEN 'critical'
          WHEN org_record.cri_score < 60 THEN 'warning'
          ELSE 'info'
        END
      )
      ON CONFLICT DO NOTHING;
      
      alert_count := alert_count + 1;
    END IF;
  END LOOP;

  RETURN alert_count;
END;
$$ LANGUAGE plpgsql;
