import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Workflow, Plus } from "lucide-react";

export default function Pipeline() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className={cn(
        "min-h-screen transition-all duration-300",
        isMobile ? "pt-14" : "md:ml-64"
      )}>
        <header className="sticky top-0 lg:top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
                  <Workflow className="w-6 h-6" />
                  Pipeline Management
                </h1>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs sm:text-sm text-muted-foreground mt-0.5"
              >
                Manage your sales pipeline and customer relationships
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" />
                Add Deal
              </button>
            </motion.div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Workflow className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Pipeline Coming Soon</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Connect your CRM (GoHighLevel, HubSpot, Salesforce) to manage your sales pipeline directly from Virtual OPS Hub.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
