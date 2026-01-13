-- Drop the overly permissive policy
DROP POLICY "System can manage memberships" ON public.cohort_memberships;

-- Create proper policies for cohort_memberships
CREATE POLICY "Owners can view org memberships"
ON public.cohort_memberships
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
  OR user_id = auth.uid()
);

-- Service role will handle inserts/updates via edge functions