import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function IntegrationCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState("Processing your connection...");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

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

        // Exchange code for tokens via edge function
        const { data, error: fnError } = await supabase.functions.invoke('oauth-callback', {
          body: { code, state: stateId, provider },
        });

        if (fnError) throw fnError;

        setStatus('success');
        setMessage(`Successfully connected to ${provider}!`);
        toast.success(`Connected to ${provider}`);
        
        setTimeout(() => navigate("/integrations"), 2000);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : "Failed to complete connection");
        toast.error("Failed to connect integration");
        setTimeout(() => navigate("/integrations"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        {status === 'processing' && (
          <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        )}
        {status === 'error' && (
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        )}
        
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {status === 'processing' && "Connecting..."}
            {status === 'success' && "Connected!"}
            {status === 'error' && "Connection Failed"}
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
