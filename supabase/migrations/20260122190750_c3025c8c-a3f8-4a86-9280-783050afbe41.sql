-- Drop and recreate the INSERT policy for account_memberships
-- The issue is that when a user creates a new account during onboarding,
-- they need to also create their first membership but aren't yet a primary member

DROP POLICY IF EXISTS "Primary members can insert memberships" ON public.account_memberships;

CREATE POLICY "Users can create their own membership"
ON public.account_memberships
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Also ensure the SELECT policy allows users to see their own memberships
-- (needed for checking if they're already a member)
CREATE POLICY "Users can view their own memberships"
ON public.account_memberships
FOR SELECT
USING (auth.uid() = user_id);