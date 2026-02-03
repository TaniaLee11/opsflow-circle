-- Add organization_id to accounts table
-- This links accounts to organizations for cohort and multi-org support

ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accounts_organization_id ON public.accounts(organization_id);

-- Update RLS policies if needed
-- (Existing policies should continue to work, but may need adjustment for org-level access)

COMMENT ON COLUMN public.accounts.organization_id IS 'Links account to parent organization for cohort and enterprise features';
