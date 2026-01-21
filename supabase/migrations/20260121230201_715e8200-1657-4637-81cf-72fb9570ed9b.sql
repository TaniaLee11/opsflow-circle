-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  tier_access TEXT[] NOT NULL DEFAULT ARRAY['free']::TEXT[],
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create course lessons table
CREATE TABLE public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  lesson_type TEXT NOT NULL DEFAULT 'text',
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course quizzes table (attached to lessons)
CREATE TABLE public.course_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course attachments table
CREATE TABLE public.course_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course enrollments table
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  progress JSONB DEFAULT '{"completed_lessons": []}'::JSONB,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(course_id, user_id)
);

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Platform owners can manage all courses"
ON public.courses FOR ALL
USING (is_platform_owner(auth.uid()));

CREATE POLICY "Users can view published courses matching their tier"
ON public.courses FOR SELECT
USING (
  status = 'published' AND (
    is_platform_owner(auth.uid()) OR
    'free' = ANY(tier_access) OR
    get_user_effective_tier(auth.uid()) = ANY(tier_access) OR
    get_user_effective_tier(auth.uid()) = 'owner' OR
    get_user_effective_tier(auth.uid()) = 'cohort'
  )
);

-- Lessons policies
CREATE POLICY "Platform owners can manage all lessons"
ON public.course_lessons FOR ALL
USING (is_platform_owner(auth.uid()));

CREATE POLICY "Users can view lessons of accessible courses"
ON public.course_lessons FOR SELECT
USING (
  course_id IN (
    SELECT id FROM public.courses 
    WHERE status = 'published' AND (
      is_platform_owner(auth.uid()) OR
      'free' = ANY(tier_access) OR
      get_user_effective_tier(auth.uid()) = ANY(tier_access) OR
      get_user_effective_tier(auth.uid()) IN ('owner', 'cohort')
    )
  )
);

-- Quizzes policies
CREATE POLICY "Platform owners can manage all quizzes"
ON public.course_quizzes FOR ALL
USING (is_platform_owner(auth.uid()));

CREATE POLICY "Users can view quizzes of accessible lessons"
ON public.course_quizzes FOR SELECT
USING (
  lesson_id IN (
    SELECT cl.id FROM public.course_lessons cl
    JOIN public.courses c ON cl.course_id = c.id
    WHERE c.status = 'published' AND (
      is_platform_owner(auth.uid()) OR
      'free' = ANY(c.tier_access) OR
      get_user_effective_tier(auth.uid()) = ANY(c.tier_access) OR
      get_user_effective_tier(auth.uid()) IN ('owner', 'cohort')
    )
  )
);

-- Attachments policies
CREATE POLICY "Platform owners can manage all attachments"
ON public.course_attachments FOR ALL
USING (is_platform_owner(auth.uid()));

CREATE POLICY "Users can view attachments of accessible lessons"
ON public.course_attachments FOR SELECT
USING (
  lesson_id IN (
    SELECT cl.id FROM public.course_lessons cl
    JOIN public.courses c ON cl.course_id = c.id
    WHERE c.status = 'published' AND (
      is_platform_owner(auth.uid()) OR
      'free' = ANY(c.tier_access) OR
      get_user_effective_tier(auth.uid()) = ANY(c.tier_access) OR
      get_user_effective_tier(auth.uid()) IN ('owner', 'cohort')
    )
  )
);

-- Enrollments policies
CREATE POLICY "Users can view their own enrollments"
ON public.course_enrollments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll themselves"
ON public.course_enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.course_enrollments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Platform owners can view all enrollments"
ON public.course_enrollments FOR SELECT
USING (is_platform_owner(auth.uid()));

-- Quiz attempts policies
CREATE POLICY "Users can create their own quiz attempts"
ON public.quiz_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own attempts"
ON public.quiz_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Platform owners can view all attempts"
ON public.quiz_attempts FOR SELECT
USING (is_platform_owner(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for course attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('course-attachments', 'course-attachments', true);

-- Storage policies for course attachments
CREATE POLICY "Anyone can view course attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-attachments');

CREATE POLICY "Platform owners can upload course attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-attachments' AND is_platform_owner(auth.uid()));

CREATE POLICY "Platform owners can delete course attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-attachments' AND is_platform_owner(auth.uid()));