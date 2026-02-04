import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
 * Send email via Resend API
 */
async function sendEmailViaResend(
  to: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Virtual OPS <noreply@virtualopsassist.com>",
        to: [to],
        subject: subject,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend send failed:", errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: String(error) };
  }
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

    // Validate JWT
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

    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error("[send-cohort-invite] Auth error:", userError?.message);
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;
    console.log("User authenticated:", { userId, userEmail });

    // Check if user is an owner
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

    // Get user's organization
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("organization_id")
      .eq("user_id", userId)
      .single();

    const orgId = profile?.organization_id;
    if (!orgId) {
      throw new Error("User has no organization");
    }

    // Parse request
    const { email, resend } = await req.json();
    
    if (!email || !email.includes("@")) {
      throw new Error("Valid email is required");
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (userExists) {
      throw new Error("User already registered. Cannot send invite to existing users.");
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
    const origin = req.headers.get("origin") || "https://virtualopsassist.com";
    const inviteLink = `${origin}/auth?invite=${inviteCode}`;

    // Send email via Resend
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">You're Invited to the 60-Day AI Cohort!</h1>
        <p>You've been invited to join an exclusive 60-day AI transformation program.</p>
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

    const emailResult = await sendEmailViaResend(
      email,
      "You're Invited to the 60-Day AI Cohort!",
      emailHtml
    );

    if (!emailResult.success) {
      console.error("Email send failed:", emailResult.error);
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

    console.log(`Cohort invite sent to ${email} via Resend, messageId: ${emailResult.messageId}`);

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
