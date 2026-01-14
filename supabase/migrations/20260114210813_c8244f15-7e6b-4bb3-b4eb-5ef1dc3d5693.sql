-- Create table to track studio generations for rate limiting
CREATE TABLE public.studio_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  prompt TEXT,
  tier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient rate limit queries
CREATE INDEX idx_studio_generations_user_time
  ON studio_generations(user_id, created_at);

-- Enable RLS
ALTER TABLE studio_generations ENABLE ROW LEVEL SECURITY;

-- Users can only view their own generations
CREATE POLICY "Users view own generations"
  ON studio_generations FOR SELECT
  USING (auth.uid() = user_id);

-- Platform owners can view all generations
CREATE POLICY "Platform owners view all generations"
  ON studio_generations FOR SELECT
  USING (public.is_platform_owner(auth.uid()));

-- Service role insert policy (edge functions use service role)
CREATE POLICY "Service role can insert generations"
  ON studio_generations FOR INSERT
  WITH CHECK (true);