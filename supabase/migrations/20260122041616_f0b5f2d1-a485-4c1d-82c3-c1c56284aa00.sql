-- Allow authenticated users to create their own organization during onboarding
CREATE POLICY "Users can create organizations"
ON public.organizations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own organization (linked via profile)
CREATE POLICY "Users can update their organization"
ON public.organizations
FOR UPDATE
USING (id IN (
  SELECT organization_id FROM profiles WHERE user_id = auth.uid()
));

-- Fix accounts INSERT policy - the existing one is too restrictive for new users
-- Drop the existing policy and create a simpler one
DROP POLICY IF EXISTS "Users can create limited accounts" ON public.accounts;

CREATE POLICY "Users can create accounts"
ON public.accounts
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);