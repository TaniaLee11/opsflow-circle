-- Step 1: Drop the column with the old enum
ALTER TABLE public.accounts DROP COLUMN IF EXISTS type;

-- Step 2: Drop the old enum type
DROP TYPE IF EXISTS public.account_type;

-- Step 3: Create new enum matching user tiers
CREATE TYPE public.account_type AS ENUM (
  'free',
  'ai_assistant', 
  'ai_operations',
  'ai_enterprise',
  'ai_advisory',
  'ai_tax',
  'ai_compliance'
);

-- Step 4: Add the column back with new enum and default
ALTER TABLE public.accounts 
ADD COLUMN type public.account_type NOT NULL DEFAULT 'free'::account_type;