import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  Check, 
  User, 
  Bot, 
  Crown,
  Shield,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSubUser, AIAgentId } from "@/contexts/SubUserContext";

export function SubUserSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isOwner, isAdmin } = useAuth();
  const { activeActor, availableAgents, switchToAgent, switchToHuman } = useSubUser();

  const isHumanActive = activeActor?.type === "human" || !activeActor?.agentId;
  const activeAgent = activeActor?.type === "ai" ? availableAgents.find(a => a.id === activeActor.agentId) : null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border transition-colors"
      >
        {isHumanActive ? (
          <>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <span className="text-sm font-medium text-foreground">{user?.name?.split(" ")[0]}</span>
            {isOwner && <Crown className="w-3 h-3 text-primary" />}
          </>
        ) : activeAgent ? (
          <>
            <div className={cn(
              "w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center text-xs",
              activeAgent.color
            )}>
              {activeAgent.icon}
            </div>
            <span className="text-sm font-medium text-foreground">{activeAgent.name}</span>
            <Bot className="w-3 h-3 text-primary" />
          </>
        ) : null}
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
              className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acting As
                </p>
              </div>

              {/* Human User Option */}
              <div className="p-2 border-b border-border">
                <button
                  onClick={() => {
                    switchToHuman();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                    isHumanActive ? "bg-primary/10" : "hover:bg-muted"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{user?.name}</span>
                      {isOwner && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-primary/20 text-primary">
                          OWNER
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Human • Full Access</p>
                  </div>
                  {isHumanActive && <Check className="w-5 h-5 text-primary" />}
                </button>
              </div>

              {/* AI Agents */}
              <div className="p-2 max-h-80 overflow-y-auto">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  AI Agents
                </p>
                {availableAgents.map((agent) => {
                  const isActive = activeActor?.agentId === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => {
                        switchToAgent(agent.id as AIAgentId);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors mb-1",
                        isActive ? "bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg",
                        agent.color
                      )}>
                        {agent.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium text-foreground block">{agent.name}</span>
                        <p className="text-xs text-muted-foreground">{agent.title}</p>
                      </div>
                      {isActive && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              {isAdmin && (
                <div className="px-4 py-3 border-t border-border bg-muted/30">
                  <a 
                    href="/settings" 
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-3 h-3" />
                    Manage AI Agents
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
