-- Allow anon/authenticated to read invite by code for validation during signup flow
CREATE POLICY "Anyone can validate invite by code"
ON public.cohort_invites
FOR SELECT
TO anon, authenticated
USING (true);