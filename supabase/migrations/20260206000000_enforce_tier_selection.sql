-- Enforce tier selection: Add NOT NULL constraint to tier_id in accounts table
-- This prevents users from completing signup without selecting a subscription tier

-- First, update any existing NULL tier_id values to 'free' tier (safety measure)
UPDATE accounts 
SET tier_id = 'free' 
WHERE tier_id IS NULL;

-- Now add the NOT NULL constraint
ALTER TABLE accounts 
ALTER COLUMN tier_id SET NOT NULL;

-- Add a comment explaining the constraint
COMMENT ON COLUMN accounts.tier_id IS 'User subscription tier - REQUIRED. Cannot be NULL. All users must have a tier assigned during onboarding.';
