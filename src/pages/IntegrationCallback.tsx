import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

      // Extract provider from state (format: uuid:provider)
      const [stateId, provider] = state.split(":");
      
      if (!provider || !stateId) {
        setStatus('error');
        setMessage("Invalid state parameter format");
        setTimeout(() => navigate("/integrations"), 3000);
        return;
      }

      try {
        setMessage(`Connecting to ${provider}...`);

        // The oauth-callback edge function will look up the user_id from the oauth_states table
        // using the state parameter. This is the secure way - we don't rely on browser session.
        // The state was stored with user_id when oauth-start was called (while user was authenticated).
        
        const { data, error: fnError } = await supabase.functions.invoke("oauth-callback", {
          body: { code, state: stateId, provider },
        });

        // Handle edge function errors with JSON body
        let body: any = data;
        if (!body && fnError && typeof (fnError as any).context?.json === "function") {
          body = await (fnError as any).context.json().catch(() => null);
        }

        const errorMessage = body?.error || (fnError instanceof Error ? fnError.message : null);

        if (errorMessage) {
          // Check for state/user-related errors
          if (
            errorMessage.toLowerCase().includes("state expired") ||
            errorMessage.toLowerCase().includes("user") ||
            errorMessage.toLowerCase().includes("identify") ||
            errorMessage.toLowerCase().includes("not found")
          ) {
            setStatus("auth_required");
            setMessage("Your session expired. Please log in and try connecting again.");
            toast.error("Session expired - please log in and reconnect");
            return; // Don't auto-redirect, let user click button
          }
          throw new Error(errorMessage);
        }

        setStatus("success");
        setMessage(`Successfully connected to ${provider}!`);
        toast.success(`Connected to ${provider}`);

        // Invalidate integrations query to update UI immediately
        queryClient.invalidateQueries({ queryKey: ["integrations"] });

        setTimeout(() => navigate("/integrations"), 2000);
      } catch (err) {
        console.error("OAuth callback error:", err);
        const errMsg = err instanceof Error ? err.message : "Failed to complete connection";
        setStatus("error");
        setMessage(errMsg);
        toast.error("Failed to connect integration");
        setTimeout(() => navigate("/integrations"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, queryClient]);

  const handleLoginRedirect = () => {
    navigate("/auth", { state: { returnTo: "/integrations" } });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 p-8 max-w-md">
        {status === 'processing' && (
          <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
        )}
        {status === 'error' && (
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
        )}
        {status === 'auth_required' && (
          <LogIn className="w-16 h-16 text-warning mx-auto" />
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
        
        {status === 'auth_required' ? (
          <Button onClick={handleLoginRedirect} className="gap-2">
            <LogIn className="w-4 h-4" />
            Log in to finish connecting
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            You'll be redirected automatically...
          </p>
        )}
      </div>
    </div>
  );
}
