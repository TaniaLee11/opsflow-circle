-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'trophy',
  color TEXT NOT NULL DEFAULT 'primary',
  requirement_type TEXT NOT NULL, -- 'courses_completed', 'quizzes_perfect', 'streak_days', 'first_course', 'all_lessons'
  requirement_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges for earned badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create user_academy_stats for tracking XP, streaks, level
CREATE TABLE public.user_academy_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  courses_completed INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  quizzes_perfect INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certificates table
CREATE TABLE public.course_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_academy_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

-- Badges are viewable by all authenticated users
CREATE POLICY "Anyone can view badges"
ON public.badges FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Platform owners can manage badges
CREATE POLICY "Platform owners can manage badges"
ON public.badges FOR ALL
USING (is_platform_owner(auth.uid()));

-- Users can view their own earned badges
CREATE POLICY "Users can view their own badges"
ON public.user_badges FOR SELECT
USING (auth.uid() = user_id);

-- System inserts badges (via trigger or function)
CREATE POLICY "Users can earn badges"
ON public.user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view/manage their own stats
CREATE POLICY "Users can view their own stats"
ON public.user_academy_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
ON public.user_academy_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.user_academy_stats FOR UPDATE
USING (auth.uid() = user_id);

-- Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
ON public.course_certificates FOR SELECT
USING (auth.uid() = user_id);

-- Platform owners can view all certificates
CREATE POLICY "Platform owners can view all certificates"
ON public.course_certificates FOR SELECT
USING (is_platform_owner(auth.uid()));

CREATE POLICY "Users can earn certificates"
ON public.course_certificates FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, color, requirement_type, requirement_value, xp_reward) VALUES
('First Steps', 'Complete your first lesson', 'footprints', 'info', 'lessons_completed', 1, 50),
('Quick Learner', 'Complete your first course', 'graduation-cap', 'primary', 'courses_completed', 1, 200),
('Knowledge Seeker', 'Complete 5 courses', 'book-open', 'success', 'courses_completed', 5, 500),
('Master Scholar', 'Complete 10 courses', 'crown', 'warning', 'courses_completed', 10, 1000),
('Perfect Score', 'Get 100% on a quiz', 'target', 'success', 'quizzes_perfect', 1, 150),
('Quiz Master', 'Get perfect scores on 10 quizzes', 'brain', 'primary', 'quizzes_perfect', 10, 750),
('On Fire', 'Maintain a 7-day learning streak', 'flame', 'destructive', 'streak_days', 7, 300),
('Dedicated', 'Maintain a 30-day learning streak', 'zap', 'warning', 'streak_days', 30, 1000),
('Lesson Legend', 'Complete 50 lessons', 'medal', 'primary', 'lessons_completed', 50, 800);

-- Create trigger for updated_at
CREATE TRIGGER update_user_academy_stats_updated_at
BEFORE UPDATE ON public.user_academy_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();