import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  Check,
  Shield,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useVOPSyMode, VOPSyModeId } from "@/contexts/VOPSyModeContext";

export function VOPSyModeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { isOwner, isAdmin } = useAuth();
  const { currentMode, availableModes, switchMode } = useVOPSyMode();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border transition-colors"
      >
        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="text-left">
          <span className="text-sm font-medium text-foreground">{currentMode.fullName}</span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">VOPSy Operating Mode</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  One agent, different capabilities
                </p>
              </div>

              {/* Mode List */}
              <div className="p-2 max-h-96 overflow-y-auto">
                {availableModes.map((mode) => {
                  const isActive = currentMode.id === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        switchMode(mode.id as VOPSyModeId);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors mb-1",
                        isActive ? "bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg",
                        mode.color
                      )}>
                        {mode.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{mode.fullName}</span>
                          {mode.requiresAdmin && (
                            <Shield className="w-3 h-3 text-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{mode.purpose}</p>
                      </div>
                      {isActive && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              {(isAdmin || isOwner) && (
                <div className="px-4 py-3 border-t border-border bg-muted/30">
                  <a 
                    href="/settings" 
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-3 h-3" />
                    Configure VOPSy Modes
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
