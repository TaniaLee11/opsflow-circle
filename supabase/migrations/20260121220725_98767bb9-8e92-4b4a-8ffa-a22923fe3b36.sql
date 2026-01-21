-- Fix 1: Drop overly permissive INSERT policy on studio_generations
-- Service role automatically bypasses RLS, so this policy is unnecessary and exposes insert to all authenticated users
DROP POLICY IF EXISTS "Service role can insert generations" ON studio_generations;

-- Fix 2: Create a secure function to mask email addresses
-- Returns full email for own profile, masked for all other users (even if accessed via views or joins)
CREATE OR REPLACE FUNCTION public.get_safe_profile_email(profile_user_id uuid, profile_email text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT CASE 
    WHEN auth.uid() = profile_user_id THEN profile_email
    ELSE 
      CASE 
        WHEN profile_email IS NULL THEN NULL
        ELSE CONCAT(LEFT(SPLIT_PART(profile_email, '@', 1), 2), '***@***', RIGHT(SPLIT_PART(profile_email, '@', 2), 4))
      END
  END;
$$;