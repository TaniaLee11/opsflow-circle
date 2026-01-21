import { motion } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  Award,
  Clock,
  BarChart3,
  CheckCircle2,
  UserCheck
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseAnalytics {
  id: string;
  title: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  avgProgress: number;
}

interface AnalyticsData {
  totalEnrollments: number;
  totalCompletions: number;
  activeStudents: number;
  avgCompletionRate: number;
  courseAnalytics: CourseAnalytics[];
}

export function AcademyAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["academy-analytics"],
    queryFn: async (): Promise<AnalyticsData> => {
      // Fetch all courses
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, status");

      if (coursesError) throw coursesError;

      // Fetch all enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("course_enrollments")
        .select("id, course_id, user_id, progress, completed_at");

      if (enrollmentsError) throw enrollmentsError;

      // Calculate analytics per course
      const courseAnalytics: CourseAnalytics[] = (courses || []).map(course => {
        const courseEnrollments = (enrollments || []).filter(e => e.course_id === course.id);
        const completions = courseEnrollments.filter(e => e.completed_at).length;
        
        // Calculate average progress
        const avgProgress = courseEnrollments.length > 0
          ? courseEnrollments.reduce((sum, e) => {
              const completed = (e.progress as any)?.completed_lessons?.length || 0;
              return sum + completed;
            }, 0) / courseEnrollments.length
          : 0;

        return {
          id: course.id,
          title: course.title,
          enrollments: courseEnrollments.length,
          completions,
          completionRate: courseEnrollments.length > 0 
            ? Math.round((completions / courseEnrollments.length) * 100) 
            : 0,
          avgProgress: Math.round(avgProgress)
        };
      });

      // Sort by enrollments (most popular first)
      courseAnalytics.sort((a, b) => b.enrollments - a.enrollments);

      // Calculate totals
      const totalEnrollments = (enrollments || []).length;
      const totalCompletions = (enrollments || []).filter(e => e.completed_at).length;
      const uniqueStudents = new Set((enrollments || []).map(e => e.user_id)).size;
      const avgCompletionRate = totalEnrollments > 0 
        ? Math.round((totalCompletions / totalEnrollments) * 100) 
        : 0;

      return {
        totalEnrollments,
        totalCompletions,
        activeStudents: uniqueStudents,
        avgCompletionRate,
        courseAnalytics
      };
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass gradient-border rounded-xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{analytics.activeStudents}</p>
              <p className="text-xs text-muted-foreground">Active Students</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass gradient-border rounded-xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-info/10 text-info">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{analytics.totalEnrollments}</p>
              <p className="text-xs text-muted-foreground">Total Enrollments</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass gradient-border rounded-xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10 text-success">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{analytics.totalCompletions}</p>
              <p className="text-xs text-muted-foreground">Completions</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass gradient-border rounded-xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{analytics.avgCompletionRate}%</p>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Course Performance Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass gradient-border rounded-xl overflow-hidden"
      >
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Course Performance</h3>
          </div>
        </div>

        {analytics.courseAnalytics.length > 0 ? (
          <div className="divide-y divide-border">
            {analytics.courseAnalytics.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{course.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.enrollments} enrolled
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {course.completions} completed
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{course.completionRate}%</p>
                    <p className="text-xs text-muted-foreground">completion</p>
                  </div>
                </div>
                <Progress value={course.completionRate} className="h-2" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No course data yet</p>
            <p className="text-sm">Analytics will appear once users start enrolling</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
