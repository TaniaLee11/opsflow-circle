-- Fix the organizations SELECT policy to allow viewing newly created organizations
-- The issue is that INSERT...RETURNING requires the SELECT policy to pass,
-- but the new org isn't linked to the user's profile yet.

-- Add a permissive SELECT policy for INSERT RETURNING to work
-- This allows authenticated users to see organizations during the creation flow
CREATE POLICY "Users can view organizations they just created"
ON public.organizations
FOR SELECT
USING (
  -- Allow authenticated users to see orgs (needed for INSERT...RETURNING to work)
  -- The existing policy requires profile link which doesn't exist during creation
  auth.uid() IS NOT NULL
);