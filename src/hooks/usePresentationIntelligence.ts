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
    format?: string;
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

  // Get download URL for a document with optional filename for download
  const getDownloadUrl = useCallback(async (
    storagePath: string, 
    forceDownload: boolean = true,
    customFilename?: string
  ): Promise<string | null> => {
    try {
      // Extract filename from path if not provided
      const filename = customFilename || storagePath.split('/').pop() || 'document';
      
      const { data, error } = await supabase.storage
        .from('vault')
        .createSignedUrl(storagePath, 3600, {
          download: forceDownload ? filename : undefined,
        });

      if (error) {
        console.error('Signed URL error:', error);
        throw error;
      }
      return data?.signedUrl || null;
    } catch (err) {
      console.error('Failed to get download URL:', err);
      toast.error('Unable to access file. Please try again.');
      return null;
    }
  }, []);

  // Download a document directly
  const downloadDocument = useCallback(async (storagePath: string, filename?: string): Promise<boolean> => {
    try {
      const url = await getDownloadUrl(storagePath, true, filename);
      if (!url) {
        throw new Error('Could not generate download link');
      }
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || storagePath.split('/').pop() || 'document';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Download failed. Please try again.');
      return false;
    }
  }, [getDownloadUrl]);

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
    downloadDocument,
    deleteDocument,
    toggleStarred,
  };
}
