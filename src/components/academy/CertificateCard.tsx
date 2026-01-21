import { motion } from "framer-motion";
import { Award, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface CertificateCardProps {
  courseName: string;
  certificateNumber: string;
  issuedAt: string;
  userName?: string;
}

export function CertificateCard({ 
  courseName, 
  certificateNumber, 
  issuedAt,
  userName 
}: CertificateCardProps) {
  const { user } = useAuth();
  const displayName = userName || user?.name || "Student";

  const handleDownload = () => {
    // Create a simple certificate SVG and download
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#grad)"/>
        <rect x="20" y="20" width="760" height="560" fill="none" stroke="#fbbf24" stroke-width="3"/>
        <rect x="30" y="30" width="740" height="540" fill="none" stroke="#fbbf24" stroke-width="1"/>
        
        <text x="400" y="100" text-anchor="middle" fill="#fbbf24" font-family="serif" font-size="42" font-weight="bold">CERTIFICATE</text>
        <text x="400" y="140" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="16">OF COMPLETION</text>
        
        <text x="400" y="220" text-anchor="middle" fill="#e5e7eb" font-family="sans-serif" font-size="14">This is to certify that</text>
        <text x="400" y="270" text-anchor="middle" fill="#ffffff" font-family="serif" font-size="32" font-weight="bold">${displayName}</text>
        
        <text x="400" y="330" text-anchor="middle" fill="#e5e7eb" font-family="sans-serif" font-size="14">has successfully completed the course</text>
        <text x="400" y="380" text-anchor="middle" fill="#fbbf24" font-family="serif" font-size="24" font-weight="bold">${courseName}</text>
        
        <text x="400" y="480" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="12">Certificate Number: ${certificateNumber}</text>
        <text x="400" y="510" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="12">Issued on: ${format(new Date(issuedAt), 'MMMM d, yyyy')}</text>
        
        <text x="400" y="560" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="10">Virtual Operations Platform • Academy</text>
      </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${certificateNumber}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-xl border-2 border-warning/30 bg-gradient-to-br from-background to-muted/30"
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-warning/50" />
      <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-warning/50" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-warning/50" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-warning/50" />

      <div className="p-6 text-center">
        <Award className="w-12 h-12 text-warning mx-auto mb-3" />
        
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          Certificate of Completion
        </p>
        
        <h3 className="text-lg font-bold text-foreground mb-1">
          {courseName}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          Awarded to <span className="text-foreground font-medium">{displayName}</span>
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
          <span>#{certificateNumber}</span>
          <span>•</span>
          <span>{format(new Date(issuedAt), 'MMM d, yyyy')}</span>
        </div>

        <div className="flex justify-center gap-2">
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
