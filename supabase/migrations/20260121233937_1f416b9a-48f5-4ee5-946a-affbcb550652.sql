-- Create storage bucket for financial document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('financial-docs', 'financial-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for financial-docs bucket
CREATE POLICY "Users can upload their own financial docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'financial-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own financial docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'financial-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own financial docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'financial-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Platform owners can view all financial docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'financial-docs' 
  AND is_platform_owner(auth.uid())
);

-- Table to track uploaded financial documents
CREATE TABLE public.financial_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'other', -- bank_statement, receipt, invoice, tax_doc, other
  period_start DATE,
  period_end DATE,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  extraction_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for financial_documents
CREATE POLICY "Users can view their own financial documents"
ON public.financial_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financial documents"
ON public.financial_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial documents"
ON public.financial_documents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial documents"
ON public.financial_documents FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Platform owners can view all financial documents"
ON public.financial_documents FOR SELECT
USING (is_platform_owner(auth.uid()));

-- Table for platform billing reports (owner only)
CREATE TABLE public.platform_billing_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL, -- revenue, subscriptions, hours, invoices
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_billing_reports ENABLE ROW LEVEL SECURITY;

-- Only platform owners can manage billing reports
CREATE POLICY "Platform owners can view billing reports"
ON public.platform_billing_reports FOR SELECT
USING (is_platform_owner(auth.uid()));

CREATE POLICY "Platform owners can create billing reports"
ON public.platform_billing_reports FOR INSERT
WITH CHECK (is_platform_owner(auth.uid()));

CREATE POLICY "Platform owners can delete billing reports"
ON public.platform_billing_reports FOR DELETE
USING (is_platform_owner(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_financial_documents_updated_at
BEFORE UPDATE ON public.financial_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();