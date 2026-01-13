import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Users, 
  Clock, 
  Link2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InviteResult {
  email: string;
  inviteCode: string;
  inviteLink: string;
  expiresAt: string;
}

export function CohortInvitePanel() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentInvites, setRecentInvites] = useState<InviteResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

      if (data.success && data.invite) {
        setRecentInvites(prev => [data.invite, ...prev].slice(0, 5));
        setEmail("");
        toast.success(`Invite sent to ${data.invite.email}`);
      }
    } catch (error: any) {
      console.error("Invite error:", error);
      toast.error(error.message || "Failed to send invite");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
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

        {/* Recent Invites */}
        <AnimatePresence>
          {recentInvites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Recent Invites
              </p>
              {recentInvites.map((invite) => (
                <motion.div
                  key={invite.inviteCode}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{invite.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {invite.inviteCode}
                        </code>
                        <span className="text-[10px] text-muted-foreground">
                          Expires {new Date(invite.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(invite.inviteLink, invite.inviteCode)}
                      className="shrink-0"
                    >
                      {copiedId === invite.inviteCode ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Copy the invite link and send it via email to your invitee. They'll use 
            this link to create their cohort account.
          </p>
        </div>
      </div>
    </div>
  );
}