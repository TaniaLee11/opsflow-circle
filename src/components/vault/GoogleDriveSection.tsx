import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  RefreshCw, 
  FileText, 
  FileSpreadsheet, 
  Presentation,
  Image,
  Film,
  Music,
  FolderOpen,
  File,
  Download,
  AlertCircle,
  Cloud
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGoogleDrive, DriveFile } from '@/hooks/useGoogleDrive';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('folder')) return <FolderOpen className="w-5 h-5 text-warning" />;
  if (mimeType.includes('document') || mimeType.includes('word')) return <FileText className="w-5 h-5 text-primary" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-success" />;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <Presentation className="w-5 h-5 text-accent" />;
  if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-destructive" />;
  if (mimeType.includes('image')) return <Image className="w-5 h-5 text-info" />;
  if (mimeType.includes('video')) return <Film className="w-5 h-5 text-accent" />;
  if (mimeType.includes('audio')) return <Music className="w-5 h-5 text-primary" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
};

interface GoogleDriveSectionProps {
  className?: string;
}

export function GoogleDriveSection({ className }: GoogleDriveSectionProps) {
  const navigate = useNavigate();
  const { 
    isLoading, 
    isConnected, 
    connectedAccount, 
    files, 
    error,
    fetchRecentFiles,
    openFile,
    formatFileSize
  } = useGoogleDrive();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchRecentFiles(10);
  }, [fetchRecentFiles]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRecentFiles(10);
    setIsRefreshing(false);
  };

  const handleConnect = () => {
    navigate('/integrations');
  };

  // Not connected state
  if (!isLoading && !isConnected) {
    return (
      <Card className={cn("bg-card/50", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cloud className="w-5 h-5 text-primary" />
            Google Drive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Cloud className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {error || "Connect Google Drive to see your recent files here"}
            </p>
            <Button size="sm" onClick={handleConnect}>
              Connect Google Drive
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-card/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cloud className="w-5 h-5 text-primary" />
            Google Drive
            <Badge variant="outline" className="text-xs font-normal">
              {connectedAccount}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://drive.google.com', '_blank')}
              className="h-8 gap-1 text-xs"
            >
              Open Drive
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error && isConnected ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No recent files found in your Drive
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => openFile(file)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer group transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {file.thumbnailLink ? (
                    <img 
                      src={file.thumbnailLink} 
                      alt="" 
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={file.thumbnailLink ? 'hidden' : ''}>
                    {getFileIcon(file.mimeType)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(file.modifiedTime).toLocaleDateString()}
                    {file.size && ` • ${formatFileSize(file.size)}`}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
