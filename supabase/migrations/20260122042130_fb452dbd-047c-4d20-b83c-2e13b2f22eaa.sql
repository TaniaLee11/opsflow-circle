-- Fix cohort_invites RLS to use user_roles-based owner check (platform owner)
-- Existing policies rely on profiles.role = 'owner', but platform owner profiles may use a different value.

DROP POLICY IF EXISTS "Owners can create invites" ON public.cohort_invites;
DROP POLICY IF EXISTS "Owners can view their org invites" ON public.cohort_invites;

-- Owners can view invites for their organization
CREATE POLICY "Owners can view org cohort invites"
ON public.cohort_invites
FOR SELECT
USING (
  is_platform_owner(auth.uid())
  AND organization_id IN (
    SELECT p.organization_id
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
  )
);

-- Owners can create invites for their organization
CREATE POLICY "Owners can create org cohort invites"
ON public.cohort_invites
FOR INSERT
WITH CHECK (
  is_platform_owner(auth.uid())
  AND organization_id IN (
    SELECT p.organization_id
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
  )
);