import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface UserAcademyStats {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  courses_completed: number;
  lessons_completed: number;
  quizzes_perfect: number;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
}

// XP needed for each level (increases exponentially)
export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  let xpNeeded = 0;
  while (totalXp >= xpNeeded + getXpForLevel(level)) {
    xpNeeded += getXpForLevel(level);
    level++;
  }
  return level;
}

export function getXpProgressInLevel(totalXp: number): { current: number; needed: number; percent: number } {
  let level = 1;
  let xpUsed = 0;
  while (totalXp >= xpUsed + getXpForLevel(level)) {
    xpUsed += getXpForLevel(level);
    level++;
  }
  const currentLevelXp = totalXp - xpUsed;
  const neededForNext = getXpForLevel(level);
  return {
    current: currentLevelXp,
    needed: neededForNext,
    percent: Math.round((currentLevelXp / neededForNext) * 100),
  };
}

export function useGamification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all available badges
  const { data: allBadges } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("requirement_value", { ascending: true });
      if (error) throw error;
      return data as Badge[];
    },
    enabled: !!user,
  });

  // Fetch user's earned badges
  const { data: userBadges } = useQuery({
    queryKey: ["user-badges", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("*, badge:badges(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data as (UserBadge & { badge: Badge })[];
    },
    enabled: !!user,
  });

  // Fetch user's academy stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["user-academy-stats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_academy_stats")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Create stats if they don't exist
      if (!data && user) {
        const { data: newStats, error: insertError } = await supabase
          .from("user_academy_stats")
          .insert({ user_id: user.id })
          .select()
          .single();
        if (insertError) throw insertError;
        return newStats as UserAcademyStats;
      }
      
      return data as UserAcademyStats;
    },
    enabled: !!user,
  });

  // Fetch user's certificates
  const { data: certificates } = useQuery({
    queryKey: ["user-certificates", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_certificates")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!user,
  });

  // Award XP and check for new badges
  const awardXpMutation = useMutation({
    mutationFn: async ({ 
      xp, 
      type 
    }: { 
      xp: number; 
      type: 'lesson' | 'course' | 'quiz_perfect' 
    }) => {
      if (!user || !stats) return;

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = stats.last_activity_date;
      
      // Calculate streak
      let newStreak = stats.current_streak;
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak = stats.current_streak + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Update stats
      const updates: Partial<UserAcademyStats> = {
        total_xp: stats.total_xp + xp,
        current_level: getLevelFromXp(stats.total_xp + xp),
        current_streak: newStreak,
        longest_streak: Math.max(stats.longest_streak, newStreak),
        last_activity_date: today,
      };

      if (type === 'lesson') {
        updates.lessons_completed = stats.lessons_completed + 1;
      } else if (type === 'course') {
        updates.courses_completed = stats.courses_completed + 1;
      } else if (type === 'quiz_perfect') {
        updates.quizzes_perfect = stats.quizzes_perfect + 1;
      }

      const { error } = await supabase
        .from("user_academy_stats")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      // Check for new badges
      await checkAndAwardBadges(updates);

      return updates;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-academy-stats"] });
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
    },
  });

  // Check and award badges
  const checkAndAwardBadges = async (currentStats: Partial<UserAcademyStats>) => {
    if (!user || !allBadges) return;

    const earnedBadgeIds = new Set(userBadges?.map(b => b.badge_id) || []);
    const newBadges: Badge[] = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let earned = false;
      switch (badge.requirement_type) {
        case 'lessons_completed':
          earned = (currentStats.lessons_completed || stats?.lessons_completed || 0) >= badge.requirement_value;
          break;
        case 'courses_completed':
          earned = (currentStats.courses_completed || stats?.courses_completed || 0) >= badge.requirement_value;
          break;
        case 'quizzes_perfect':
          earned = (currentStats.quizzes_perfect || stats?.quizzes_perfect || 0) >= badge.requirement_value;
          break;
        case 'streak_days':
          earned = (currentStats.current_streak || stats?.current_streak || 0) >= badge.requirement_value;
          break;
      }

      if (earned) {
        newBadges.push(badge);
        await supabase
          .from("user_badges")
          .insert({ user_id: user.id, badge_id: badge.id });
      }
    }

    if (newBadges.length > 0) {
      newBadges.forEach(badge => {
        toast.success(`🏆 Badge Earned: ${badge.name}!`, {
          description: `+${badge.xp_reward} XP`,
        });
      });
    }
  };

  // Issue certificate
  const issueCertificateMutation = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("Not authenticated");

      const certNumber = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { data, error } = await supabase
        .from("course_certificates")
        .insert({
          user_id: user.id,
          course_id: courseId,
          certificate_number: certNumber,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Already has certificate
          return null;
        }
        throw error;
      }

      return data as Certificate;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["user-certificates"] });
        toast.success("🎓 Certificate Earned!", {
          description: "Your certificate is ready to view",
        });
      }
    },
  });

  const earnedBadgeIds = new Set(userBadges?.map(b => b.badge_id) || []);

  return {
    allBadges: allBadges || [],
    earnedBadges: userBadges || [],
    earnedBadgeIds,
    stats,
    certificates: certificates || [],
    awardXp: awardXpMutation.mutate,
    issueCertificate: issueCertificateMutation.mutate,
    refetchStats,
    levelProgress: stats ? getXpProgressInLevel(stats.total_xp) : { current: 0, needed: 100, percent: 0 },
  };
}
