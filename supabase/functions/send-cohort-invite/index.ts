import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { decryptToken, isEncrypted } from "../_shared/token-encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'COHORT-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Resolve credential - supports env: prefix and encrypted values
 */
async function resolveCredential(value: string | null | undefined): Promise<string> {
  if (!value) return "";
  if (value.startsWith("env:")) {
    const envName = value.replace("env:", "");
    return Deno.env.get(envName) || "";
  }
  if (isEncrypted(value)) {
    return await decryptToken(value);
  }
  return value;
}

/**
 * Get OAuth credentials from integration_configs
 */
async function getOAuthCredentials(
  supabase: any,
  provider: string
): Promise<{ clientId: string; clientSecret: string } | null> {
  const { data: config } = await supabase
    .from("integration_configs")
    .select("client_id, client_secret")
    .eq("provider", provider)
    .maybeSingle();

  if (!config) return null;

  const clientId = await resolveCredential((config as any).client_id);
  const clientSecret = await resolveCredential((config as any).client_secret);

  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

/**
 * Refresh Google access token
 */
async function refreshGoogleToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    console.error("Token refresh failed:", await response.text());
    return null;
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Send email via Gmail API
 */
async function sendGmailEmail(
  accessToken: string,
  to: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Build RFC 2822 message
  const messageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/html; charset=utf-8`,
    `MIME-Version: 1.0`,
    "",
    htmlBody,
  ];
  const message = messageParts.join("\r\n");

  // Base64url encode
  const encodedMessage = btoa(message)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encodedMessage }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gmail send failed:", errorText);
    return { success: false, error: errorText };
  }

  const result = await response.json();
  return { success: true, messageId: result.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Validate JWT using claims
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = claimsData.claims.sub;
    const userEmail = (claimsData.claims as any).email as string | undefined;
    console.log("User authenticated:", { userId, userEmail });

    // Check if user is an owner (use admin client to bypass RLS)
    const { data: ownerRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "owner")
      .maybeSingle();

    console.log("Role check result:", { userId, ownerRole, roleError });

    if (roleError || !ownerRole) {
      throw new Error("Only owners can send cohort invites");
    }

    // Get user's Google integration tokens
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("organization_id")
      .eq("user_id", userId)
      .single();

    const orgId = profile?.organization_id;
    if (!orgId) {
      throw new Error("User has no organization");
    }

    const { data: googleIntegration } = await supabaseAdmin
      .from("integrations")
      .select("access_token, refresh_token, health")
      .eq("user_id", userId)
      .eq("org_id", orgId)
      .eq("provider", "google")
      .maybeSingle();

    if (!googleIntegration || !googleIntegration.refresh_token) {
      throw new Error("Google not connected. Please connect Google from Integrations page.");
    }

    // Decrypt tokens
    let refreshToken = googleIntegration.refresh_token;
    if (isEncrypted(refreshToken)) {
      refreshToken = await decryptToken(refreshToken);
    }

    // Get OAuth credentials
    const credentials = await getOAuthCredentials(supabaseAdmin, "google");
    if (!credentials) {
      throw new Error("Google OAuth not configured");
    }

    // Refresh access token
    const accessToken = await refreshGoogleToken(
      refreshToken,
      credentials.clientId,
      credentials.clientSecret
    );

    if (!accessToken) {
      // Mark integration as needing reauth
      await supabaseAdmin
        .from("integrations")
        .update({ health: "reauth_required" })
        .eq("user_id", userId)
        .eq("org_id", orgId)
        .eq("provider", "google");
      throw new Error("Google token expired. Please reconnect Google from Integrations page.");
    }

    // Parse request
    const { email, resend } = await req.json();
    
    if (!email || !email.includes("@")) {
      throw new Error("Valid email is required");
    }

    // If resend, delete any existing pending invite for this email
    if (resend) {
      await supabaseAdmin
        .from("cohort_invites")
        .delete()
        .eq("email", email.toLowerCase())
        .eq("status", "pending");
    }

    // Generate invite
    const inviteCode = generateInviteCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invite record
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("cohort_invites")
      .insert({
        invite_code: inviteCode,
        email: email.toLowerCase(),
        invited_by: userId,
        organization_id: orgId,
        expires_at: expiresAt.toISOString(),
        status: "pending"
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Invite creation error:", inviteError);
      throw new Error("Failed to create invite");
    }

    // Build the invite link
    const origin = req.headers.get("origin") || "https://www.virtualopsassist.com";
    const inviteLink = `${origin}/auth?invite=${inviteCode}`;

    // Send email via Gmail
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">You're Invited to the 90-Day AI Cohort!</h1>
        <p>You've been invited to join an exclusive 90-day AI transformation program.</p>
        <p>This cohort gives you access to:</p>
        <ul>
          <li>AI-powered operations tools</li>
          <li>Academy training resources</li>
          <li>Financial intelligence hub</li>
          <li>Workflow automation</li>
        </ul>
        <p style="margin: 30px 0;">
          <a href="${inviteLink}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This invite expires in 7 days. If you have questions, reply to this email.
        </p>
        <p style="color: #999; font-size: 12px;">
          Invite code: ${inviteCode}
        </p>
      </div>
    `;

    const emailResult = await sendGmailEmail(
      accessToken,
      email,
      "You're Invited to the 90-Day AI Cohort!",
      emailHtml
    );

    if (!emailResult.success) {
      console.error("Gmail send failed:", emailResult.error);
      // Still return success since invite was created
      return new Response(
        JSON.stringify({ 
          success: true,
          emailSent: false,
          emailError: "Email failed to send. Share the link manually.",
          invite: {
            id: invite.id,
            email: email,
            inviteCode: inviteCode,
            inviteLink: inviteLink,
            expiresAt: expiresAt.toISOString()
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Cohort invite sent to ${email} via Gmail, messageId: ${emailResult.messageId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        emailSent: true,
        invite: {
          id: invite.id,
          email: email,
          inviteCode: inviteCode,
          inviteLink: inviteLink,
          expiresAt: expiresAt.toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
