import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decryptToken, encryptToken } from "../_shared/token-encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UploadResponse {
  success: boolean;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  error?: string;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails) {
    delete safeDetails.access_token;
    delete safeDetails.refresh_token;
  }
  console.log(`[GDRIVE-UPLOAD] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
};

// Refresh Google access token
async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    console.error("Missing Google OAuth credentials");
    return null;
  }

  try {
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
      logStep("Failed to refresh Google token", { status: response.status });
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    logStep("Error refreshing Google token", { error: String(error) });
    return null;
  }
}

// Upload file to Google Drive using resumable upload
async function uploadToGoogleDrive(
  accessToken: string,
  refreshToken: string | null,
  // deno-lint-ignore no-explicit-any
  supabase: any,
  integrationId: string,
  fileName: string,
  fileBlob: Blob,
  mimeType: string
): Promise<{ fileId?: string; webViewLink?: string; error?: string }> {
  let token = accessToken;

  // Step 1: Initiate resumable upload
  const metadata = {
    name: fileName,
    mimeType: mimeType,
  };

  let initResponse = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    }
  );

  // If token expired, try to refresh
  if (initResponse.status === 401 && refreshToken) {
    logStep("Access token expired, attempting refresh");
    const newToken = await refreshGoogleToken(refreshToken);
    
    if (newToken) {
      token = newToken;
      // Update the stored access token
      const encryptedToken = await encryptToken(newToken);
      await supabase
        .from("integrations")
        .update({ access_token: encryptedToken })
        .eq("id", integrationId);
      
      logStep("Token refreshed successfully");
      
      // Retry init
      initResponse = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadata),
        }
      );
    } else {
      return { error: "Token refresh failed" };
    }
  }

  if (!initResponse.ok) {
    const errorText = await initResponse.text();
    logStep("Failed to initiate upload", { status: initResponse.status, error: errorText });
    return { error: `Failed to initiate upload: ${initResponse.status}` };
  }

  const uploadUrl = initResponse.headers.get("Location");
  if (!uploadUrl) {
    return { error: "No upload URL returned from Google Drive" };
  }

  logStep("Got resumable upload URL");

  // Step 2: Upload the file content
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Length": fileBlob.size.toString(),
      "Content-Type": mimeType,
    },
    body: fileBlob,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    logStep("Upload failed", { status: uploadResponse.status, error: errorText });
    return { error: `Upload failed: ${uploadResponse.status}` };
  }

  const uploadedFile = await uploadResponse.json();
  logStep("File uploaded successfully", { fileId: uploadedFile.id });

  // Step 3: Get the web view link
  const fileResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${uploadedFile.id}?fields=webViewLink`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  let webViewLink = "";
  if (fileResponse.ok) {
    const fileData = await fileResponse.json();
    webViewLink = fileData.webViewLink || "";
  }

  return { fileId: uploadedFile.id, webViewLink };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Google Drive upload");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      logStep("Auth failed", { error: userError?.message });
      throw new Error("Unauthorized");
    }

    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const body = await req.json();
    const { documentId, storagePath, fileName, mimeType } = body;

    if (!documentId || !storagePath || !fileName) {
      throw new Error("Missing required fields: documentId, storagePath, fileName");
    }

    logStep("Upload request", { documentId, fileName, mimeType });

    // Get Google integration
    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .maybeSingle();

    if (integrationError) {
      logStep("Integration query error", { error: integrationError.message });
      throw new Error("Failed to fetch integration");
    }

    if (!integration) {
      logStep("No Google integration found");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Google Drive not connected. Please connect Google Drive in Integrations.",
        } as UploadResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if Drive scope is included
    const scopes = integration.scopes || "";
    if (!scopes.includes("drive")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Google Drive access not granted. Please reconnect with Drive permissions.",
        } as UploadResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrypt tokens
    const accessToken = await decryptToken(integration.access_token || "");
    const refreshToken = await decryptToken(integration.refresh_token || "");

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No valid access token. Please reconnect Google Drive.",
        } as UploadResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Download file from Supabase storage
    logStep("Downloading file from storage", { storagePath });
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("vault")
      .download(storagePath);

    if (downloadError || !fileData) {
      logStep("Failed to download file from storage", { error: downloadError?.message });
      throw new Error("Failed to retrieve file from vault");
    }

    // Use the Blob directly from storage download
    logStep("File downloaded", { size: fileData.size });

    // Upload to Google Drive
    const result = await uploadToGoogleDrive(
      accessToken,
      refreshToken,
      supabase,
      integration.id,
      fileName,
      fileData,
      mimeType || "application/octet-stream"
    );

    if (result.error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error,
        } as UploadResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response: UploadResponse = {
      success: true,
      fileId: result.fileId,
      fileName: fileName,
      webViewLink: result.webViewLink,
    };

    logStep("Upload complete", { fileId: result.fileId });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("Error in gdrive-upload", { error: String(error) });
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      } as UploadResponse),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
