import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create tables one by one
    const tables = [
      `CREATE TABLE IF NOT EXISTS managed_pipeline (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
        ghl_sub_account_id TEXT,
        managed_by UUID REFERENCES auth.users(id),
        status TEXT DEFAULT 'active',
        replaced_at TIMESTAMPTZ,
        replaced_by_provider TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS pipeline_summary (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        total_contacts INTEGER DEFAULT 0,
        total_deals INTEGER DEFAULT 0,
        total_campaigns INTEGER DEFAULT 0,
        active_campaigns INTEGER DEFAULT 0,
        emails_sent_30d INTEGER DEFAULT 0,
        emails_opened_30d INTEGER DEFAULT 0,
        emails_clicked_30d INTEGER DEFAULT 0,
        sms_sent_30d INTEGER DEFAULT 0,
        deals_won_30d INTEGER DEFAULT 0,
        deals_lost_30d INTEGER DEFAULT 0,
        revenue_30d DECIMAL(10,2) DEFAULT 0,
        last_synced_at TIMESTAMPTZ DEFAULT NOW(),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, provider)
      )`,
      
      `CREATE TABLE IF NOT EXISTS pipeline_contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        external_id TEXT NOT NULL,
        name TEXT,
        email TEXT,
        phone TEXT,
        company TEXT,
        status TEXT,
        tags TEXT[],
        last_contact_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        metadata JSONB DEFAULT '{}',
        UNIQUE(user_id, provider, external_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS pipeline_deals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        external_id TEXT NOT NULL,
        contact_id UUID,
        name TEXT NOT NULL,
        value DECIMAL(10,2),
        stage TEXT,
        probability INTEGER,
        expected_close_date DATE,
        status TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        closed_at TIMESTAMPTZ,
        metadata JSONB DEFAULT '{}',
        UNIQUE(user_id, provider, external_id)
      )`
    ];

    const results = [];
    for (const sql of tables) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql });
      if (error && !error.message.includes('already exists')) {
        results.push({ error: error.message, sql: sql.substring(0, 100) });
      } else {
        results.push({ success: true });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
