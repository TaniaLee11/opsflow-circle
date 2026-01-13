-- =========================================================
-- PLATFORM HIERARCHY: ACCOUNTS + MEMBERSHIPS + INVITATIONS
-- =========================================================

-- Account types
CREATE TYPE public.account_type AS ENUM ('individual', 'enterprise');
CREATE TYPE public.membership_role AS ENUM ('primary', 'member');
CREATE TYPE public.membership_status AS ENUM ('active', 'pending', 'suspended', 'removed');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- =========================================================
-- ACCOUNTS TABLE
-- Represents customer accounts (individual or enterprise)
-- =========================================================
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type account_type NOT NULL DEFAULT 'individual',
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Account settings
  settings JSONB DEFAULT '{}',
  
  -- For enterprise accounts
  company_name TEXT,
  industry TEXT,
  website TEXT,
  phone TEXT,
  address JSONB
);

-- =========================================================
-- ACCOUNT_MEMBERSHIPS TABLE
-- Links users to accounts with roles
-- =========================================================
CREATE TABLE public.account_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role membership_role NOT NULL DEFAULT 'member',
  status membership_status NOT NULL DEFAULT 'active',
  
  -- Metadata
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  invited_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint: one membership per user per account
  UNIQUE(account_id, user_id)
);

-- =========================================================
-- INVITATIONS TABLE
-- For inviting new team members to accounts
-- =========================================================
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role membership_role NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status invitation_status NOT NULL DEFAULT 'pending',
  
  -- Tracking
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Unique: one pending invite per email per account
  UNIQUE(account_id, email)
);

-- =========================================================
-- ENABLE RLS
-- =========================================================
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- HELPER FUNCTION: Check if user is platform owner
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_platform_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'owner'
  );
$$;

-- =========================================================
-- HELPER FUNCTION: Check if user is primary member of account
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_account_primary(_user_id UUID, _account_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_memberships
    WHERE user_id = _user_id 
      AND account_id = _account_id 
      AND role = 'primary'
      AND status = 'active'
  );
$$;

-- =========================================================
-- HELPER FUNCTION: Check if user is member of account
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_account_member(_user_id UUID, _account_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_memberships
    WHERE user_id = _user_id 
      AND account_id = _account_id 
      AND status = 'active'
  );
$$;

-- =========================================================
-- RLS POLICIES: ACCOUNTS
-- =========================================================

-- Platform owner can read all accounts
CREATE POLICY "Platform owner can read all accounts"
  ON public.accounts FOR SELECT
  USING (public.is_platform_owner(auth.uid()));

-- Account members can read their account
CREATE POLICY "Members can read their account"
  ON public.accounts FOR SELECT
  USING (public.is_account_member(auth.uid(), id));

-- Primary members can update their account
CREATE POLICY "Primary members can update their account"
  ON public.accounts FOR UPDATE
  USING (public.is_account_primary(auth.uid(), id));

-- Users can create their own account (during onboarding)
CREATE POLICY "Users can create account"
  ON public.accounts FOR INSERT
  WITH CHECK (true);

-- =========================================================
-- RLS POLICIES: ACCOUNT_MEMBERSHIPS
-- =========================================================

-- Platform owner can read all memberships
CREATE POLICY "Platform owner can read all memberships"
  ON public.account_memberships FOR SELECT
  USING (public.is_platform_owner(auth.uid()));

-- Members can read memberships in their accounts
CREATE POLICY "Members can read account memberships"
  ON public.account_memberships FOR SELECT
  USING (public.is_account_member(auth.uid(), account_id));

-- Primary members can manage memberships
CREATE POLICY "Primary members can insert memberships"
  ON public.account_memberships FOR INSERT
  WITH CHECK (public.is_account_primary(auth.uid(), account_id) OR auth.uid() = user_id);

CREATE POLICY "Primary members can update memberships"
  ON public.account_memberships FOR UPDATE
  USING (public.is_account_primary(auth.uid(), account_id));

CREATE POLICY "Primary members can delete memberships"
  ON public.account_memberships FOR DELETE
  USING (public.is_account_primary(auth.uid(), account_id));

-- =========================================================
-- RLS POLICIES: INVITATIONS
-- =========================================================

-- Platform owner can read all invitations
CREATE POLICY "Platform owner can read all invitations"
  ON public.invitations FOR SELECT
  USING (public.is_platform_owner(auth.uid()));

-- Primary members can read their account invitations
CREATE POLICY "Primary members can read account invitations"
  ON public.invitations FOR SELECT
  USING (public.is_account_primary(auth.uid(), account_id));

-- Primary members can create invitations
CREATE POLICY "Primary members can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (public.is_account_primary(auth.uid(), account_id));

-- Primary members can update invitations
CREATE POLICY "Primary members can update invitations"
  ON public.invitations FOR UPDATE
  USING (public.is_account_primary(auth.uid(), account_id));

-- Primary members can delete invitations
CREATE POLICY "Primary members can delete invitations"
  ON public.invitations FOR DELETE
  USING (public.is_account_primary(auth.uid(), account_id));

-- =========================================================
-- TRIGGER: Update updated_at timestamp
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_memberships_updated_at
  BEFORE UPDATE ON public.account_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- INDEXES for performance
-- =========================================================
CREATE INDEX idx_account_memberships_user ON public.account_memberships(user_id);
CREATE INDEX idx_account_memberships_account ON public.account_memberships(account_id);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_account ON public.invitations(account_id);

-- =========================================================
-- Link profiles to accounts (add account_id column)
-- =========================================================
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS primary_account_id UUID REFERENCES public.accounts(id);