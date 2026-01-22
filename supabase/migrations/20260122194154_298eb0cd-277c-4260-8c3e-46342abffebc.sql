-- Add AI_COHORT to the subscription_tier check constraint on organizations table
-- First drop the existing constraint if it exists
ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_subscription_tier_check;

-- Create new constraint including AI_COHORT
ALTER TABLE public.organizations ADD CONSTRAINT organizations_subscription_tier_check 
CHECK (subscription_tier IS NULL OR subscription_tier = ANY (ARRAY['AI_FREE'::text, 'AI_ASSISTANT'::text, 'AI_OPERATIONS'::text, 'AI_COHORT'::text, 'AI_OPERATIONS_FULL'::text]));