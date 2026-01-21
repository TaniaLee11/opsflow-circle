import { motion } from "framer-motion";
import { 
  Trophy, 
  Flame, 
  Target, 
  Crown,
  Zap,
  BookOpen,
  GraduationCap,
  Brain,
  Medal,
  Star,
  Lock,
  Footprints
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useGamification, Badge as BadgeType } from "@/hooks/useGamification";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  flame: Flame,
  target: Target,
  crown: Crown,
  zap: Zap,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  brain: Brain,
  medal: Medal,
  footprints: Footprints,
};

const COLOR_MAP: Record<string, string> = {
  primary: "bg-primary/20 text-primary border-primary/30",
  success: "bg-success/20 text-success border-success/30",
  warning: "bg-warning/20 text-warning border-warning/30",
  destructive: "bg-destructive/20 text-destructive border-destructive/30",
  info: "bg-info/20 text-info border-info/30",
};

interface GamificationPanelProps {
  compact?: boolean;
}

export function GamificationPanel({ compact = false }: GamificationPanelProps) {
  const { stats, allBadges, earnedBadgeIds, levelProgress } = useGamification();

  if (!stats) return null;

  const BadgeIcon = ({ badge, earned }: { badge: BadgeType; earned: boolean }) => {
    const IconComponent = ICON_MAP[badge.icon] || Trophy;
    return (
      <motion.div
        whileHover={{ scale: earned ? 1.1 : 1 }}
        className={cn(
          "relative p-3 rounded-xl border-2 transition-all",
          earned 
            ? COLOR_MAP[badge.color] || COLOR_MAP.primary
            : "bg-muted/30 text-muted-foreground border-border opacity-50"
        )}
      >
        <IconComponent className="w-6 h-6" />
        {!earned && (
          <Lock className="absolute -bottom-1 -right-1 w-3 h-3 text-muted-foreground" />
        )}
      </motion.div>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        {/* Level Badge */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">{stats.current_level}</span>
            </div>
            <Star className="absolute -top-1 -right-1 w-4 h-4 text-warning fill-warning" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium">Level {stats.current_level}</p>
            <Progress value={levelProgress.percent} className="w-16 h-1" />
          </div>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1 text-sm">
          <Zap className="w-4 h-4 text-warning" />
          <span className="font-medium">{stats.total_xp.toLocaleString()}</span>
          <span className="text-muted-foreground">XP</span>
        </div>

        {/* Streak */}
        {stats.current_streak > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <Flame className="w-4 h-4 text-destructive" />
            <span className="font-medium">{stats.current_streak}</span>
            <span className="text-muted-foreground hidden sm:inline">day streak</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Level */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass gradient-border rounded-xl p-4 text-center"
        >
          <div className="relative mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-2">
            <span className="text-xl font-bold text-primary-foreground">{stats.current_level}</span>
            <Star className="absolute -top-1 -right-1 w-5 h-5 text-warning fill-warning" />
          </div>
          <p className="text-sm font-medium">Level {stats.current_level}</p>
          <div className="mt-2">
            <Progress value={levelProgress.percent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {levelProgress.current}/{levelProgress.needed} XP
            </p>
          </div>
        </motion.div>

        {/* XP */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass gradient-border rounded-xl p-4 text-center"
        >
          <div className="p-3 rounded-xl bg-warning/10 text-warning mx-auto w-fit mb-2">
            <Zap className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold">{stats.total_xp.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total XP</p>
        </motion.div>

        {/* Streak */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass gradient-border rounded-xl p-4 text-center"
        >
          <div className="p-3 rounded-xl bg-destructive/10 text-destructive mx-auto w-fit mb-2">
            <Flame className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold">{stats.current_streak}</p>
          <p className="text-sm text-muted-foreground">Day Streak</p>
          {stats.longest_streak > stats.current_streak && (
            <p className="text-xs text-muted-foreground">Best: {stats.longest_streak}</p>
          )}
        </motion.div>

        {/* Courses */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass gradient-border rounded-xl p-4 text-center"
        >
          <div className="p-3 rounded-xl bg-success/10 text-success mx-auto w-fit mb-2">
            <GraduationCap className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold">{stats.courses_completed}</p>
          <p className="text-sm text-muted-foreground">Courses</p>
        </motion.div>
      </div>

      {/* Badges Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Badges
          </h3>
          <Badge variant="outline">
            {earnedBadgeIds.size}/{allBadges.length} Earned
          </Badge>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-3">
          {allBadges.map((badge, index) => {
            const earned = earnedBadgeIds.has(badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <BadgeIcon badge={badge} earned={earned} />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-popover border border-border rounded-lg p-2 shadow-lg min-w-[140px] text-center">
                    <p className="text-sm font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {!earned && (
                      <p className="text-xs text-primary mt-1">+{badge.xp_reward} XP</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
