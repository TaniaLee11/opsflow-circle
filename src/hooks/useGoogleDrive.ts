import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink: string;
  thumbnailLink?: string;
  modifiedTime: string;
  size?: string;
  owners?: { displayName: string; emailAddress: string }[];
}

interface DriveResponse {
  connected: boolean;
  provider: string;
  connectedAccount: string;
  files: DriveFile[];
  error?: string;
}

export function useGoogleDrive() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string>('');
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentFiles = useCallback(async (limit: number = 10): Promise<DriveFile[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('gdrive-fetch', {
        body: { limit },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      const response = data as DriveResponse;
      
      setIsConnected(response.connected);
      setConnectedAccount(response.connectedAccount);
      setFiles(response.files);
      
      if (response.error) {
        setError(response.error);
      }

      return response.files;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch Drive files';
      setError(errorMsg);
      setIsConnected(false);
      setFiles([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openFile = useCallback((file: DriveFile) => {
    if (file.webViewLink) {
      window.open(file.webViewLink, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const getFileTypeCategory = useCallback((mimeType: string): string => {
    if (mimeType.includes('folder')) return 'folder';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('audio')) return 'audio';
    return 'file';
  }, []);

  const formatFileSize = useCallback((bytes?: string): string => {
    if (!bytes) return '';
    const size = parseInt(bytes, 10);
    if (isNaN(size)) return '';
    
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }, []);

  return {
    isLoading,
    isConnected,
    connectedAccount,
    files,
    error,
    fetchRecentFiles,
    openFile,
    getFileTypeCategory,
    formatFileSize,
  };
}
