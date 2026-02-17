import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  }[];
}

export function EmptyState({ icon: Icon, title, description, actions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Icon className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {actions && actions.length > 0 && (
        <div className="flex gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || "default"}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
