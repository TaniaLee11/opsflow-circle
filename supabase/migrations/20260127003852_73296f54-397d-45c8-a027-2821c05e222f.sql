-- Create saved_contacts table for storing user's frequently used email addresses
CREATE TABLE public.saved_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  use_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on user_id + email
CREATE UNIQUE INDEX saved_contacts_user_email_idx ON public.saved_contacts (user_id, email);

-- Enable RLS
ALTER TABLE public.saved_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only manage their own saved contacts
CREATE POLICY "Users can view their own saved contacts"
ON public.saved_contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved contacts"
ON public.saved_contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved contacts"
ON public.saved_contacts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved contacts"
ON public.saved_contacts FOR DELETE
USING (auth.uid() = user_id);