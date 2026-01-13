import { useClientView } from "@/contexts/ClientViewContext";
import { useNavigate } from "react-router-dom";
import { Eye, X, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClientViewBanner() {
  const { viewedClient, isViewingClient, clearViewedClient } = useClientView();
  const navigate = useNavigate();

  if (!isViewingClient || !viewedClient) return null;

  const handleExit = () => {
    clearViewedClient();
    navigate(`/portal/${viewedClient.tier}`);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning/90 text-warning-foreground px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">
            Viewing as: 
          </span>
          <span className="flex items-center gap-1.5">
            {viewedClient.companyName && (
              <>
                <Building2 className="w-3.5 h-3.5" />
                <span className="font-semibold">{viewedClient.companyName}</span>
                <span className="opacity-70">•</span>
              </>
            )}
            <User className="w-3.5 h-3.5" />
            <span>{viewedClient.displayName || viewedClient.email || "Unknown Client"}</span>
          </span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-warning-foreground/20 font-medium">
            READ-ONLY
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleExit}
          className="text-warning-foreground hover:bg-warning-foreground/20"
        >
          <X className="w-4 h-4 mr-1" />
          Exit View
        </Button>
      </div>
    </div>
  );
}
