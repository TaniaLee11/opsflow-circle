import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function IntegrationCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'processing' | 'success' | 'error' | 'auth_required'>('processing');
  const [message, setMessage] = useState("Processing your connection...");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      // Handle OAuth errors from provider
      if (error) {
        setStatus('error');
        setMessage(`Connection failed: ${error}`);
        toast.error("Integration connection failed");
        setTimeout(() => navigate("/integrations"), 3000);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage("Invalid callback - missing parameters");
        toast.error("Invalid callback");
        setTimeout(() => navigate("/integrations"), 3000);
        return;
      }

      // CRITICAL: Rehydrate session and validate user is authenticated
      setMessage("Verifying your session...");
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error("No authenticated session found during OAuth callback");
        setStatus('auth_required');
        setMessage("Please log in to connect your integration");
        toast.error("Authentication required - please log in first");
        // Store callback params to resume after login
        sessionStorage.setItem('pending_oauth_callback', JSON.stringify({ code, state }));
        setTimeout(() => navigate("/auth", { state: { returnTo: "/integrations" } }), 3000);
        return;
      }

      // Extract provider from state
      const [stateId, provider] = state.split(":");
      
      if (!provider) {
        setStatus('error');
        setMessage("Invalid state parameter");
        setTimeout(() => navigate("/integrations"), 3000);
        return;
      }

      try {
        setMessage(`Connecting to ${provider}...`);

        // Pass auth token to edge function for user identification
        const { data, error: fnError } = await supabase.functions.invoke("oauth-callback", {
          body: { code, state: stateId, provider },
        });

        // Handle edge function errors with JSON body
        let body: any = data;
        if (!body && fnError && typeof (fnError as any).context?.json === "function") {
          body = await (fnError as any).context.json().catch(() => null);
        }

        if (body?.error) {
          throw new Error(body.error);
        }
        if (fnError) throw fnError;

        setStatus("success");
        setMessage(`Successfully connected to ${provider}!`);
        toast.success(`Connected to ${provider}`);

        // Invalidate integrations query to update UI immediately
        queryClient.invalidateQueries({ queryKey: ["integrations"] });

        setTimeout(() => navigate("/integrations"), 2000);
      } catch (err) {
        console.error("OAuth callback error:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to complete connection";
        
        // Check for user-not-found specific error
        if (errorMessage.toLowerCase().includes("user") || errorMessage.toLowerCase().includes("identify")) {
          setStatus("auth_required");
          setMessage("Session expired - please log in to connect your integration");
          toast.error("Please log in to connect Google");
          setTimeout(() => navigate("/auth", { state: { returnTo: "/integrations" } }), 3000);
        } else {
          setStatus("error");
          setMessage(errorMessage);
          toast.error("Failed to connect integration");
          setTimeout(() => navigate("/integrations"), 3000);
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate, queryClient]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        {status === 'processing' && (
          <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
        )}
        {(status === 'error' || status === 'auth_required') && (
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
        )}
        
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {status === 'processing' && "Connecting..."}
            {status === 'success' && "Connected!"}
            {status === 'error' && "Connection Failed"}
            {status === 'auth_required' && "Login Required"}
          </h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
        
        <p className="text-sm text-muted-foreground">
          You'll be redirected automatically...
        </p>
      </div>
    </div>
  );
}
