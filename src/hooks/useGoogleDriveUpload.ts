import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  error?: string;
}

export function useGoogleDriveUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const uploadToGDrive = useCallback(async (
    documentId: string,
    storagePath: string,
    fileName: string,
    mimeType?: string
  ): Promise<UploadResult> => {
    setIsUploading(true);
    setUploadingDocId(documentId);

    try {
      const { data, error } = await supabase.functions.invoke('gdrive-upload', {
        body: {
          documentId,
          storagePath,
          fileName,
          mimeType: mimeType || 'application/octet-stream',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const result = data as UploadResult;

      if (result.success) {
        toast.success('File saved to Google Drive!', {
          description: fileName,
          action: result.webViewLink ? {
            label: 'Open',
            onClick: () => window.open(result.webViewLink, '_blank'),
          } : undefined,
        });
      } else {
        toast.error('Failed to save to Google Drive', {
          description: result.error,
        });
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload to Google Drive';
      toast.error('Upload failed', { description: errorMsg });
      return { success: false, error: errorMsg };
    } finally {
      setIsUploading(false);
      setUploadingDocId(null);
    }
  }, []);

  return {
    isUploading,
    uploadingDocId,
    uploadToGDrive,
  };
}
