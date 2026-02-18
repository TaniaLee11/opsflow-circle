-- Support Tickets (async issues)
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_number SERIAL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,           -- 'bug', 'feature', 'data', 'ui', 'access'
  priority TEXT DEFAULT 'normal',   -- 'low', 'normal', 'high', 'urgent'
  status TEXT DEFAULT 'open',       -- 'open', 'in_progress', 'resolved', 'closed'
  estimated_eta TEXT,               -- VOPSy's estimate: "24-48 hours"
  vopsy_conversation JSONB,         -- chat history that led to ticket
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Live Support Escalations (needs human NOW)
CREATE TABLE IF NOT EXISTS support_escalations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_name TEXT,
  user_email TEXT,
  summary TEXT NOT NULL,             -- VOPSy's summary of the issue
  vopsy_conversation JSONB,          -- full chat history for context
  status TEXT DEFAULT 'pending',     -- 'pending', 'accepted', 'connected', 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  owner_notified_at TIMESTAMPTZ,
  last_followup_at TIMESTAMPTZ,
  followup_count INTEGER DEFAULT 0,
  connection_method TEXT              -- 'chat', 'zoom', 'phone', 'email'
);

-- Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_escalations ENABLE ROW LEVEL SECURITY;

-- Users see their own tickets
CREATE POLICY "Users see own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own tickets" ON support_tickets
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

-- Indexes for performance
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_escalations_user_id ON support_escalations(user_id);
CREATE INDEX idx_support_escalations_status ON support_escalations(status);
CREATE INDEX idx_support_escalations_created_at ON support_escalations(created_at);
