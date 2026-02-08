-- Bypass Codes System for Manual Payment Clients
-- Allows owner to generate codes for AI Tax, AI Advisory, AI Compliance tiers
-- for clients who pay outside the platform (QuickBooks, cash, check, etc.)

-- Create bypass_codes table
CREATE TABLE IF NOT EXISTS bypass_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  tier_id VARCHAR(50) NOT NULL CHECK (tier_id IN ('ai_tax', 'ai_advisory', 'ai_compliance')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER DEFAULT 1, -- 1 for single-use, NULL for unlimited
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT, -- Owner can add notes about the client or payment arrangement
  
  -- Metadata
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bypass_code_redemptions table to track who used which code
CREATE TABLE IF NOT EXISTS bypass_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES bypass_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent same user from using same code twice
  UNIQUE(code_id, user_id)
);

-- Add manual_payment flag to accounts table
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS manual_payment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bypass_code_used UUID REFERENCES bypass_codes(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bypass_codes_tier ON bypass_codes(tier_id);
CREATE INDEX IF NOT EXISTS idx_bypass_codes_active ON bypass_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_bypass_codes_created_by ON bypass_codes(created_by);
CREATE INDEX IF NOT EXISTS idx_bypass_code_redemptions_code ON bypass_code_redemptions(code_id);
CREATE INDEX IF NOT EXISTS idx_bypass_code_redemptions_user ON bypass_code_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_manual_payment ON accounts(manual_payment);

-- Create updated_at trigger for bypass_codes
CREATE OR REPLACE FUNCTION update_bypass_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bypass_codes_updated_at
BEFORE UPDATE ON bypass_codes
FOR EACH ROW
EXECUTE FUNCTION update_bypass_codes_updated_at();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE bypass_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bypass_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Bypass Codes Policies
-- Only platform owner can view/create/manage bypass codes
CREATE POLICY "Platform owner can manage bypass codes"
ON bypass_codes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'owner'
  )
);

-- Bypass Code Redemptions Policies
-- Owner can view all redemptions
CREATE POLICY "Platform owner can view all redemptions"
ON bypass_code_redemptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'owner'
  )
);

-- Users can view their own redemptions
CREATE POLICY "Users can view their own redemptions"
ON bypass_code_redemptions
FOR SELECT
USING (user_id = auth.uid());

-- Users can redeem codes (insert only)
CREATE POLICY "Users can redeem codes"
ON bypass_code_redemptions
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create function to generate random code
CREATE OR REPLACE FUNCTION generate_bypass_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluding similar-looking characters
  result VARCHAR(20) := '';
  i INTEGER;
BEGIN
  -- Generate format: XXXX-XXXX-XXXX-XXXX
  FOR i IN 1..4 LOOP
    FOR j IN 1..4 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    IF i < 4 THEN
      result := result || '-';
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate and redeem code
CREATE OR REPLACE FUNCTION redeem_bypass_code(
  p_code VARCHAR(20),
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_code_record RECORD;
  v_tier_id VARCHAR(50);
BEGIN
  -- Find the code
  SELECT * INTO v_code_record
  FROM bypass_codes
  WHERE code = p_code
  AND is_active = TRUE
  AND (expires_at IS NULL OR expires_at > NOW())
  FOR UPDATE;
  
  -- Check if code exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Invalid or expired code'
    );
  END IF;
  
  -- Check if code has remaining uses
  IF v_code_record.max_uses IS NOT NULL AND v_code_record.current_uses >= v_code_record.max_uses THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Code has reached maximum uses'
    );
  END IF;
  
  -- Check if user already redeemed this code
  IF EXISTS (
    SELECT 1 FROM bypass_code_redemptions
    WHERE code_id = v_code_record.id
    AND user_id = p_user_id
  ) THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Code already redeemed by this user'
    );
  END IF;
  
  -- Redeem the code
  INSERT INTO bypass_code_redemptions (code_id, user_id)
  VALUES (v_code_record.id, p_user_id);
  
  -- Increment usage count
  UPDATE bypass_codes
  SET current_uses = current_uses + 1
  WHERE id = v_code_record.id;
  
  -- Update user's account
  UPDATE accounts
  SET 
    tier_id = v_code_record.tier_id,
    manual_payment = TRUE,
    bypass_code_used = v_code_record.id,
    subscription_confirmed = TRUE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'tier_id', v_code_record.tier_id,
    'message', 'Code redeemed successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
