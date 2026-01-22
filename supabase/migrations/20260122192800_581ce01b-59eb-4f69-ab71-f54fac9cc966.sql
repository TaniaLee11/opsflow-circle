-- Allow authenticated users to view accounts to fix INSERT...RETURNING during onboarding
-- This is safe because:
-- 1. UPDATE is protected by is_account_primary
-- 2. DELETE is not allowed at all
-- 3. Sensitive data is in other tables with their own RLS
CREATE POLICY "Authenticated users can view accounts"
ON public.accounts FOR SELECT
USING (auth.uid() IS NOT NULL);