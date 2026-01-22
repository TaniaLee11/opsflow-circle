-- Remove the overly permissive policy that exposes all accounts to any authenticated user
DROP POLICY IF EXISTS "Authenticated users can view accounts" ON public.accounts;

-- The existing policies are sufficient for proper access control:
-- "Platform owner can read all accounts" - For admin access
-- "Members can read their account" - Uses is_account_member() function
-- "Primary members can update their account" - Proper authorization