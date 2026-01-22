-- Remove overly-permissive invite read policy (invite validation will be done via backend function)
DROP POLICY IF EXISTS "Anyone can validate invite by code" ON public.cohort_invites;