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
-- Seed Data for Component 7: Entity Ontology
-- Created: February 13, 2026

-- Insert entity types with comprehensive metadata
INSERT INTO entity_ontology (entity_type, display_name, tax_classification, filing_requirements, payroll_rules, compliance_categories, revenue_thresholds) VALUES

-- LLC (Limited Liability Company)
('llc', 'Limited Liability Company (LLC)', 'Pass-through or Corporate',
 '{"annual": ["Form 1065 (if multi-member)", "Schedule K-1", "State Annual Report"], "quarterly": ["Estimated Tax (Form 1040-ES)"], "monthly": []}'::jsonb,
 '{"requires_ein": true, "payroll_tax_deposits": "monthly or semi-weekly", "form_941": "quarterly", "form_940": "annual"}'::jsonb,
 ARRAY['tax', 'payroll', 'licensing', 'reporting'],
 '{"gross_receipts_250k": "May trigger additional state requirements", "gross_receipts_1m": "May benefit from S-Corp election"}'::jsonb),

-- S-Corporation
('s_corp', 'S-Corporation', 'Pass-through',
 '{"annual": ["Form 1120-S", "Schedule K-1", "State Corporate Return"], "quarterly": ["Estimated Tax (Form 1040-ES)", "Payroll Tax Deposits"], "monthly": []}'::jsonb,
 '{"requires_ein": true, "reasonable_compensation": "required for owner-employees", "payroll_tax_deposits": "monthly or semi-weekly", "form_941": "quarterly", "form_940": "annual"}'::jsonb,
 ARRAY['tax', 'payroll', 'licensing', 'reporting', 'entity'],
 '{"revenue_threshold_100k": "Reasonable compensation scrutiny increases"}'::jsonb),

-- C-Corporation
('c_corp', 'C-Corporation', 'Corporate',
 '{"annual": ["Form 1120", "State Corporate Return"], "quarterly": ["Estimated Tax (Form 1120-W)", "Payroll Tax Deposits"], "monthly": []}'::jsonb,
 '{"requires_ein": true, "payroll_tax_deposits": "monthly or semi-weekly", "form_941": "quarterly", "form_940": "annual"}'::jsonb,
 ARRAY['tax', 'payroll', 'licensing', 'reporting', 'entity'],
 '{"revenue_threshold_10m": "Additional audit risk and compliance requirements"}'::jsonb),

-- Sole Proprietorship
('sole_prop', 'Sole Proprietorship', 'Pass-through',
 '{"annual": ["Schedule C (Form 1040)", "Schedule SE"], "quarterly": ["Estimated Tax (Form 1040-ES)"], "monthly": []}'::jsonb,
 '{"requires_ein": false, "ein_required_if_employees": true, "payroll_tax_deposits": "monthly or semi-weekly if employees", "form_941": "quarterly if employees"}'::jsonb,
 ARRAY['tax', 'licensing'],
 '{"gross_receipts_400": "Self-employment tax applies", "gross_receipts_100k": "Consider entity structure change"}'::jsonb),

-- Partnership
('partnership', 'Partnership', 'Pass-through',
 '{"annual": ["Form 1065", "Schedule K-1"], "quarterly": ["Estimated Tax (Form 1040-ES)"], "monthly": []}'::jsonb,
 '{"requires_ein": true, "payroll_tax_deposits": "monthly or semi-weekly", "form_941": "quarterly if employees", "form_940": "annual if employees"}'::jsonb,
 ARRAY['tax', 'payroll', 'licensing', 'reporting', 'entity'],
 '{"gross_receipts_500k": "May benefit from entity structure review"}'::jsonb),

-- 501(c)(3) Nonprofit
('501c3', '501(c)(3) Nonprofit Organization', 'Tax-Exempt',
 '{"annual": ["Form 990 or 990-EZ or 990-N", "State Charity Registration Renewal"], "quarterly": ["Payroll Tax Deposits if employees"], "monthly": []}'::jsonb,
 '{"requires_ein": true, "payroll_tax_deposits": "monthly or semi-weekly if employees", "form_941": "quarterly if employees", "form_940": "annual if employees", "unrelated_business_income": "Form 990-T if applicable"}'::jsonb,
 ARRAY['tax', 'payroll', 'licensing', 'reporting', 'nonprofit', 'grant'],
 '{"gross_receipts_50k": "Form 990-EZ required", "gross_receipts_200k": "Form 990 (full) required", "gross_receipts_1m": "Audit may be required by funders"}'::jsonb),

-- 501(c)(6) Trade Association
('501c6', '501(c)(6) Trade Association', 'Tax-Exempt',
 '{"annual": ["Form 990 or 990-EZ", "State Annual Report"], "quarterly": ["Payroll Tax Deposits if employees"], "monthly": []}'::jsonb,
 '{"requires_ein": true, "payroll_tax_deposits": "monthly or semi-weekly if employees", "form_941": "quarterly if employees", "form_940": "annual if employees"}'::jsonb,
 ARRAY['tax', 'payroll', 'licensing', 'reporting', 'nonprofit'],
 '{"gross_receipts_50k": "Form 990-EZ required", "gross_receipts_200k": "Form 990 (full) required"}'::jsonb)

