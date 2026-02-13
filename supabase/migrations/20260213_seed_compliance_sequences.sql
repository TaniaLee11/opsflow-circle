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
