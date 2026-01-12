import { motion } from "framer-motion";
import { Plus, UserPlus, FolderPlus, FileUp, Sparkles } from "lucide-react";

const actions = [
  { icon: Plus, label: "New Task", color: "bg-primary" },
  { icon: UserPlus, label: "Invite Member", color: "bg-info" },
  { icon: FolderPlus, label: "Create Project", color: "bg-success" },
  { icon: FileUp, label: "Upload File", color: "bg-warning" },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-xl glass gradient-border p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-border transition-all group"
          >
            <div className={`p-2 rounded-lg ${action.color} text-white`}>
              <action.icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
