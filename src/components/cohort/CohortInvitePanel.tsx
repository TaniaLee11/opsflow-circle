import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Users, 
  Clock, 
  Loader2,
  AlertCircle,
  Trash2,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CohortInvite {
  id: string;
  email: string;
  invite_code: string;
  status: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export function CohortInvitePanel() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all invites from database
  const { data: invites = [], isLoading: invitesLoading } = useQuery({
    queryKey: ["cohort-invites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cohort_invites")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as CohortInvite[];
    },
  });

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-cohort-invite", {
        body: { email }
      });

      if (error) throw error;

      if (data.success) {
        setEmail("");
        toast.success(`Invite sent to ${email}`);
        queryClient.invalidateQueries({ queryKey: ["cohort-invites"] });
      }
    } catch (error: any) {
      console.error("Invite error:", error);
      toast.error(error.message || "Failed to send invite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (invite: CohortInvite) => {
    setResendingId(invite.id);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-cohort-invite", {
        body: { email: invite.email, resend: true }
      });

      if (error) throw error;

      toast.success(`Invite resent to ${invite.email}`);
      queryClient.invalidateQueries({ queryKey: ["cohort-invites"] });
    } catch (error: any) {
      console.error("Resend error:", error);
      toast.error(error.message || "Failed to resend invite");
    } finally {
      setResendingId(null);
    }
  };

  const handleDelete = async (invite: CohortInvite) => {
    setDeletingId(invite.id);
    
    try {
      const { error } = await supabase
        .from("cohort_invites")
        .delete()
        .eq("id", invite.id);

      if (error) throw error;

      toast.success(`Invite for ${invite.email} deleted`);
      queryClient.invalidateQueries({ queryKey: ["cohort-invites"] });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete invite");
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = async (inviteCode: string, id: string) => {
    const link = `${window.location.origin}/auth?invite=${inviteCode}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (invite: CohortInvite) => {
    if (invite.status === "accepted") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
          <CheckCircle2 className="w-3 h-3" />
          Accepted
        </span>
      );
    }
    
    if (new Date(invite.expires_at) < new Date()) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
          <AlertCircle className="w-3 h-3" />
          Expired
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-primary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Cohort Invites</h3>
            <p className="text-xs text-muted-foreground">
              Invite users to the 90-day cohort program
            </p>
          </div>
        </div>
      </div>

      {/* Invite Form */}
      <div className="p-5 space-y-4">
        <form onSubmit={handleSendInvite} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading || !email}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Invite
              </>
            )}
          </Button>
        </form>

        {/* Cohort Info */}
        <div className="p-3 rounded-lg bg-muted/50 text-sm">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">90-Day AI Operations Access</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Invited users receive full AI Operations functionality. After 90 days, 
                they auto-convert to AI Free and can upgrade via subscription.
              </p>
            </div>
          </div>
        </div>

        {/* All Invites */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              All Invites
            </p>
            {invitesLoading && (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            )}
          </div>
          
          {invites.length === 0 && !invitesLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No invites sent yet
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              <AnimatePresence>
                {invites.map((invite) => (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground truncate">{invite.email}</p>
                          {getStatusBadge(invite)}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {invite.invite_code}
                          </code>
                          <span className="text-[10px] text-muted-foreground">
                            {invite.status === "accepted" 
                              ? `Accepted ${new Date(invite.accepted_at!).toLocaleDateString()}`
                              : `Expires ${new Date(invite.expires_at).toLocaleDateString()}`
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Copy Link */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(invite.invite_code, invite.id)}
                          className="h-8 w-8 p-0"
                          title="Copy invite link"
                        >
                          {copiedId === invite.id ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        
                        {/* Resend (only for pending/expired, not accepted) */}
                        {invite.status !== "accepted" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResend(invite)}
                            disabled={resendingId === invite.id}
                            className="h-8 w-8 p-0"
                            title="Resend invite"
                          >
                            {resendingId === invite.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                        
                        {/* Delete (only for pending/expired, not accepted) */}
                        {invite.status !== "accepted" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invite)}
                            disabled={deletingId === invite.id}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Delete invite"
                          >
                            {deletingId === invite.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Invites are sent via email. You can also copy the link to share manually.
            The invite link will log out any existing session to ensure a fresh signup.
          </p>
        </div>
      </div>
    </div>
  );
}