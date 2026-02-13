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
