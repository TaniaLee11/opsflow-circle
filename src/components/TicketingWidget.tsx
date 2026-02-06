import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, AlertCircle, Bug, Lightbulb, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

export function TicketingWidget() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [ticketType, setTicketType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ticketTypes = [
    { value: "error", label: "Error / Bug", icon: Bug, description: "Something isn't working" },
    { value: "request", label: "Feature Request", icon: Lightbulb, description: "I'd like to request a new feature" },
    { value: "enhancement", label: "Enhancement", icon: AlertCircle, description: "Improve existing functionality" },
    { value: "question", label: "Question", icon: HelpCircle, description: "I need help understanding something" },
  ];

  const handleSubmit = async () => {
    if (!ticketType || !description.trim()) {
      toast.error("Please select a ticket type and provide a description");
      return;
    }

    setSubmitting(true);

    try {
      // Create ticket in database
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user?.id,
        user_email: user?.email,
        organization_id: profile?.organization_id,
        ticket_type: ticketType,
        description: description.trim(),
        page_url: location.pathname,
        status: "open",
      });

      if (error) throw error;

      // Send notification email to owner
      await supabase.functions.invoke("send-email", {
        body: {
          to: "tania@virtualopsassist.com",
          subject: `New Support Ticket: ${ticketTypes.find((t) => t.value === ticketType)?.label}`,
          html: `
            <h2>New Support Ticket Submitted</h2>
            <p><strong>From:</strong> ${user?.email}</p>
            <p><strong>Organization:</strong> ${profile?.organization_name || "Unknown"}</p>
            <p><strong>Type:</strong> ${ticketTypes.find((t) => t.value === ticketType)?.label}</p>
            <p><strong>Page:</strong> ${location.pathname}</p>
            <p><strong>Description:</strong></p>
            <p>${description}</p>
            <hr>
            <p><small>View all tickets at: https://virtualopsassist.com/owner</small></p>
          `,
        },
      });

      toast.success("Ticket submitted! We'll review it shortly.");
      setOpen(false);
      setTicketType("");
      setDescription("");
    } catch (error: any) {
      console.error("Error submitting ticket:", error);
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Don't show widget if user is not logged in
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 glow-primary"
          title="Report an issue or request a feature"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit a Ticket</DialogTitle>
          <DialogDescription>
            Report an issue, request a feature, or ask a question. We'll get back to you shortly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-type">What type of ticket is this?</Label>
            <Select value={ticketType} onValueChange={setTicketType}>
              <SelectTrigger id="ticket-type">
                <SelectValue placeholder="Select ticket type" />
              </SelectTrigger>
              <SelectContent>
                {ticketTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please describe the issue, request, or question in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Current page: {location.pathname}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !ticketType || !description.trim()}>
            {submitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
