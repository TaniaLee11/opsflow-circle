import { useState } from "react";
import { Webhook, Plus, Copy, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const { toast } = useToast();

  const handleCreateWebhook = () => {
    toast({
      title: "Create Webhook",
      description: "Webhook creation form coming soon",
    });
  };

  if (webhooks.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Webhooks</h1>
            <p className="text-muted-foreground mt-1">
              Send real-time data to external services
            </p>
          </div>
          <Button onClick={handleCreateWebhook}>
            <Plus className="w-4 h-4 mr-2" />
            Create Webhook
          </Button>
        </div>

        <EmptyState
          icon={Webhook}
          title="No webhooks configured"
          description="Create your first webhook to send real-time data to external services when events occur in your platform."
          actions={[
            {
              label: "Create Webhook",
              onClick: handleCreateWebhook,
            },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Events</CardTitle>
            <CardDescription>
              Webhooks can be triggered by the following events:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <code className="bg-muted px-2 py-1 rounded">contact.created</code> - New contact added to CRM</li>
              <li>• <code className="bg-muted px-2 py-1 rounded">deal.updated</code> - Deal stage or value changed</li>
              <li>• <code className="bg-muted px-2 py-1 rounded">deal.closed</code> - Deal marked as won or lost</li>
              <li>• <code className="bg-muted px-2 py-1 rounded">invoice.paid</code> - Invoice payment received</li>
              <li>• <code className="bg-muted px-2 py-1 rounded">task.completed</code> - Task marked as complete</li>
              <li>• <code className="bg-muted px-2 py-1 rounded">integration.synced</code> - Integration sync completed</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <div>Webhooks list view</div>;
}
