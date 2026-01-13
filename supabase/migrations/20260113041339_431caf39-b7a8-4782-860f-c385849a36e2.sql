-- Create table for storing OAuth app credentials (owner-only configuration)
CREATE TABLE public.integration_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for OAuth state verification
CREATE TABLE public.oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- RLS policies for integration_configs (owner-only access)
CREATE POLICY "Only owners can view integration configs"
  ON public.integration_configs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'owner'
    )
  );

CREATE POLICY "Only owners can insert integration configs"
  ON public.integration_configs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'owner'
    )
  );

CREATE POLICY "Only owners can update integration configs"
  ON public.integration_configs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'owner'
    )
  );

CREATE POLICY "Only owners can delete integration configs"
  ON public.integration_configs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'owner'
    )
  );

-- RLS policies for oauth_states (users can only see their own states)
CREATE POLICY "Users can view their own oauth states"
  ON public.oauth_states
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own oauth states"
  ON public.oauth_states
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own oauth states"
  ON public.oauth_states
  FOR DELETE
  USING (auth.uid() = user_id);

-- Cleanup expired states automatically (via cron or trigger)
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.oauth_states WHERE expires_at < now();
END;
$$;

-- Add timestamp trigger for integration_configs
CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();