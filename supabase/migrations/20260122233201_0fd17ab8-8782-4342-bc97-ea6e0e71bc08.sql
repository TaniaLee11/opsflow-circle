-- Fix: Remove overly permissive anonymous access to cohort_invites
-- The validate-invite edge function uses service role for secure validation,
-- so we don't need public RLS access to the table.

-- Drop the dangerous policy that exposes all invite data
DROP POLICY IF EXISTS "Anyone can validate invite by code" ON public.cohort_invites;

-- Note: Invite validation is handled securely by the validate-invite edge function
-- which uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS when validating invite codes.
-- This ensures anonymous users can validate their invite without exposing all invites.