-- Add DELETE policy for cohort_invites so owners can remove pending invites
CREATE POLICY "Owners can delete org cohort invites"
ON public.cohort_invites
FOR DELETE
USING (
  is_platform_owner(auth.uid())
  AND organization_id IN (
    SELECT p.organization_id
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
  )
);