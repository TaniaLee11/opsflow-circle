import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VaultDocument {
  id: string;
  name: string;
  type: string;
  mime_type?: string;
  size_bytes?: number;
  storage_path: string;
  category?: string;
  description?: string;
  shared: boolean;
  starred: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PresentationResult {
  success: boolean;
  message?: string;
  document?: {
    id: string;
    name: string;
    path: string;
    slides: number;
    downloadUrl?: string;
  };
  slides?: string[];
  error?: string;
}

export function usePresentationIntelligence() {
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);

  // Generate a presentation
  const generatePresentation = useCallback(async (
    topic: string,
    context?: string,
    slideCount?: number
  ): Promise<PresentationResult> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-presentation', {
        body: { topic, context, slideCount },
      });

      if (error) throw error;

      if (data.success && data.document) {
        toast.success('Presentation saved to Vault!');
        // Refresh documents list
        await fetchDocuments();
      }

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate presentation';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all vault documents
  const fetchDocuments = useCallback(async (category?: string): Promise<VaultDocument[]> => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('vault_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      const docs = (data || []) as VaultDocument[];
      setDocuments(docs);
      return docs;
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get download URL for a document
  const getDownloadUrl = useCallback(async (storagePath: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('vault')
        .createSignedUrl(storagePath, 3600);

      if (error) throw error;
      return data?.signedUrl || null;
    } catch (err) {
      console.error('Failed to get download URL:', err);
      return null;
    }
  }, []);

  // Delete a document
  const deleteDocument = useCallback(async (documentId: string, storagePath: string): Promise<boolean> => {
    try {
      // Delete from storage
      await supabase.storage.from('vault').remove([storagePath]);

      // Delete record
      const { error } = await supabase
        .from('vault_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(d => d.id !== documentId));
      toast.success('Document deleted');
      return true;
    } catch (err) {
      toast.error('Failed to delete document');
      return false;
    }
  }, []);

  // Toggle starred status
  const toggleStarred = useCallback(async (documentId: string, starred: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vault_documents')
        .update({ starred })
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.map(d => 
        d.id === documentId ? { ...d, starred } : d
      ));
      return true;
    } catch (err) {
      toast.error('Failed to update document');
      return false;
    }
  }, []);

  return {
    isLoading,
    documents,
    generatePresentation,
    fetchDocuments,
    getDownloadUrl,
    deleteDocument,
    toggleStarred,
  };
}
