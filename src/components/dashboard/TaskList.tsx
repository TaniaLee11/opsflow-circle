import { motion } from "framer-motion";
import { Check, Clock, AlertCircle, MoreHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";

interface Task {
  id: string;
  title: string;
  project_id: string | null;
  project_name?: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  user_id: string;
}

const statusConfig = {
  completed: { icon: Check, class: "bg-success/20 text-success" },
  "in-progress": { icon: Clock, class: "bg-warning/20 text-warning" },
  pending: { icon: AlertCircle, class: "bg-muted text-muted-foreground" },
  cancelled: { icon: AlertCircle, class: "bg-destructive/20 text-destructive" },
};

const priorityConfig = {
  urgent: "bg-destructive/20 text-destructive",
  high: "bg-destructive/20 text-destructive",
  medium: "bg-warning/20 text-warning",
  low: "bg-muted text-muted-foreground",
};

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "No due date";
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

export function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      if (!user?.id) return;

      try {
        // Fetch tasks with project names
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("id, title, project_id, status, priority, due_date, user_id")
          .order("created_at", { ascending: false })
          .limit(5);

        if (tasksError) throw tasksError;

        // Fetch project names for tasks that have project_id
        const projectIds = tasksData?.filter(t => t.project_id).map(t => t.project_id) || [];
        let projectsMap: Record<string, string> = {};

        if (projectIds.length > 0) {
          const { data: projectsData } = await supabase
            .from("projects")
            .select("id, name")
            .in("id", projectIds);

          if (projectsData) {
            projectsMap = projectsData.reduce((acc, p) => {
              acc[p.id] = p.name;
              return acc;
            }, {} as Record<string, string>);
          }
        }

        const tasksWithProjects = (tasksData || []).map(task => ({
          ...task,
          status: task.status as Task["status"],
          priority: task.priority as Task["priority"],
          project_name: task.project_id ? projectsMap[task.project_id] : undefined,
        }));

        setTasks(tasksWithProjects);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [user?.id]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl glass gradient-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Tasks</h3>
          <p className="text-sm text-muted-foreground">Track your progress</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </motion.div>
    );
  }

  if (tasks.length === 0) {
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
            <p className="text-sm text-muted-foreground">Track your progress</p>
          </div>
        </div>
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground">No tasks yet. Ask VOPSy to create one!</p>
        </div>
      </motion.div>
    );
  }

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
          <p className="text-sm text-muted-foreground">Track your progress</p>
        </div>
        <button 
          onClick={() => window.location.href = '/workflows'}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View all
        </button>
      </div>

      <div className="divide-y divide-border">
        {tasks.map((task, index) => {
          const status = task.status as keyof typeof statusConfig;
          const StatusIcon = statusConfig[status]?.icon || AlertCircle;
          const statusClass = statusConfig[status]?.class || statusConfig.pending.class;
          const priority = task.priority as keyof typeof priorityConfig;
          const priorityClass = priorityConfig[priority] || priorityConfig.medium;

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
                statusClass
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
                <p className="text-sm text-muted-foreground">
                  {task.project_name || "No project"}
                </p>
              </div>

              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full shrink-0",
                priorityClass
              )}>
                {task.priority}
              </span>

              <span className="text-sm text-muted-foreground shrink-0 w-20 text-right">
                {formatDueDate(task.due_date)}
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
