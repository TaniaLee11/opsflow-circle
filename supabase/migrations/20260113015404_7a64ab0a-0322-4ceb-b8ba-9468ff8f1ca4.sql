-- Create cohort_invites table to track invite codes
CREATE TABLE public.cohort_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired'))
);

-- Create cohort_memberships table to track active cohort users
CREATE TABLE public.cohort_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '90 days'),
  converted_at TIMESTAMP WITH TIME ZONE,
  converted_to_tier TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'upgraded'))
);

-- Enable RLS
ALTER TABLE public.cohort_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_memberships ENABLE ROW LEVEL SECURITY;

-- RLS policies for cohort_invites
CREATE POLICY "Owners can view their org invites"
ON public.cohort_invites
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "Owners can create invites"
ON public.cohort_invites
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- RLS policies for cohort_memberships
CREATE POLICY "Users can view their own membership"
ON public.cohort_memberships
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can manage memberships"
ON public.cohort_memberships
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_cohort_invites_email ON public.cohort_invites(email);
CREATE INDEX idx_cohort_invites_code ON public.cohort_invites(invite_code);
CREATE INDEX idx_cohort_memberships_user ON public.cohort_memberships(user_id);
CREATE INDEX idx_cohort_memberships_expires ON public.cohort_memberships(expires_at) WHERE status = 'active';