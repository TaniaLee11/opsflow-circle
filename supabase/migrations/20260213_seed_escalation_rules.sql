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
