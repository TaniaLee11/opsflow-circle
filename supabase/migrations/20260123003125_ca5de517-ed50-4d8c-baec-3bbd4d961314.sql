
-- Allow anonymous users to view published free-tier courses
CREATE POLICY "Anyone can view published free courses"
ON public.courses
FOR SELECT
USING (
  status = 'published' 
  AND 'free' = ANY(tier_access)
);

-- Allow anonymous users to view lessons of published free courses
CREATE POLICY "Anyone can view lessons of free courses"
ON public.course_lessons
FOR SELECT
USING (
  course_id IN (
    SELECT id FROM courses 
    WHERE status = 'published' 
    AND 'free' = ANY(tier_access)
  )
);

-- Allow anonymous users to view quizzes of published free course lessons
CREATE POLICY "Anyone can view quizzes of free courses"
ON public.course_quizzes
FOR SELECT
USING (
  lesson_id IN (
    SELECT cl.id FROM course_lessons cl
    JOIN courses c ON cl.course_id = c.id
    WHERE c.status = 'published' 
    AND 'free' = ANY(c.tier_access)
  )
);
