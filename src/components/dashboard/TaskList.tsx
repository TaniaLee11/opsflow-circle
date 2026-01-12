import { motion } from "framer-motion";
import { Check, Clock, AlertCircle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  project: string;
  status: "completed" | "in-progress" | "pending";
  priority: "high" | "medium" | "low";
  dueDate: string;
  assignee: {
    name: string;
    initials: string;
  };
}

const tasks: Task[] = [
  {
    id: "1",
    title: "Review Q4 Operations Report",
    project: "Analytics Dashboard",
    status: "in-progress",
    priority: "high",
    dueDate: "Today",
    assignee: { name: "Alex Chen", initials: "AC" }
  },
  {
    id: "2",
    title: "Update team permissions",
    project: "Security",
    status: "pending",
    priority: "medium",
    dueDate: "Tomorrow",
    assignee: { name: "Sarah Kim", initials: "SK" }
  },
  {
    id: "3",
    title: "Deploy new API endpoints",
    project: "Backend",
    status: "completed",
    priority: "high",
    dueDate: "Yesterday",
    assignee: { name: "Mike Ross", initials: "MR" }
  },
  {
    id: "4",
    title: "Client onboarding meeting",
    project: "Sales",
    status: "pending",
    priority: "medium",
    dueDate: "Jan 15",
    assignee: { name: "Tania Lee", initials: "TL" }
  },
];

const statusConfig = {
  completed: { icon: Check, class: "bg-success/20 text-success" },
  "in-progress": { icon: Clock, class: "bg-warning/20 text-warning" },
  pending: { icon: AlertCircle, class: "bg-muted text-muted-foreground" },
};

const priorityConfig = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-warning/20 text-warning",
  low: "bg-muted text-muted-foreground",
};

export function TaskList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl glass gradient-border overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Recent Tasks</h3>
          <p className="text-sm text-muted-foreground">Track your team's progress</p>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          View all
        </button>
      </div>

      <div className="divide-y divide-border">
        {tasks.map((task, index) => {
          const StatusIcon = statusConfig[task.status].icon;
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="px-6 py-4 flex items-center gap-4 hover:bg-surface-hover/50 transition-colors group"
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                statusConfig[task.status].class
              )}>
                <StatusIcon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate",
                  task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                )}>
                  {task.title}
                </p>
                <p className="text-sm text-muted-foreground">{task.project}</p>
              </div>

              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full shrink-0",
                priorityConfig[task.priority]
              )}>
                {task.priority}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-orange-400 flex items-center justify-center text-xs font-medium text-primary-foreground">
                  {task.assignee.initials}
                </div>
              </div>

              <span className="text-sm text-muted-foreground shrink-0 w-20 text-right">
                {task.dueDate}
              </span>

              <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
