-- Add subscription_confirmed field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_tier text,
ADD COLUMN IF NOT EXISTS subscription_confirmed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Create function to check if user has tier access
-- This is used by RLS and frontend to determine if user can access features
CREATE OR REPLACE FUNCTION public.user_has_tier_access(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile profiles%ROWTYPE;
  has_cohort_access boolean := false;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM profiles WHERE user_id = check_user_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Platform owner always has access
  IF user_profile.role = 'owner' THEN
    RETURN true;
  END IF;
  
  -- Check if user has active cohort membership
  SELECT EXISTS (
    SELECT 1 FROM cohort_memberships 
    WHERE user_id = check_user_id 
    AND status = 'active'
    AND expires_at > now()
  ) INTO has_cohort_access;
  
  IF has_cohort_access THEN
    RETURN true;
  END IF;
  
  -- Free tier always has access (no payment required)
  IF user_profile.selected_tier = 'free' THEN
    RETURN true;
  END IF;
  
  -- For paid tiers, subscription must be confirmed via Stripe
  IF user_profile.subscription_confirmed = true THEN
    RETURN true;
  END IF;
  
  -- No access - subscription not confirmed
  RETURN false;
END;
$$;

-- Create function to get user's current effective tier
CREATE OR REPLACE FUNCTION public.get_user_effective_tier(check_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile profiles%ROWTYPE;
  cohort_tier text;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM profiles WHERE user_id = check_user_id;
  
  IF NOT FOUND THEN
    RETURN null;
  END IF;
  
  -- Platform owner has all access
  IF user_profile.role = 'owner' THEN
    RETURN 'owner';
  END IF;
  
  -- Check for active cohort (gives ai_operations level access)
  SELECT 'cohort' INTO cohort_tier
  FROM cohort_memberships 
  WHERE user_id = check_user_id 
  AND status = 'active'
  AND expires_at > now()
  LIMIT 1;
  
  IF cohort_tier IS NOT NULL THEN
    RETURN 'cohort';
  END IF;
  
  -- Free tier always accessible
  IF user_profile.selected_tier = 'free' THEN
    RETURN 'free';
  END IF;
  
  -- For paid tiers, only return tier if subscription confirmed
  IF user_profile.subscription_confirmed = true THEN
    RETURN COALESCE(user_profile.subscription_tier, user_profile.selected_tier);
  END IF;
  
  -- No confirmed subscription, no tier access
  RETURN 'pending';
END;
$$;