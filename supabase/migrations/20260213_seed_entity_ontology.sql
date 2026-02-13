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
