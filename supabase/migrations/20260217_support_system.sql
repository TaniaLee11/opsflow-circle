-- Support Tickets and Escalations System
-- VOPSy triages issues into tickets (async) or escalations (live support)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Support tickets (async issues - bugs, features, questions)
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_name TEXT,
  user_email TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'bug', 'feature', 'data', 'ui', 'access'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'waiting', 'resolved', 'closed'
  vopsy_conversation JSONB, -- full chat history for context
  estimated_eta TEXT, -- "24-48 hours", "1-2 days", etc.
  assigned_to TEXT, -- owner email or team member
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Live support escalations (needs human NOW)
CREATE TABLE IF NOT EXISTS support_escalations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_name TEXT,
  user_email TEXT,
  summary TEXT NOT NULL, -- VOPSy's summary of the issue
  vopsy_conversation JSONB, -- full chat history for context
  urgency TEXT DEFAULT 'normal', -- 'normal', 'high'
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'connected', 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  owner_notified_at TIMESTAMPTZ,
  last_followup_at TIMESTAMPTZ,
  followup_count INTEGER DEFAULT 0,
  connection_method TEXT -- 'chat', 'zoom', 'phone', 'email'
);

-- Support ticket comments (for back-and-forth)
CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL, -- 'user', 'owner', 'vopsy'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escalations_user_id ON support_escalations(user_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON support_escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_created_at ON support_escalations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);

-- Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Users see their own tickets
CREATE POLICY "Users see own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owner sees ALL tickets and escalations
CREATE POLICY "Owner sees all tickets" ON support_tickets
  FOR ALL USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owner sees all escalations" ON support_escalations
  FOR ALL USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Users can see their own escalation status
CREATE POLICY "Users see own escalations" ON support_escalations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own escalations" ON support_escalations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ticket comments policies
CREATE POLICY "Users see comments on their tickets" ON ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE id = ticket_comments.ticket_id 
      AND user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Users can comment on their tickets" ON ticket_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE id = ticket_comments.ticket_id 
      AND user_id = auth.uid()
    )
  );

-- Function to generate ticket numbers (format: TICK-YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  sequence_part TEXT;
  ticket_count INTEGER;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Count tickets created today
  SELECT COUNT(*) INTO ticket_count
  FROM support_tickets
  WHERE DATE(created_at) = CURRENT_DATE;
  
  sequence_part := LPAD((ticket_count + 1)::TEXT, 4, '0');
  
  RETURN 'TICK-' || date_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket number on insert
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ticket_timestamp
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
