import { motion } from "framer-motion";
import { GitCommit, MessageSquare, FileText, CheckCircle2 } from "lucide-react";

interface Activity {
  id: string;
  user: {
    name: string;
    initials: string;
    color: string;
  };
  action: string;
  target: string;
  time: string;
  icon: React.ElementType;
}

const activities: Activity[] = [
  {
    id: "1",
    user: { name: "Alex Chen", initials: "AC", color: "from-blue-500 to-cyan-400" },
    action: "committed to",
    target: "main branch",
    time: "2 min ago",
    icon: GitCommit
  },
  {
    id: "2",
    user: { name: "Sarah Kim", initials: "SK", color: "from-pink-500 to-rose-400" },
    action: "commented on",
    target: "Design Review",
    time: "15 min ago",
    icon: MessageSquare
  },
  {
    id: "3",
    user: { name: "Mike Ross", initials: "MR", color: "from-green-500 to-emerald-400" },
    action: "uploaded",
    target: "Q4 Report.pdf",
    time: "1 hour ago",
    icon: FileText
  },
  {
    id: "4",
    user: { name: "Tania Lee", initials: "TL", color: "from-primary to-orange-400" },
    action: "completed",
    target: "Security Audit",
    time: "3 hours ago",
    icon: CheckCircle2
  },
];

export function TeamActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-xl glass gradient-border overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Team Activity</h3>
        <p className="text-sm text-muted-foreground">Latest updates from your team</p>
      </div>

      <div className="p-4 space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex items-start gap-3"
          >
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activity.user.color} flex items-center justify-center text-xs font-medium text-white shrink-0`}>
              {activity.user.initials}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium text-foreground">{activity.user.name}</span>
                <span className="text-muted-foreground"> {activity.action} </span>
                <span className="font-medium text-primary">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
            </div>

            <div className="p-1.5 rounded-lg bg-muted/50">
              <activity.icon className="w-4 h-4 text-muted-foreground" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-6 py-3 border-t border-border">
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          View all activity
        </button>
      </div>
    </motion.div>
  );
}