ON CONFLICT (entity_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  tax_classification = EXCLUDED.tax_classification,
  filing_requirements = EXCLUDED.filing_requirements,
  payroll_rules = EXCLUDED.payroll_rules,
  compliance_categories = EXCLUDED.compliance_categories,
  revenue_thresholds = EXCLUDED.revenue_thresholds;
-- Seed Data: Federal Regulatory Obligations
-- Created: February 13, 2026

INSERT INTO regulatory_obligations (
  obligation_name, entity_types, jurisdiction, frequency, typical_deadline,
  penalty_type, estimated_penalty, prerequisites, data_requirements,
  ai_automatable, requires_license
) VALUES

-- Annual Federal Tax Returns
('Federal Income Tax Return - Form 1040 Schedule C', ARRAY['sole_prop'], 'federal', 'annual', 'april_15',
 'monetary', '$435 minimum + interest', ARRAY[]::TEXT[], ARRAY['revenue', 'expenses', 'cost_of_goods_sold'],
 false, 'cpa'),

('Federal Partnership Return - Form 1065', ARRAY['partnership', 'llc'], 'federal', 'annual', 'march_15',
 'monetary', '$220 per partner per month', ARRAY[]::TEXT[], ARRAY['revenue', 'expenses', 'partner_distributions', 'basis_calculations'],
 false, 'cpa'),

('Federal S-Corp Return - Form 1120-S', ARRAY['s_corp'], 'federal', 'annual', 'march_15',
 'monetary', '$220 per shareholder per month', ARRAY[]::TEXT[], ARRAY['revenue', 'expenses', 'shareholder_distributions', 'payroll', 'reasonable_compensation'],
 false, 'cpa'),

('Federal C-Corp Return - Form 1120', ARRAY['c_corp'], 'federal', 'annual', 'april_15',
 'monetary', 'Varies by income', ARRAY[]::TEXT[], ARRAY['revenue', 'expenses', 'depreciation', 'shareholder_dividends'],
 false, 'cpa'),

('Nonprofit Annual Return - Form 990', ARRAY['501c3', '501c6'], 'federal', 'annual', '5th_month_after_fiscal_year_end',
 'monetary', '$20/day up to $10,500', ARRAY[]::TEXT[], ARRAY['revenue', 'expenses', 'program_service_accomplishments', 'governance', 'compensation'],
 false, 'cpa'),

-- Quarterly Estimated Taxes
('Quarterly Estimated Tax Payment - Q1', ARRAY['sole_prop', 'partnership', 'llc', 's_corp'], 'federal', 'quarterly', 'april_15',
 'interest', '0.5% per month underpayment penalty', ARRAY[]::TEXT[], ARRAY['prior_year_tax_liability', 'current_year_income_projection'],
 false, null),

('Quarterly Estimated Tax Payment - Q2', ARRAY['sole_prop', 'partnership', 'llc', 's_corp'], 'federal', 'quarterly', 'june_15',
 'interest', '0.5% per month underpayment penalty', ARRAY[]::TEXT[], ARRAY['prior_year_tax_liability', 'current_year_income_projection'],
 false, null),

('Quarterly Estimated Tax Payment - Q3', ARRAY['sole_prop', 'partnership', 'llc', 's_corp'], 'federal', 'quarterly', 'september_15',
 'interest', '0.5% per month underpayment penalty', ARRAY[]::TEXT[], ARRAY['prior_year_tax_liability', 'current_year_income_projection'],
 false, null),

('Quarterly Estimated Tax Payment - Q4', ARRAY['sole_prop', 'partnership', 'llc', 's_corp'], 'federal', 'quarterly', 'january_15',
 'interest', '0.5% per month underpayment penalty', ARRAY[]::TEXT[], ARRAY['prior_year_tax_liability', 'current_year_income_projection'],
 false, null),

-- Payroll Tax Filings
('Quarterly Payroll Tax Return - Form 941', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'federal', 'quarterly', 'last_day_of_month_after_quarter',
 'monetary', '2-15% of unpaid taxes', ARRAY[]::TEXT[], ARRAY['gross_wages', 'federal_income_tax_withheld', 'social_security_wages', 'medicare_wages'],
 false, null),

('Annual Federal Unemployment Tax - Form 940', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'federal', 'annual', 'january_31',
 'monetary', '0.5% per month', ARRAY[]::TEXT[], ARRAY['gross_wages', 'state_unemployment_paid'],
 false, null),

('Annual Wage and Tax Statement - W-2', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'federal', 'annual', 'january_31',
 'monetary', '$50-$280 per form', ARRAY[]::TEXT[], ARRAY['employee_wages', 'federal_tax_withheld', 'state_tax_withheld', 'social_security_wages'],
 true, null),

('Annual Nonemployee Compensation - 1099-NEC', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'federal', 'annual', 'january_31',
 'monetary', '$50-$280 per form', ARRAY[]::TEXT[], ARRAY['contractor_payments_over_600'],
 true, null),

-- Payroll Tax Deposits
('Federal Payroll Tax Deposit - Monthly Schedule', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'federal', 'monthly', '15th_of_following_month',
 'monetary', '2-15% of unpaid taxes', ARRAY[]::TEXT[], ARRAY['federal_income_tax_withheld', 'social_security_tax', 'medicare_tax'],
 false, null),

('Federal Payroll Tax Deposit - Semi-Weekly Schedule', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'federal', 'event_triggered', 'wednesday_or_friday_after_payday',
 'monetary', '2-15% of unpaid taxes', ARRAY[]::TEXT[], ARRAY['federal_income_tax_withheld', 'social_security_tax', 'medicare_tax'],
 false, null),

-- Nonprofit Specific
('Nonprofit E-Postcard - Form 990-N', ARRAY['501c3', '501c6'], 'federal', 'annual', '5th_month_after_fiscal_year_end',
 'license_revocation', 'Loss of tax-exempt status after 3 years', ARRAY[]::TEXT[], ARRAY['gross_receipts_under_50k'],
 true, null),

('Unrelated Business Income Tax - Form 990-T', ARRAY['501c3', '501c6'], 'federal', 'annual', '5th_month_after_fiscal_year_end',
 'monetary', 'Standard corporate tax penalties', ARRAY[]::TEXT[], ARRAY['unrelated_business_income_over_1000'],
 false, 'cpa'),

-- Extensions
('Federal Tax Extension - Form 4868 (Individual)', ARRAY['sole_prop'], 'federal', 'event_triggered', 'april_15',
 'interest', 'No penalty if 90% paid, but interest accrues', ARRAY[]::TEXT[], ARRAY['estimated_tax_liability'],
 true, null),

('Federal Tax Extension - Form 7004 (Business)', ARRAY['partnership', 'llc', 's_corp', 'c_corp'], 'federal', 'event_triggered', 'original_due_date',
 'interest', 'No penalty if 90% paid, but interest accrues', ARRAY[]::TEXT[], ARRAY['estimated_tax_liability'],
 true, null),

-- Entity Formation/Maintenance
('EIN Application - Form SS-4', ARRAY['partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'federal', 'one_time', 'before_first_filing',
 'audit_trigger', 'Cannot file taxes or open bank accounts', ARRAY[]::TEXT[], ARRAY['entity_formation_documents'],
 true, null),

('S-Corporation Election - Form 2553', ARRAY['s_corp'], 'federal', 'one_time', 'within_75_days_of_formation_or_jan_1',
 'monetary', 'Late election requires IRS approval', ARRAY['EIN Application - Form SS-4'], ARRAY['entity_formation_date', 'shareholder_consent'],
 false, 'cpa'),

('501(c)(3) Tax-Exempt Application - Form 1023', ARRAY['501c3'], 'federal', 'one_time', 'within_27_months_of_formation',
 'license_revocation', 'Cannot receive tax-deductible donations', ARRAY['EIN Application - Form SS-4'], ARRAY['articles_of_incorporation', 'bylaws', 'financial_projections', 'program_descriptions'],
 false, 'attorney')

ON CONFLICT DO NOTHING;
-- Seed Data: New York State Regulatory Obligations
-- Created: February 13, 2026

INSERT INTO regulatory_obligations (
  obligation_name, entity_types, jurisdiction, frequency, typical_deadline,
  penalty_type, estimated_penalty, prerequisites, data_requirements,
  ai_automatable, requires_license
) VALUES

-- NY State Tax Returns
('NY State Income Tax Return - IT-201', ARRAY['sole_prop'], 'state:NY', 'annual', 'april_15',
 'monetary', '5% of unpaid tax + interest', ARRAY[]::TEXT[], ARRAY['federal_return', 'ny_source_income'],
 false, 'cpa'),

('NY Partnership Return - IT-204', ARRAY['partnership', 'llc'], 'state:NY', 'annual', 'march_15',
 'monetary', '$50 per partner per month', ARRAY[]::TEXT[], ARRAY['federal_form_1065', 'ny_source_income'],
 false, 'cpa'),

('NY S-Corp Return - CT-3-S', ARRAY['s_corp'], 'state:NY', 'annual', 'march_15',
 'monetary', 'Fixed dollar minimum tax + penalties', ARRAY[]::TEXT[], ARRAY['federal_form_1120s', 'ny_receipts'],
 false, 'cpa'),

('NY C-Corp Return - CT-3', ARRAY['c_corp'], 'state:NY', 'annual', 'march_15',
 'monetary', 'Fixed dollar minimum tax + penalties', ARRAY[]::TEXT[], ARRAY['federal_form_1120', 'ny_receipts'],
 false, 'cpa'),

('NY Nonprofit Filing - CHAR500', ARRAY['501c3', '501c6'], 'state:NY', 'annual', '6_months_after_fiscal_year_end',
 'license_revocation', 'Cannot solicit donations in NY', ARRAY[]::TEXT[], ARRAY['federal_form_990', 'ny_activities'],
 false, null),

-- NY Sales Tax
('NY Sales Tax Return - Quarterly', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp'], 'state:NY', 'quarterly', '20th_of_month_after_quarter',
 'monetary', '10% of tax due + interest', ARRAY[]::TEXT[], ARRAY['gross_sales', 'taxable_sales', 'sales_tax_collected'],
 false, null),

('NY Sales Tax Return - Monthly', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp'], 'state:NY', 'monthly', '20th_of_following_month',
 'monetary', '10% of tax due + interest', ARRAY[]::TEXT[], ARRAY['gross_sales', 'taxable_sales', 'sales_tax_collected'],
 false, null),

-- NY Payroll Taxes
('NY Quarterly Withholding Tax - NYS-45', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'state:NY', 'quarterly', 'last_day_of_month_after_quarter',
 'monetary', '5% of unpaid tax', ARRAY[]::TEXT[], ARRAY['gross_wages', 'ny_withholding'],
 false, null),

('NY Unemployment Insurance Tax - Quarterly', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'state:NY', 'quarterly', 'last_day_of_month_after_quarter',
 'monetary', 'Interest + penalties', ARRAY[]::TEXT[], ARRAY['gross_wages', 'ui_rate'],
 false, null),

-- Entity Maintenance
('NY LLC Biennial Statement', ARRAY['llc'], 'state:NY', 'annual', 'biennial_anniversary_of_formation',
 'license_revocation', 'Entity dissolution', ARRAY[]::TEXT[], ARRAY['current_address', 'registered_agent'],
 true, null),

('NY Corporation Annual Report', ARRAY['s_corp', 'c_corp'], 'state:NY', 'annual', 'anniversary_of_formation',
 'license_revocation', 'Entity dissolution', ARRAY[]::TEXT[], ARRAY['current_address', 'officers', 'directors'],
 true, null),

('NY Nonprofit Annual Filing - CHAR500', ARRAY['501c3', '501c6'], 'state:NY', 'annual', '6_months_after_fiscal_year_end',
 'license_revocation', 'Cannot solicit donations', ARRAY[]::TEXT[], ARRAY['federal_990', 'ny_program_activities'],
 false, null),

-- Licensing & Registration
('NY Certificate of Authority (Foreign Entity)', ARRAY['llc', 's_corp', 'c_corp'], 'state:NY', 'one_time', 'before_doing_business_in_ny',
 'monetary', 'Cannot enforce contracts in NY courts', ARRAY[]::TEXT[], ARRAY['home_state_good_standing_certificate'],
 true, null),

('NY Sales Tax Certificate of Authority', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp'], 'state:NY', 'one_time', 'before_making_taxable_sales',
 'monetary', 'Cannot legally collect sales tax', ARRAY[]::TEXT[], ARRAY['business_description', 'estimated_sales'],
 true, null),

('NY Workers Compensation Insurance', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'state:NY', 'event_triggered', 'before_hiring_first_employee',
 'license_revocation', 'Stop work order + fines', ARRAY[]::TEXT[], ARRAY['employee_count', 'payroll'],
 false, null),

('NY Disability Benefits Insurance', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'state:NY', 'event_triggered', 'before_hiring_first_employee',
 'monetary', 'Fines + back premiums', ARRAY[]::TEXT[], ARRAY['employee_count', 'payroll'],
 false, null),

('NY Paid Family Leave Insurance', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'state:NY', 'event_triggered', 'before_hiring_first_employee',
 'monetary', 'Fines + back premiums', ARRAY[]::TEXT[], ARRAY['employee_count', 'payroll'],
 false, null),

-- Contractor/Professional Licensing (examples)
('NY Home Improvement Contractor License', ARRAY['sole_prop', 'llc', 's_corp', 'c_corp'], 'state:NY', 'annual', 'renewal_date',
 'license_revocation', 'Cannot legally operate', ARRAY[]::TEXT[], ARRAY['insurance', 'bond'],
 false, null),

('NY Professional License Renewal (varies by profession)', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp'], 'state:NY', 'annual', 'varies_by_profession',
 'license_revocation', 'Cannot practice profession', ARRAY[]::TEXT[], ARRAY['continuing_education', 'insurance'],
 false, null)

ON CONFLICT DO NOTHING;
-- Seed Data: Compliance Sequences
-- Created: February 13, 2026

INSERT INTO compliance_sequences (sequence_name, entity_types, steps) VALUES

-- Annual Tax Cycle for Pass-Through Entities
('Annual Tax Cycle - Pass-Through Entities', ARRAY['sole_prop', 'partnership', 'llc', 's_corp'],
 '[
   {"step": 1, "obligation": "Quarterly Estimated Tax Payment - Q1", "timing": "april_15", "description": "First quarter estimated tax payment"},
   {"step": 2, "obligation": "Quarterly Estimated Tax Payment - Q2", "timing": "june_15", "description": "Second quarter estimated tax payment"},
   {"step": 3, "obligation": "Quarterly Estimated Tax Payment - Q3", "timing": "september_15", "description": "Third quarter estimated tax payment"},
   {"step": 4, "obligation": "Quarterly Estimated Tax Payment - Q4", "timing": "january_15", "description": "Fourth quarter estimated tax payment"},
   {"step": 5, "obligation": "Annual Tax Return", "timing": "march_15_or_april_15", "description": "File annual return (March 15 for partnerships/S-corps, April 15 for sole props)"},
   {"step": 6, "obligation": "Extension if needed", "timing": "original_due_date", "description": "File extension if return not ready", "optional": true}
 ]'::jsonb),

-- Annual Tax Cycle for Nonprofits
('Annual Tax Cycle - Nonprofits', ARRAY['501c3', '501c6'],
 '[
   {"step": 1, "obligation": "Form 990 Preparation", "timing": "4_months_after_fiscal_year_end", "description": "Begin preparing Form 990"},
   {"step": 2, "obligation": "Form 990 Filing", "timing": "5_months_after_fiscal_year_end", "description": "File Form 990 or 990-EZ or 990-N"},
   {"step": 3, "obligation": "NY CHAR500 Filing", "timing": "6_months_after_fiscal_year_end", "description": "File NY state charity registration"},
   {"step": 4, "obligation": "State Registrations Review", "timing": "annually", "description": "Review and renew state charity registrations"}
 ]'::jsonb),

-- New Employee Onboarding Sequence
('New Employee Onboarding', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'],
 '[
   {"step": 1, "obligation": "Form W-4 Collection", "timing": "first_day", "description": "Collect federal withholding form"},
   {"step": 2, "obligation": "Form I-9 Verification", "timing": "within_3_days", "description": "Verify employment eligibility"},
   {"step": 3, "obligation": "NY IT-2104 Collection", "timing": "first_day", "description": "Collect NY state withholding form"},
   {"step": 4, "obligation": "Workers Comp Coverage", "timing": "before_first_day", "description": "Ensure workers comp insurance active"},
   {"step": 5, "obligation": "Disability Benefits Coverage", "timing": "before_first_day", "description": "Ensure disability insurance active"},
   {"step": 6, "obligation": "Paid Family Leave Coverage", "timing": "before_first_day", "description": "Ensure PFL insurance active"},
   {"step": 7, "obligation": "New Hire Reporting", "timing": "within_20_days", "description": "Report new hire to NY State Directory"}
 ]'::jsonb),

-- Quarterly Payroll Tax Cycle
('Quarterly Payroll Tax Cycle', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'],
 '[
   {"step": 1, "obligation": "Payroll Tax Deposits", "timing": "monthly_or_semi_weekly", "description": "Deposit federal payroll taxes based on schedule"},
   {"step": 2, "obligation": "Form 941 Filing", "timing": "last_day_of_month_after_quarter", "description": "File quarterly federal payroll tax return"},
   {"step": 3, "obligation": "NY Withholding Tax Filing", "timing": "last_day_of_month_after_quarter", "description": "File NY state withholding return"},
   {"step": 4, "obligation": "NY Unemployment Insurance", "timing": "last_day_of_month_after_quarter", "description": "File NY UI quarterly return"}
 ]'::jsonb),

-- Year-End Payroll Sequence
('Year-End Payroll Processing', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'],
 '[
   {"step": 1, "obligation": "W-2 Preparation", "timing": "december", "description": "Prepare W-2 forms for all employees"},
   {"step": 2, "obligation": "1099-NEC Preparation", "timing": "december", "description": "Prepare 1099-NEC for contractors paid $600+"},
   {"step": 3, "obligation": "W-2 Distribution", "timing": "january_31", "description": "Provide W-2 to employees"},
   {"step": 4, "obligation": "1099-NEC Distribution", "timing": "january_31", "description": "Provide 1099-NEC to contractors"},
   {"step": 5, "obligation": "W-2 Filing with SSA", "timing": "january_31", "description": "File W-2 copies with Social Security Administration"},
   {"step": 6, "obligation": "1099-NEC Filing with IRS", "timing": "january_31", "description": "File 1099-NEC with IRS"},
   {"step": 7, "obligation": "Form 940 Filing", "timing": "january_31", "description": "File annual federal unemployment tax return"}
 ]'::jsonb),

-- Entity Formation Sequence
('Entity Formation - LLC/Corporation', ARRAY['llc', 's_corp', 'c_corp'],
 '[
   {"step": 1, "obligation": "File Formation Documents", "timing": "day_1", "description": "File Articles of Organization/Incorporation with state"},
   {"step": 2, "obligation": "EIN Application", "timing": "within_1_week", "description": "Apply for federal EIN"},
   {"step": 3, "obligation": "S-Corp Election (if applicable)", "timing": "within_75_days", "description": "File Form 2553 for S-Corp election", "conditional": "s_corp only"},
   {"step": 4, "obligation": "Operating Agreement/Bylaws", "timing": "within_30_days", "description": "Draft and adopt governing documents"},
   {"step": 5, "obligation": "Business Bank Account", "timing": "within_2_weeks", "description": "Open business bank account"},
   {"step": 6, "obligation": "NY Certificate of Authority (if foreign)", "timing": "before_doing_business", "description": "Register foreign entity in NY", "conditional": "if out-of-state entity"},
   {"step": 7, "obligation": "Sales Tax Registration (if applicable)", "timing": "before_first_sale", "description": "Register for NY sales tax certificate", "conditional": "if selling taxable goods/services"}
 ]'::jsonb),

-- Nonprofit Formation Sequence
('Nonprofit Formation - 501(c)(3)', ARRAY['501c3'],
 '[
   {"step": 1, "obligation": "File Articles of Incorporation", "timing": "day_1", "description": "File nonprofit articles with state"},
   {"step": 2, "obligation": "EIN Application", "timing": "within_1_week", "description": "Apply for federal EIN"},
   {"step": 3, "obligation": "Bylaws Adoption", "timing": "within_30_days", "description": "Draft and adopt bylaws"},
   {"step": 4, "obligation": "Board of Directors Meeting", "timing": "within_30_days", "description": "Hold first board meeting"},
   {"step": 5, "obligation": "Form 1023 Preparation", "timing": "within_6_months", "description": "Begin preparing 501(c)(3) application"},
   {"step": 6, "obligation": "Form 1023 Filing", "timing": "within_27_months", "description": "File 501(c)(3) tax-exempt application with IRS"},
   {"step": 7, "obligation": "NY Charity Registration", "timing": "before_soliciting", "description": "Register with NY Attorney General Charities Bureau"},
   {"step": 8, "obligation": "State Tax-Exempt Application", "timing": "after_federal_approval", "description": "Apply for NY state tax exemption"}
 ]'::jsonb),

-- Grant Compliance Cycle (Nonprofits)
('Grant Compliance Cycle', ARRAY['501c3', '501c6'],
 '[
   {"step": 1, "obligation": "Grant Award Acceptance", "timing": "upon_award", "description": "Review and accept grant terms"},
   {"step": 2, "obligation": "Restricted Fund Setup", "timing": "before_spending", "description": "Set up fund accounting for grant"},
   {"step": 3, "obligation": "Quarterly Progress Reports", "timing": "quarterly", "description": "Submit progress reports to funder"},
   {"step": 4, "obligation": "Financial Reports", "timing": "per_grant_agreement", "description": "Submit financial reports showing grant expenditures"},
   {"step": 5, "obligation": "Final Report", "timing": "grant_end_date", "description": "Submit final grant report"},
   {"step": 6, "obligation": "Audit (if required)", "timing": "annually", "description": "Complete single audit if federal grants exceed $750k"}
 ]'::jsonb)

ON CONFLICT DO NOTHING;
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
-- Seed Data: Compliance Rules
-- Created: February 13, 2026

INSERT INTO compliance_rules (
  rule_name, rule_category, entity_types, jurisdiction, description,
  threshold_logic, severity, effective_date, source_reference
) VALUES

-- Tax Rules
('Quarterly Estimated Tax Requirement', 'tax', ARRAY['sole_prop', 'partnership', 'llc', 's_corp'], 'federal',
 'If you expect to owe $1,000 or more in federal tax when you file your return, you must make quarterly estimated tax payments.',
 '{"expected_tax_liability_exceeds": 1000, "withholding_insufficient": true}'::jsonb,
 'warning', '2024-01-01', 'IRS Publication 505'),

('S-Corp Reasonable Compensation', 'payroll', ARRAY['s_corp'], 'federal',
 'S-Corporation owner-employees must receive reasonable compensation for services performed. Distributions cannot be used to avoid payroll taxes.',
 '{"has_active_operations": true, "owner_performs_services": true, "payroll_to_distributions_ratio_below": 0.4}'::jsonb,
 'critical', '2024-01-01', 'IRS Revenue Ruling 74-44'),

('Payroll Tax Deposit Schedule', 'payroll', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'federal',
 'Employers must deposit payroll taxes on either a monthly or semi-weekly schedule based on total tax liability.',
 '{"has_employees": true, "payroll_tax_liability_over_50k": "semi_weekly", "payroll_tax_liability_under_50k": "monthly"}'::jsonb,
 'critical', '2024-01-01', 'IRS Publication 15'),

('Form 1099-NEC Filing Requirement', 'tax', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'federal',
 'Businesses must file Form 1099-NEC for each person paid $600 or more for services in the course of business.',
 '{"contractor_payments_over_600": true, "not_incorporated": true}'::jsonb,
 'warning', '2024-01-01', 'IRS Instructions for Form 1099-NEC'),

('Backup Withholding Requirement', 'tax', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'federal',
 'If a contractor fails to provide a valid TIN or is subject to backup withholding, you must withhold 24% of payments.',
 '{"missing_w9": true, "or": {"irs_backup_withholding_notice": true}}'::jsonb,
 'critical', '2024-01-01', 'IRS Publication 1281'),

-- Nonprofit Rules
('Form 990 Filing Requirement', 'nonprofit', ARRAY['501c3', '501c6'], 'federal',
 'Tax-exempt organizations must file Form 990, 990-EZ, or 990-N annually. Failure to file for 3 consecutive years results in automatic revocation.',
 '{"gross_receipts_over_50k": "Form 990 or 990-EZ", "gross_receipts_under_50k": "Form 990-N"}'::jsonb,
 'critical', '2024-01-01', 'IRC Section 6033'),

('Grant Fund Restriction Compliance', 'nonprofit', ARRAY['501c3', '501c6'], 'federal',
 'Restricted grant funds must be used only for the purposes specified by the donor or grantor. Commingling with unrestricted funds requires proper accounting.',
 '{"has_restricted_grants": true, "fund_accounting_required": true}'::jsonb,
 'escalation', '2024-01-01', 'FASB ASC 958-605'),

('Nonprofit Excess Benefit Transactions', 'nonprofit', ARRAY['501c3'], 'federal',
 'Transactions that provide excessive benefits to disqualified persons can result in excise taxes and jeopardize tax-exempt status.',
 '{"transaction_with_insider": true, "compensation_above_reasonable": true}'::jsonb,
 'escalation', '2024-01-01', 'IRC Section 4958'),

-- NY State Rules
('NY Sales Tax Collection Requirement', 'tax', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp'], 'state:NY',
 'Businesses selling taxable goods or services in NY must register for and collect sales tax.',
 '{"sells_taxable_goods_or_services": true, "has_ny_nexus": true}'::jsonb,
 'critical', '2024-01-01', 'NY Tax Law Article 28'),

('NY Workers Compensation Insurance', 'licensing', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'state:NY',
 'All NY employers must carry workers compensation insurance. Failure to comply results in stop work orders and fines.',
 '{"has_employees": true, "state": "NY"}'::jsonb,
 'critical', '2024-01-01', 'NY Workers Compensation Law Section 50'),

('NY Disability Benefits Insurance', 'licensing', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'state:NY',
 'NY employers must provide disability benefits insurance for employees.',
 '{"has_employees": true, "state": "NY"}'::jsonb,
 'critical', '2024-01-01', 'NY Workers Compensation Law Section 205'),

('NY Paid Family Leave', 'licensing', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp', '501c3', '501c6'], 'state:NY',
 'NY employers must provide paid family leave insurance for employees.',
 '{"has_employees": true, "state": "NY"}'::jsonb,
 'critical', '2024-01-01', 'NY Workers Compensation Law Article 9'),

('NY LLC Biennial Statement', 'entity', ARRAY['llc'], 'state:NY',
 'NY LLCs must file a biennial statement every 2 years. Failure to file results in entity dissolution.',
 '{"entity_type": "llc", "state": "NY", "due_on_formation_anniversary": true}'::jsonb,
 'warning', '2024-01-01', 'NY LLC Law Section 301'),

('NY Nonprofit Charity Registration', 'nonprofit', ARRAY['501c3', '501c6'], 'state:NY',
 'Nonprofits soliciting donations in NY must register with the Attorney General Charities Bureau and file annual reports.',
 '{"solicits_donations": true, "operates_in_ny": true}'::jsonb,
 'critical', '2024-01-01', 'NY Executive Law Article 7-A'),

-- Entity Structure Rules
('Single Member LLC Default Tax Treatment', 'entity', ARRAY['llc'], 'federal',
 'Single-member LLCs are disregarded entities by default (taxed as sole proprietorship). Can elect corporate taxation.',
 '{"members": 1, "no_election_made": true}'::jsonb,
 'info', '2024-01-01', 'IRS Publication 3402'),

('Partnership Tax Return Requirement', 'tax', ARRAY['partnership', 'llc'], 'federal',
 'Multi-member LLCs and partnerships must file Form 1065 even if no income was earned.',
 '{"members_greater_than_1": true}'::jsonb,
 'warning', '2024-01-01', 'IRC Section 6031'),

('S-Corp Election Deadline', 'entity', ARRAY['s_corp'], 'federal',
 'S-Corporation election must be filed within 75 days of formation or by March 15 for current year election.',
 '{"wants_s_corp_status": true, "within_75_days_of_formation": true}'::jsonb,
 'critical', '2024-01-01', 'IRC Section 1362'),

-- Licensing Rules
('Professional License Renewal', 'licensing', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp'], 'federal',
 'Licensed professionals must renew licenses before expiration. Practicing with an expired license is illegal.',
 '{"has_professional_license": true, "license_expiration_within_60_days": true}'::jsonb,
 'critical', '2024-01-01', 'Varies by profession and state'),

('Contractor License and Bond Requirements', 'licensing', ARRAY['sole_prop', 'llc', 's_corp', 'c_corp'], 'federal',
 'Contractors must maintain required licenses, insurance, and bonds. Requirements vary by trade and jurisdiction.',
 '{"is_contractor": true, "performs_regulated_work": true}'::jsonb,
 'critical', '2024-01-01', 'Varies by jurisdiction'),

-- Reporting Rules
('Annual Report Filing', 'reporting', ARRAY['llc', 's_corp', 'c_corp'], 'federal',
 'Corporations and LLCs must file annual reports with their state of formation to maintain good standing.',
 '{"entity_registered": true, "annual_report_due": true}'::jsonb,
 'warning', '2024-01-01', 'Varies by state'),

('Beneficial Ownership Reporting (BOI)', 'reporting', ARRAY['llc', 's_corp', 'c_corp', 'partnership'], 'federal',
 'Most entities formed after 2024 must report beneficial ownership information to FinCEN within 30 days of formation.',
 '{"formed_after_2024": true, "not_exempt": true}'::jsonb,
 'critical', '2024-01-01', 'Corporate Transparency Act'),

-- Threshold-Based Rules
('Audit Requirement for Large Nonprofits', 'nonprofit', ARRAY['501c3', '501c6'], 'federal',
 'Nonprofits expending $750,000 or more in federal awards must have a single audit performed.',
 '{"federal_grants_over_750k": true}'::jsonb,
 'escalation', '2024-01-01', 'Uniform Guidance 2 CFR 200.501'),

('Large Employer ACA Reporting', 'payroll', ARRAY['llc', 's_corp', 'c_corp', '501c3', '501c6'], 'federal',
 'Employers with 50+ full-time equivalent employees must file ACA Forms 1094-C and 1095-C.',
 '{"fte_count_over_50": true}'::jsonb,
 'critical', '2024-01-01', 'IRC Section 6056'),

('NY Sales Tax Audit Trigger Thresholds', 'tax', ARRAY['sole_prop', 'partnership', 'llc', 's_corp', 'c_corp'], 'state:NY',
 'Significant changes in sales tax reporting patterns or high-volume sales can trigger NY sales tax audits.',
 '{"sales_tax_collected_over_100k": true, "or": {"reporting_pattern_change_over_30_percent": true}}'::jsonb,
 'info', '2024-01-01', 'NY Tax Law Article 28')

ON CONFLICT DO NOTHING;
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
-- Seed Data: Escalation Rules
-- Created: February 13, 2026

INSERT INTO escalation_rules (
  trigger_type, trigger_condition, ai_authority, human_required,
  escalation_message, severity, tier_minimum
) VALUES

-- CRI Threshold Triggers
('cri_threshold', '{"cri_score_below": 40}'::jsonb, 'stop', 'advisor_review',
 'Your Compliance Risk Index has dropped below 40. VOPSy cannot execute autonomous actions until a human advisor reviews your situation.',
 'critical', 'free'),

('cri_threshold', '{"cri_score_below": 60}'::jsonb, 'recommend', 'user_action',
 'Your Compliance Risk Index is below 60. VOPSy recommends scheduling an advisory review to address compliance risks.',
 'warning', 'free'),

-- Tax Liability Triggers
('tax_liability', '{"tax_liability_exceeds": 5000, "reserve_below_percentage": 50}'::jsonb, 'alert', 'advisor_review',
 'You have significant tax liability ($5,000+) without adequate reserves. Human advisory review is recommended.',
 'critical', 'assistant'),

('tax_liability', '{"estimated_tax_payment_missed": true}'::jsonb, 'alert', 'user_action',
 'You have missed a quarterly estimated tax payment. This may result in penalties. VOPSy recommends immediate action.',
 'warning', 'free'),

('tax_liability', '{"tax_liability_exceeds": 25000}'::jsonb, 'stop', 'licensed_professional',
 'Tax liability exceeds $25,000. This requires review by a licensed tax professional (CPA or EA).',
 'urgent', 'advisory'),

-- Payroll Triggers
('payroll', '{"payroll_tax_deposit_late": true}'::jsonb, 'alert', 'user_action',
 'Payroll tax deposit is late. Penalties accrue quickly. VOPSy recommends immediate deposit.',
 'critical', 'assistant'),

('payroll', '{"reasonable_compensation_ratio_below": 0.4, "entity_type": "s_corp"}'::jsonb, 'alert', 'advisor_review',
 'S-Corp reasonable compensation may be insufficient. This is an IRS audit risk. Human review recommended.',
 'warning', 'assistant'),

('payroll', '{"payroll_liability_exceeds": 10000, "unpaid": true}'::jsonb, 'stop', 'licensed_professional',
 'Unpaid payroll liabilities exceed $10,000. This requires immediate professional intervention.',
 'urgent', 'advisory'),

-- Deadline Triggers
('deadline', '{"compliance_deadline_overdue": true, "days_overdue_exceeds": 30}'::jsonb, 'alert', 'advisor_review',
 'Compliance deadline is more than 30 days overdue. Penalties may be accruing. Human review recommended.',
 'critical', 'free'),

('deadline', '{"annual_filing_missed": true}'::jsonb, 'alert', 'licensed_professional',
 'Annual tax filing deadline has been missed. This requires professional assistance to minimize penalties.',
 'urgent', 'advisory'),

-- Audit Triggers
('audit', '{"keyword_detected": ["audit", "examination", "IRS notice", "tax notice"]}'::jsonb, 'stop', 'licensed_professional',
 'Audit or IRS notice detected. VOPSy cannot handle this. You must consult with a licensed tax professional immediately.',
 'urgent', 'free'),

('audit', '{"sales_tax_audit_notice": true}'::jsonb, 'stop', 'licensed_professional',
 'Sales tax audit notice detected. This requires immediate professional representation.',
 'urgent', 'free'),

-- Legal Triggers
('legal', '{"keyword_detected": ["lawsuit", "legal action", "summons", "subpoena"]}'::jsonb, 'stop', 'licensed_professional',
 'Legal action detected. VOPSy cannot provide legal advice. You must consult with an attorney immediately.',
 'urgent', 'free'),

('legal', '{"entity_dissolution_risk": true}'::jsonb, 'alert', 'advisor_review',
 'Your entity is at risk of administrative dissolution. Human review recommended to maintain good standing.',
 'critical', 'free'),

-- Grant Compliance (Nonprofits)
('grant', '{"restricted_fund_violation": true}'::jsonb, 'stop', 'advisor_review',
 'Potential restricted fund violation detected. Grant compliance requires human review.',
 'critical', 'assistant'),

('grant', '{"single_audit_required": true, "federal_grants_over_750k": true}'::jsonb, 'alert', 'licensed_professional',
 'Your organization has expended over $750,000 in federal grants. A single audit is required by law.',
 'warning', 'assistant'),

('grant', '{"grant_reporting_deadline_approaching": true, "days_until_deadline_less_than": 7}'::jsonb, 'alert', 'user_action',
 'Grant reporting deadline is less than 7 days away. VOPSy recommends immediate action.',
 'warning', 'assistant'),

-- Licensing Triggers
('licensing', '{"professional_license_expired": true}'::jsonb, 'stop', 'user_action',
 'Your professional license has expired. You cannot legally practice until renewed.',
 'urgent', 'free'),

('licensing', '{"license_expiration_within_30_days": true}'::jsonb, 'alert', 'user_action',
 'Your professional license expires in less than 30 days. VOPSy recommends renewing immediately.',
 'warning', 'free'),

('licensing', '{"workers_comp_insurance_lapsed": true}'::jsonb, 'stop', 'user_action',
 'Workers compensation insurance has lapsed. This is illegal in NY. You may receive a stop work order.',
 'urgent', 'assistant'),

-- Entity Structure Triggers
('entity', '{"s_corp_election_deadline_approaching": true, "days_until_deadline_less_than": 15}'::jsonb, 'alert', 'advisor_review',
 'S-Corp election deadline is approaching. Missing this deadline requires IRS approval for late election.',
 'warning', 'assistant'),

('entity', '{"beneficial_ownership_reporting_required": true, "not_filed": true}'::jsonb, 'alert', 'user_action',
 'Beneficial Ownership Information (BOI) report is required under the Corporate Transparency Act. Failure to file results in penalties.',
 'critical', 'free'),

-- Tier Authority Triggers
('tier_authority', '{"action_requested": "execute_transaction", "user_tier": "free"}'::jsonb, 'stop', 'none',
 'This action requires AI Assistant tier or higher. VOPSy cannot execute transactions at the Free tier.',
 'info', 'free'),

('tier_authority', '{"action_requested": "execute_transaction", "user_tier": "assistant"}'::jsonb, 'stop', 'none',
 'This action requires AI Operations tier or higher. VOPSy can only provide recommendations at the Assistant tier.',
 'info', 'assistant'),

('tier_authority', '{"action_requested": "tax_advice", "user_tier": "operations"}'::jsonb, 'stop', 'licensed_professional',
 'VOPSy cannot provide specific tax advice. This requires consultation with a licensed tax professional (CPA or EA).',
 'warning', 'operations'),

-- Financial Risk Triggers
('financial_risk', '{"cash_flow_negative_3_months": true}'::jsonb, 'alert', 'advisor_review',
 'Cash flow has been negative for 3 consecutive months. Human advisory review recommended.',
 'warning', 'assistant'),

('financial_risk', '{"debt_to_income_ratio_over": 0.8}'::jsonb, 'alert', 'advisor_review',
 'Debt-to-income ratio exceeds 80%. This is a significant financial risk. Human review recommended.',
 'critical', 'assistant')

ON CONFLICT DO NOTHING;
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
