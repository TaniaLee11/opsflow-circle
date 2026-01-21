-- Fix 1: Add INSERT policy for studio_generations allowing users to create their own records
-- This enables the application to properly track AI generation usage
CREATE POLICY "Users can insert their own generations"
  ON public.studio_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Fix 2: Replace unrestricted account creation with limited policy
-- Prevents spam by limiting users to max 10 primary accounts
DROP POLICY IF EXISTS "Users can create account" ON public.accounts;

CREATE POLICY "Users can create limited accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      SELECT COUNT(*) FROM public.account_memberships
      WHERE user_id = auth.uid()
        AND role = 'primary'
        AND status = 'active'
    ) < 10
  );

-- Fix 3: Create table for tracking failed authentication attempts (for rate limiting)
CREATE TABLE IF NOT EXISTS public.auth_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient IP + time lookups
CREATE INDEX IF NOT EXISTS idx_auth_failures_ip_time ON public.auth_failures(ip_address, created_at);

-- Enable RLS on auth_failures (service role only - no user access)
ALTER TABLE public.auth_failures ENABLE ROW LEVEL SECURITY;

-- No policies = only service role can access (edge functions use service role)