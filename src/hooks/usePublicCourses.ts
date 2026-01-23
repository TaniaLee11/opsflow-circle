import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicCourseLesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  lesson_type: string;
  order_index: number;
  duration_minutes: number | null;
}

export interface PublicCourseQuiz {
  id: string;
  lesson_id: string;
  question: string;
  question_type: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  order_index: number;
}

export interface PublicCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  tier_access: string[];
  lessons: PublicCourseLesson[];
  quizzes: PublicCourseQuiz[];
  enrollment_count: number;
}

// These are the public preview course titles we want to feature
const PUBLIC_COURSE_TITLES = [
  "What It Means to Be",  // Matches "What It Means to Be 'In Business'"
  "How to Open a Business",
  "How to Go from Idea to Funded"
];

export function usePublicCourses() {
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      // Fetch published courses that are accessible to 'free' tier
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          tier_access,
          course_lessons (
            id,
            title,
            content,
            video_url,
            lesson_type,
            order_index,
            duration_minutes
          )
        `)
        .eq("status", "published")
        .contains("tier_access", ["free"]);

      if (coursesError) throw coursesError;

      // Filter to only the designated public preview courses
      // Or if none match the exact titles, take the first 3 free-tier courses
      let publicCourses = coursesData?.filter(c => 
        PUBLIC_COURSE_TITLES.some(title => 
          c.title.toLowerCase().includes(title.toLowerCase().split(':')[0])
        )
      ) || [];

      // Fallback: if no matching titles, take first 3 published free courses
      if (publicCourses.length === 0) {
        publicCourses = (coursesData || []).slice(0, 3);
      }

      // Fetch quizzes for these courses
      const courseIds = publicCourses.map(c => c.id);
      const lessonIds = publicCourses.flatMap(c => c.course_lessons?.map(l => l.id) || []);

      let quizzesData: any[] = [];
      if (lessonIds.length > 0) {
        const { data: quizzes } = await supabase
          .from("course_quizzes")
          .select("*")
          .in("lesson_id", lessonIds);
        quizzesData = quizzes || [];
      }

      // Fetch enrollment counts
      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("course_id")
        .in("course_id", courseIds);

      const enrollmentCounts: Record<string, number> = {};
      enrollments?.forEach(e => {
        enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] || 0) + 1;
      });

      // Map to PublicCourse format
      const result: PublicCourse[] = publicCourses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail_url: course.thumbnail_url,
        tier_access: course.tier_access || [],
        lessons: (course.course_lessons || [])
          .sort((a, b) => a.order_index - b.order_index)
          .map(l => ({
            id: l.id,
            title: l.title,
            content: l.content,
            video_url: l.video_url,
            lesson_type: l.lesson_type,
            order_index: l.order_index,
            duration_minutes: l.duration_minutes
          })),
        quizzes: quizzesData
          .filter(q => course.course_lessons?.some(l => l.id === q.lesson_id))
          .map(q => ({
            id: q.id,
            lesson_id: q.lesson_id,
            question: q.question,
            question_type: q.question_type,
            options: q.options as string[] | null,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            order_index: q.order_index
          })),
        enrollment_count: enrollmentCounts[course.id] || 0
      }));

      return result;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return { courses, isLoading, error };
}

export function usePublicCourse(courseId: string) {
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["public-course", courseId],
    enabled: Boolean(courseId),
    queryFn: async () => {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select(
          `
          id,
          title,
          description,
          thumbnail_url,
          tier_access,
          course_lessons (
            id,
            title,
            content,
            video_url,
            lesson_type,
            order_index,
            duration_minutes
          )
        `
        )
        .eq("id", courseId)
        .eq("status", "published")
        .contains("tier_access", ["free"]) // only allow the public free catalog here
        .maybeSingle();

      if (courseError) throw courseError;
      if (!courseData) return null;

      const lessonIds = (courseData.course_lessons || []).map((l: any) => l.id);

      let quizzesData: any[] = [];
      if (lessonIds.length > 0) {
        const { data: quizzes } = await supabase
          .from("course_quizzes")
          .select("*")
          .in("lesson_id", lessonIds);
        quizzesData = quizzes || [];
      }

      const { count } = await supabase
        .from("course_enrollments")
        .select("id", { count: "exact", head: true })
        .eq("course_id", courseId);

      const result: PublicCourse = {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        thumbnail_url: courseData.thumbnail_url,
        tier_access: courseData.tier_access || [],
        lessons: (courseData.course_lessons || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((l: any) => ({
            id: l.id,
            title: l.title,
            content: l.content,
            video_url: l.video_url,
            lesson_type: l.lesson_type,
            order_index: l.order_index,
            duration_minutes: l.duration_minutes,
          })),
        quizzes: quizzesData.map((q) => ({
          id: q.id,
          lesson_id: q.lesson_id,
          question: q.question,
          question_type: q.question_type,
          options: q.options as string[] | null,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          order_index: q.order_index,
        })),
        enrollment_count: count || 0,
      };

      return result;
    },
    staleTime: 1000 * 60 * 5,
  });

  return { course: course ?? undefined, isLoading, error };
}
