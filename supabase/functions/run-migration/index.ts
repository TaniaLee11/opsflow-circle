import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sql } = await req.json();
    
    if (!sql) {
      return new Response(
        JSON.stringify({ error: "SQL query required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get database URL from environment
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) {
      throw new Error("SUPABASE_DB_URL not set");
    }

    // Connect to database
    const pool = new postgres.Pool(dbUrl, 3, true);
    const connection = await pool.connect();

    try {
      // Execute the SQL
      const result = await connection.queryObject(sql);
      
      return new Response(
        JSON.stringify({ success: true, rowCount: result.rowCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Migration error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
