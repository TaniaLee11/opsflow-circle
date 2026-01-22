import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export interface UploadResult {
  success: boolean;
  documentId?: string;
  storagePath?: string;
  error?: string;
}

// Helper to determine file type category
const getFileType = (mimeType: string): string => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text')) return 'document';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('video')) return 'video';
  if (mimeType.includes('audio')) return 'audio';
  return 'file';
};

// Helper to get category from file type
const getCategoryFromType = (type: string): string => {
  switch (type) {
    case 'pdf':
    case 'document':
      return 'Documents';
    case 'spreadsheet':
      return 'Spreadsheets';
    case 'presentation':
      return 'Presentations';
    case 'image':
      return 'Images';
    case 'video':
    case 'audio':
      return 'Media';
    default:
      return 'Other';
  }
};

export function useVaultUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);

  // Upload a single file
  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to upload files');
      }

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${user.id}/${timestamp}-${sanitizedName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Determine file type and category
      const fileType = getFileType(file.type);
      const category = getCategoryFromType(fileType);

      // Create database record
      const { data: docData, error: dbError } = await supabase
        .from('vault_documents')
        .insert({
          user_id: user.id,
          name: file.name,
          type: fileType,
          mime_type: file.type,
          size_bytes: file.size,
          storage_path: storagePath,
          category,
          shared: false,
          starred: false,
        })
        .select('id')
        .single();

      if (dbError) {
        // Clean up storage if db insert fails
        await supabase.storage.from('vault').remove([storagePath]);
        throw dbError;
      }

      return {
        success: true,
        documentId: docData.id,
        storagePath,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      return { success: false, error: errorMsg };
    }
  }, []);

  // Upload multiple files with progress tracking
  const uploadFiles = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);
    
    // Initialize progress queue
    const initialQueue: UploadProgress[] = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'pending',
    }));
    setUploadQueue(initialQueue);

    const results: UploadResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update status to uploading
      setUploadQueue(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'uploading', progress: 50 } : item
      ));

      const result = await uploadFile(file);
      results.push(result);

      // Update status based on result
      setUploadQueue(prev => prev.map((item, idx) => 
        idx === i ? { 
          ...item, 
          status: result.success ? 'complete' : 'error',
          progress: result.success ? 100 : 0,
          error: result.error,
        } : item
      ));

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    // Show summary toast
    if (successCount > 0 && errorCount === 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully`);
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`${successCount} uploaded, ${errorCount} failed`);
    } else if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} file${errorCount > 1 ? 's' : ''}`);
    }

    // Clear queue after delay
    setTimeout(() => {
      setUploadQueue([]);
    }, 2000);

    setIsUploading(false);
    return results;
  }, [uploadFile]);

  // Clear upload queue
  const clearQueue = useCallback(() => {
    setUploadQueue([]);
  }, []);

  return {
    isUploading,
    uploadQueue,
    uploadFile,
    uploadFiles,
    clearQueue,
  };
}
