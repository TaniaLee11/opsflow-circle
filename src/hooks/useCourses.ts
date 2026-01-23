import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  tier_access: string[];
  status: "draft" | "published";
  created_by: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  lessons?: CourseLesson[];
  enrollment?: CourseEnrollment | null;
  enrollment_count?: number;
}

export interface CourseLesson {
  id: string;
  course_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  lesson_type: "text" | "video" | "quiz";
  order_index: number;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
  quizzes?: CourseQuiz[];
  attachments?: CourseAttachment[];
}

export interface CourseQuiz {
  id: string;
  lesson_id: string;
  question: string;
  question_type: "multiple_choice" | "short_answer";
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  order_index: number;
  created_at: string;
}

export interface CourseAttachment {
  id: string;
  lesson_id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  progress: { completed_lessons: string[] };
  enrolled_at: string;
  completed_at: string | null;
}

export function useCourses() {
  const { user, isOwner } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all accessible courses
  const { data: courses, isLoading, refetch } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          lessons:course_lessons(
            *,
            quizzes:course_quizzes(*),
            attachments:course_attachments(*)
          ),
          enrollments:course_enrollments(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform lessons to sort by order_index and add enrollment count
      return (data || []).map(course => ({
        ...course,
        lessons: (course.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index),
        enrollment_count: (course.enrollments as any)?.[0]?.count || 0,
      })) as Course[];
    },
    enabled: !!user,
  });

  // Fetch user enrollments
  const { data: enrollments } = useQuery({
    queryKey: ["course-enrollments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as CourseEnrollment[];
    },
    enabled: !!user,
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      const { data, error } = await supabase
        .from("courses")
        .insert({
          title: courseData.title || "Untitled Course",
          description: courseData.description,
          thumbnail_url: courseData.thumbnail_url,
          tier_access: courseData.tier_access || ["free"],
          status: "draft",
          created_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course created!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create course");
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Course> & { id: string }) => {
      const { data, error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course updated!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update course");
    },
  });

  // Publish/unpublish course
  const publishCourseMutation = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { data, error } = await supabase
        .from("courses")
        .update({
          status: publish ? "published" : "draft",
          published_at: publish ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(data.status === "published" ? "Course published!" : "Course unpublished");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update course status");
    },
  });

  // Delete course
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete course");
    },
  });

  // Create lesson
  const createLessonMutation = useMutation({
    mutationFn: async (lessonData: Partial<CourseLesson> & { course_id: string }) => {
      // Get the max order_index for this course
      const { data: existingLessons } = await supabase
        .from("course_lessons")
        .select("order_index")
        .eq("course_id", lessonData.course_id)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrder = existingLessons && existingLessons.length > 0 
        ? existingLessons[0].order_index + 1 
        : 0;

      const { data, error } = await supabase
        .from("course_lessons")
        .insert({
          course_id: lessonData.course_id,
          title: lessonData.title || "Untitled Lesson",
          content: lessonData.content,
          video_url: lessonData.video_url,
          lesson_type: lessonData.lesson_type || "text",
          order_index: nextOrder,
          duration_minutes: lessonData.duration_minutes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Lesson added!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add lesson");
    },
  });

  // Update lesson
  const updateLessonMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CourseLesson> & { id: string }) => {
      const { data, error } = await supabase
        .from("course_lessons")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update lesson");
    },
  });

  // Delete lesson
  const deleteLessonMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("course_lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Lesson deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete lesson");
    },
  });

  // Add quiz to lesson
  const addQuizMutation = useMutation({
    mutationFn: async (quizData: Partial<CourseQuiz> & { lesson_id: string }) => {
      const { data: existingQuizzes } = await supabase
        .from("course_quizzes")
        .select("order_index")
        .eq("lesson_id", quizData.lesson_id)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrder = existingQuizzes && existingQuizzes.length > 0 
        ? existingQuizzes[0].order_index + 1 
        : 0;

      const { data, error } = await supabase
        .from("course_quizzes")
        .insert({
          lesson_id: quizData.lesson_id,
          question: quizData.question || "",
          question_type: quizData.question_type || "multiple_choice",
          options: quizData.options,
          correct_answer: quizData.correct_answer || "",
          explanation: quizData.explanation,
          order_index: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Quiz question added!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add quiz");
    },
  });

  // Delete quiz
  const deleteQuizMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("course_quizzes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  // Enroll in course
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase
        .from("course_enrollments")
        .insert({
          course_id: courseId,
          user_id: user!.id,
          progress: { completed_lessons: [] },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-enrollments"] });
      toast.success("Enrolled in course!");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.info("Already enrolled in this course");
      } else {
        toast.error(error.message || "Failed to enroll");
      }
    },
  });

  // Update progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ enrollmentId, lessonId }: { enrollmentId: string; lessonId: string }) => {
      // Get current progress
      const { data: enrollment } = await supabase
        .from("course_enrollments")
        .select("progress")
        .eq("id", enrollmentId)
        .single();

      const currentProgress = enrollment?.progress as { completed_lessons: string[] } || { completed_lessons: [] };
      const completedLessons = new Set(currentProgress.completed_lessons);
      completedLessons.add(lessonId);

      const { data, error } = await supabase
        .from("course_enrollments")
        .update({
          progress: { completed_lessons: Array.from(completedLessons) },
        })
        .eq("id", enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-enrollments"] });
    },
  });

  // Combine courses with enrollments
  const coursesWithEnrollment = courses?.map(course => ({
    ...course,
    enrollment: enrollments?.find(e => e.course_id === course.id) || null,
  }));

  return {
    courses: coursesWithEnrollment || [],
    isLoading,
    refetch,
    createCourse: createCourseMutation.mutate,
    updateCourse: updateCourseMutation.mutate,
    publishCourse: publishCourseMutation.mutate,
    deleteCourse: deleteCourseMutation.mutate,
    createLesson: createLessonMutation.mutate,
    updateLesson: updateLessonMutation.mutate,
    deleteLesson: deleteLessonMutation.mutate,
    addQuiz: addQuizMutation.mutate,
    deleteQuiz: deleteQuizMutation.mutate,
    enroll: enrollMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    isCreating: createCourseMutation.isPending,
    isUpdating: updateCourseMutation.isPending,
  };
}
