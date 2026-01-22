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
  AlertCircle,
  Cloud
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGoogleDrive, DriveFile } from '@/hooks/useGoogleDrive';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('folder')) return <FolderOpen className="w-4 h-4 text-warning" />;
  if (mimeType.includes('document') || mimeType.includes('word')) return <FileText className="w-4 h-4 text-primary" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-4 h-4 text-success" />;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <Presentation className="w-4 h-4 text-accent" />;
  if (mimeType.includes('pdf')) return <FileText className="w-4 h-4 text-destructive" />;
  if (mimeType.includes('image')) return <Image className="w-4 h-4 text-info" />;
  if (mimeType.includes('video')) return <Film className="w-4 h-4 text-accent" />;
  if (mimeType.includes('audio')) return <Music className="w-4 h-4 text-primary" />;
  return <File className="w-4 h-4 text-muted-foreground" />;
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
      <Card className={cn("bg-card/50 h-full", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Cloud className="w-3.5 h-3.5 text-primary" />
            </div>
            Google Drive
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <Cloud className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mb-3 max-w-[180px]">
              {error || "Connect to see recent files"}
            </p>
            <Button size="sm" variant="outline" onClick={handleConnect} className="text-xs h-8">
              Connect Drive
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-card/50 h-full flex flex-col", className)}>
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Cloud className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="truncate">Google Drive</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-7 w-7 p-0 shrink-0"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          </Button>
        </div>
        {connectedAccount && (
          <p className="text-[10px] text-muted-foreground mt-1 truncate pl-8">
            {connectedAccount}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-3 w-3/4 mb-1" />
                  <Skeleton className="h-2 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error && isConnected ? (
          <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 text-destructive text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No recent files
          </div>
        ) : (
          <ScrollArea className="flex-1 -mx-2">
            <div className="space-y-0.5 px-2">
              {files.slice(0, 6).map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => openFile(file)}
                  className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/50 cursor-pointer group transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate leading-tight">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {new Date(file.modifiedTime).toLocaleDateString()}
                    </p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {/* Open Drive link - inside the card */}
        {isConnected && !isLoading && (
          <div className="pt-2 mt-auto border-t border-border/50 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://drive.google.com', '_blank')}
              className="w-full h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              Open in Google Drive
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
