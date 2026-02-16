import { Plus, Building2, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CRM() {
  const hasContacts = false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM</h1>
          <p className="text-muted-foreground mt-1">
            Manage contacts, companies, and relationships
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {!hasContacts ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Contacts Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Add your first contact to start building your CRM database. Contacts sync from GoHighLevel, Google Contacts, and Gmail.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
