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
