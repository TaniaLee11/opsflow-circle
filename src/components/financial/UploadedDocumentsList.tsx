import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  FileSpreadsheet, 
  Image, 
  Trash2, 
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFinancialDocuments, FinancialDocument } from "@/hooks/useFinancialDocuments";
import { format } from "date-fns";

interface UploadedDocumentsListProps {
  onRefresh?: () => void;
}

const DOCUMENT_TYPE_LABELS: Record<FinancialDocument['document_type'], string> = {
  bank_statement: 'Bank Statement',
  receipt: 'Receipt',
  invoice: 'Invoice',
  tax_doc: 'Tax Document',
  other: 'Other',
};

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel')) {
    return FileSpreadsheet;
  }
  if (mimeType.includes('image')) {
    return Image;
  }
  return FileText;
}

function getStatusBadge(status: FinancialDocument['extraction_status']) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-success/20 text-success border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Processed</Badge>;
    case 'processing':
      return <Badge className="bg-info/20 text-info border-0"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
    case 'failed':
      return <Badge className="bg-destructive/20 text-destructive border-0"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    default:
      return <Badge className="bg-muted text-muted-foreground border-0"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  }
}

export function UploadedDocumentsList({ onRefresh }: UploadedDocumentsListProps) {
  const { documents, isLoading, fetchDocuments, deleteDocument, getDocumentUrl } = useFinancialDocuments();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDownload = async (doc: FinancialDocument) => {
    const url = await getDocumentUrl(doc.storage_path);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleDelete = async (doc: FinancialDocument) => {
    if (confirm(`Delete "${doc.name}"? This cannot be undone.`)) {
      await deleteDocument(doc);
      onRefresh?.();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="font-medium">No documents uploaded</p>
        <p className="text-sm">Upload bank statements, receipts, or invoices to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc, index) => {
        const Icon = getFileIcon(doc.mime_type);
        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
          >
            <div className="p-2.5 rounded-lg bg-muted">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{doc.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{DOCUMENT_TYPE_LABELS[doc.document_type]}</span>
                <span>•</span>
                <span>{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                {doc.file_size && (
                  <>
                    <span>•</span>
                    <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getStatusBadge(doc.extraction_status)}
              
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(doc)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
