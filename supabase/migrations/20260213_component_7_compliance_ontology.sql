-- Component 7: Small Organization Compliance Ontology
-- Standardized data model for compliance intelligence
-- Created: February 13, 2026

-- Entity type definitions
CREATE TABLE IF NOT EXISTS entity_ontology (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL UNIQUE, -- 'llc', 's_corp', '501c3', 'sole_prop', 'partnership', 'c_corp'
  display_name TEXT NOT NULL,
  tax_classification TEXT,
  filing_requirements JSONB, -- required filings by frequency
  payroll_rules JSONB,
  compliance_categories TEXT[], -- which categories apply
  revenue_thresholds JSONB, -- thresholds that trigger new requirements
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Regulatory obligation mapping
CREATE TABLE IF NOT EXISTS regulatory_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obligation_name TEXT NOT NULL,
  entity_types TEXT[] NOT NULL, -- which entity types this applies to
  jurisdiction TEXT NOT NULL, -- 'federal', 'state:NY', 'local:rochester'
  frequency TEXT CHECK (frequency IN ('annual', 'quarterly', 'monthly', 'event_triggered', 'one_time')),
  typical_deadline TEXT, -- 'april_15', 'jan_31', '15th_of_following_month'
  penalty_type TEXT, -- 'monetary', 'interest', 'license_revocation', 'audit_trigger'
  estimated_penalty TEXT,
  prerequisites TEXT[], -- other obligations that must be complete first
  data_requirements TEXT[], -- what data is needed to complete this
  ai_automatable BOOLEAN DEFAULT false, -- can VOPSy handle this?
  requires_license TEXT, -- 'cpa', 'ea', 'attorney', null
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance event sequences (dependency chains)
CREATE TABLE IF NOT EXISTS compliance_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_name TEXT NOT NULL, -- 'annual_tax_cycle', 'new_employee_onboarding'
  entity_types TEXT[],
  steps JSONB NOT NULL,
  -- Example: [
  --   { "step": 1, "obligation": "quarterly_estimated_tax", "timing": "Q1" },
  --   { "step": 2, "obligation": "quarterly_estimated_tax", "timing": "Q2" },
  --   { "step": 3, "obligation": "annual_return", "timing": "april_15" },
  --   { "step": 4, "obligation": "extension", "timing": "if_not_filed", "triggers": "penalty_clock" }
  -- ]
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_regulatory_obligations_entity_types ON regulatory_obligations USING GIN(entity_types);
CREATE INDEX IF NOT EXISTS idx_regulatory_obligations_jurisdiction ON regulatory_obligations(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_compliance_sequences_entity_types ON compliance_sequences USING GIN(entity_types);

-- Enable RLS
ALTER TABLE entity_ontology ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_sequences ENABLE ROW LEVEL SECURITY;

-- RLS Policies (these are reference data, readable by all authenticated users)
CREATE POLICY "Entity ontology readable by all authenticated users" ON entity_ontology
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Regulatory obligations readable by all authenticated users" ON regulatory_obligations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Compliance sequences readable by all authenticated users" ON compliance_sequences
  FOR SELECT USING (auth.role() = 'authenticated');

-- Owner can manage ontology data
CREATE POLICY "Owner can manage entity ontology" ON entity_ontology
  FOR ALL USING (auth.email() = 'tanya@virtualopsassist.com');

CREATE POLICY "Owner can manage regulatory obligations" ON regulatory_obligations
  FOR ALL USING (auth.email() = 'tanya@virtualopsassist.com');

CREATE POLICY "Owner can manage compliance sequences" ON compliance_sequences
  FOR ALL USING (auth.email() = 'tanya@virtualopsassist.com');
