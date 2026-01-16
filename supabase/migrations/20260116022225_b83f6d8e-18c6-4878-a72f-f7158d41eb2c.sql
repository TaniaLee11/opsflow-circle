-- Create vault_documents table for storing document metadata
CREATE TABLE public.vault_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  storage_path TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  description TEXT,
  shared BOOLEAN DEFAULT false,
  starred BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own documents" 
ON public.vault_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.vault_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.vault_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.vault_documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Platform owners can view all documents
CREATE POLICY "Owners can view all documents"
ON public.vault_documents
FOR SELECT
USING (public.is_platform_owner(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_vault_documents_updated_at
BEFORE UPDATE ON public.vault_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for vault files
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault', 'vault', false);

-- Storage policies for vault bucket
CREATE POLICY "Users can view their own vault files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload to their own vault folder"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own vault files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own vault files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);