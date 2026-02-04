-- Add business profile fields to organizations table for industry-specific financial insights

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS annual_revenue_range TEXT,
ADD COLUMN IF NOT EXISTS employee_count_range TEXT,
ADD COLUMN IF NOT EXISTS business_model TEXT,
ADD COLUMN IF NOT EXISTS primary_currency TEXT DEFAULT 'USD';

-- Add comment explaining the fields
COMMENT ON COLUMN public.organizations.industry IS 'Business industry (e.g., Retail, Services, SaaS, Restaurant, Construction, Healthcare, Consulting, E-commerce, Manufacturing, Real Estate)';
COMMENT ON COLUMN public.organizations.business_type IS 'Type of business (e.g., B2B, B2C, B2B2C, Marketplace)';
COMMENT ON COLUMN public.organizations.annual_revenue_range IS 'Annual revenue range (e.g., 0-100k, 100k-500k, 500k-1M, 1M-5M, 5M-10M, 10M+)';
COMMENT ON COLUMN public.organizations.employee_count_range IS 'Number of employees (e.g., 1, 2-5, 6-10, 11-25, 26-50, 51-100, 100+)';
COMMENT ON COLUMN public.organizations.business_model IS 'Revenue model (e.g., Subscription, One-time, Service-based, Product-based, Hybrid)';
COMMENT ON COLUMN public.organizations.primary_currency IS 'Primary currency for financial reporting';

-- Create index for industry-based queries
CREATE INDEX IF NOT EXISTS idx_organizations_industry ON public.organizations(industry);
