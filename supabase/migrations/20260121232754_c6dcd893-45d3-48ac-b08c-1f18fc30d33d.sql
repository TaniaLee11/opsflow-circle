-- Drop existing policy and create a new one that lets platform owners see ALL courses
DROP POLICY IF EXISTS "Users can view published courses matching their tier" ON public.courses;

CREATE POLICY "Users can view accessible courses" 
ON public.courses 
FOR SELECT 
USING (
  -- Platform owners can see ALL courses (including drafts)
  is_platform_owner(auth.uid()) 
  OR 
  -- Other users can only see published courses that match their tier
  (
    status = 'published' 
    AND (
      'free' = ANY (tier_access) 
      OR get_user_effective_tier(auth.uid()) = ANY (tier_access) 
      OR get_user_effective_tier(auth.uid()) = 'owner'
      OR get_user_effective_tier(auth.uid()) = 'cohort'
    )
  )
);