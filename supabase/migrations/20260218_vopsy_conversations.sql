-- Create vopsy_conversations table for storing chat history
CREATE TABLE IF NOT EXISTS vopsy_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  

);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_vopsy_conversations_user_created 
  ON vopsy_conversations (user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE vopsy_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own conversations
CREATE POLICY "Users can view own conversations"
  ON vopsy_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own conversations
CREATE POLICY "Users can insert own conversations"
  ON vopsy_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can do everything (for API endpoint)
CREATE POLICY "Service role has full access"
  ON vopsy_conversations
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE vopsy_conversations IS 'Stores VOPSy chat conversation history (last 10 messages per user)';
