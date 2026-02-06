-- Webhook Infrastructure Tables
-- Purpose: Handle incoming webhooks from integrations with deduplication, retry logic, and audit trail

-- Webhook events table - stores all incoming webhook payloads
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'stripe', 'quickbooks', 'plaid', 'zapier', etc.
  event_type TEXT NOT NULL, -- 'invoice.paid', 'transaction.created', etc.
  event_id TEXT NOT NULL, -- External event ID for deduplication
  payload JSONB NOT NULL,
  signature TEXT,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_event_per_source UNIQUE(source, event_id)
);

-- Webhook processing queue - manages retry logic
CREATE TABLE IF NOT EXISTS webhook_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_event_id UUID REFERENCES webhook_events(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  next_retry_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON webhook_events(source);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_status ON webhook_queue(status);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_next_retry ON webhook_queue(next_retry_at);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_webhook_event_id ON webhook_queue(webhook_event_id);

-- Enable RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only service role can access webhook tables
CREATE POLICY "Service role full access to webhook_events"
  ON webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to webhook_queue"
  ON webhook_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_webhook_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on webhook_queue
CREATE TRIGGER webhook_queue_updated_at
  BEFORE UPDATE ON webhook_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_queue_updated_at();

COMMENT ON TABLE webhook_events IS 'Stores all incoming webhook payloads from integrations with deduplication';
COMMENT ON TABLE webhook_queue IS 'Manages webhook processing with retry logic and exponential backoff';
