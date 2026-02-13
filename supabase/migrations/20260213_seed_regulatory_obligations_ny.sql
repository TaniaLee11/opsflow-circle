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
