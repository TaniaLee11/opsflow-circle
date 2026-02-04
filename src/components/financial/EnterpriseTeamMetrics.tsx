import { motion } from "framer-motion";
import { 
  Users, 
  Activity, 
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TeamMember {
  name: string;
  email: string;
  tier: string;
  lastActive: string;
  tasksCompleted: number;
  vopsyInteractions: number;
}

interface EnterpriseTeamMetrics {
  totalSeats: number;
  activeSeats: number;
  seatUtilization: number;
  teamMembers: TeamMember[];
  totalTasksCompleted: number;
  totalVOPSyInteractions: number;
  avgTasksPerMember: number;
  topPerformers: TeamMember[];
}

interface EnterpriseTeamMetricsProps {
  metrics: EnterpriseTeamMetrics;
}

export function EnterpriseTeamMetrics({ metrics }: EnterpriseTeamMetricsProps) {
  const utilizationColor = (utilization: number) => {
    if (utilization >= 80) return "text-success";
    if (utilization >= 60) return "text-primary";
    if (utilization >= 40) return "text-warning";
    return "text-destructive";
  };

  const utilizationStatus = (utilization: number) => {
    if (utilization >= 80) return "Excellent";
    if (utilization >= 60) return "Good";
    if (utilization >= 40) return "Fair";
    return "Low";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Metrics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your team's activity and productivity
          </p>
        </div>
        <Badge variant="outline" className="text-primary border-primary">
          Enterprise View
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Seat Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Seat Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold", utilizationColor(metrics.seatUtilization))}>
                {metrics.seatUtilization.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {metrics.activeSeats} of {metrics.totalSeats} seats active
              </div>
              <Progress 
                value={metrics.seatUtilization} 
                className="mt-3"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="glass gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Tasks Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {metrics.totalTasksCompleted}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Avg {metrics.avgTasksPerMember.toFixed(1)} per member
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* VOPSy Interactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                VOPSy Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {metrics.totalVOPSyInteractions}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                AI assistance requests
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="glass gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Team Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold", utilizationColor(metrics.seatUtilization))}>
                {utilizationStatus(metrics.seatUtilization)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Overall productivity
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-warning" />
              Top Performers
            </CardTitle>
            <CardDescription>Most active team members this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topPerformers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-surface-hover/30">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      index === 0 ? "bg-warning/20 text-warning" : 
                      index === 1 ? "bg-muted text-muted-foreground" :
                      "bg-primary/20 text-primary"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-success">{member.tasksCompleted} tasks</div>
                    <div className="text-xs text-muted-foreground">{member.vopsyInteractions} VOPSy uses</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* All Team Members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="glass gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Team Members
            </CardTitle>
            <CardDescription>All active team members and their activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover/30 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{member.tasksCompleted}</div>
                      <div className="text-xs text-muted-foreground">Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{member.vopsyInteractions}</div>
                      <div className="text-xs text-muted-foreground">VOPSy</div>
                    </div>
                    <div className="text-center min-w-[80px]">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {member.lastActive}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {member.tier}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
