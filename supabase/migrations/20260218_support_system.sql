-- Support Triage System: Tickets & Escalations
-- VOPSy decides: async ticket or live escalation
-- 15-minute follow-up loop for pending escalations

-- Support Tickets (async, non-urgent)
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- 'billing', 'technical', 'feature_request', 'other'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high'
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  vopsy_conversation JSONB, -- chat history leading to ticket
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Escalations (live, urgent)
CREATE TABLE IF NOT EXISTS support_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  summary TEXT NOT NULL, -- VOPSy's summary of the issue
  vopsy_conversation JSONB NOT NULL, -- full chat history
  urgency TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'resolved', 'cancelled'
  owner_notified_at TIMESTAMPTZ DEFAULT NOW(),
  last_followup_at TIMESTAMPTZ DEFAULT NOW(),
  followup_count INTEGER DEFAULT 0,
  accepted_at TIMESTAMPTZ,
  connection_method TEXT, -- 'chat', 'zoom', 'phone', 'email'
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Comments (for async support)
CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL, -- 'user', 'owner', 'vopsy'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_escalations_user_id ON support_escalations(user_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON support_escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_followup ON support_escalations(last_followup_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON ticket_comments(ticket_id);

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own escalations
CREATE POLICY "Users can view own escalations"
  ON support_escalations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create escalations
CREATE POLICY "Users can create escalations"
  ON support_escalations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view comments on their tickets
CREATE POLICY "Users can view own ticket comments"
  ON ticket_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_comments.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Users can add comments to their tickets
CREATE POLICY "Users can add comments to own tickets"
  ON ticket_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_comments.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Owner (Tania) can view ALL tickets and escalations
-- Note: This requires a separate service role key or admin check in API
