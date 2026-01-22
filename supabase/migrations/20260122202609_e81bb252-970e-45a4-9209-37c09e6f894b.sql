-- Add vopsy_initialized flag to profiles table
-- This flag ensures the first-login VOPSy interaction only runs once per user

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vopsy_initialized boolean DEFAULT false;

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_vopsy_initialized ON public.profiles(user_id) WHERE vopsy_initialized = false;