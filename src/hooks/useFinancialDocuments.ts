import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface FinancialDocument {
  id: string;
  name: string;
  storage_path: string;
  document_type: 'bank_statement' | 'receipt' | 'invoice' | 'tax_doc' | 'other';
  period_start: string | null;
  period_end: string | null;
  extracted_data: Record<string, unknown>;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
}

export function useFinancialDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<FinancialDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('financial_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data as FinancialDocument[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch documents';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const uploadDocument = useCallback(async (
    file: File, 
    documentType: FinancialDocument['document_type'],
    periodStart?: string,
    periodEnd?: string
  ) => {
    if (!user?.id) {
      toast.error('You must be logged in to upload documents');
      return null;
    }

    setIsUploading(true);
    try {
      // Upload to storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('financial-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data, error: dbError } = await supabase
        .from('financial_documents')
        .insert({
          user_id: user.id,
          name: file.name,
          storage_path: filePath,
          document_type: documentType,
          period_start: periodStart || null,
          period_end: periodEnd || null,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      setDocuments(prev => [data as FinancialDocument, ...prev]);
      return data as FinancialDocument;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user?.id]);

  const deleteDocument = useCallback(async (doc: FinancialDocument) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('financial-docs')
        .remove([doc.storage_path]);

      if (storageError) throw storageError;

      // Delete record
      const { error: dbError } = await supabase
        .from('financial_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      toast.success('Document deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      toast.error(msg);
    }
  }, []);

  const getDocumentUrl = useCallback(async (storagePath: string) => {
    const { data, error } = await supabase.storage
      .from('financial-docs')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      toast.error('Failed to get document URL');
      return null;
    }
    return data.signedUrl;
  }, []);

  return {
    documents,
    isLoading,
    isUploading,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    getDocumentUrl,
  };
}
