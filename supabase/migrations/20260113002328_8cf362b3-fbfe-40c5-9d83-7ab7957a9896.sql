-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can manage their org integrations" ON public.integrations;
DROP POLICY IF EXISTS "Users can view their org integrations" ON public.integrations;

-- Create user-level RLS policies that restrict access to only the user's own integrations
CREATE POLICY "Users can view their own integrations" 
ON public.integrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations" 
ON public.integrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" 
ON public.integrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" 
ON public.integrations 
FOR DELETE 
USING (auth.uid() = user_id);