import { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FinancialDocument } from "@/hooks/useFinancialDocuments";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (
    file: File,
    documentType: FinancialDocument['document_type'],
    periodStart?: string,
    periodEnd?: string
  ) => Promise<FinancialDocument | null>;
  isUploading: boolean;
}

const DOCUMENT_TYPES: { value: FinancialDocument['document_type']; label: string }[] = [
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'tax_doc', label: 'Tax Document' },
  { value: 'other', label: 'Other' },
];

export function DocumentUploadDialog({ 
  open, 
  onOpenChange, 
  onUpload,
  isUploading 
}: DocumentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<FinancialDocument['document_type']>('other');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    const result = await onUpload(
      file, 
      documentType, 
      periodStart || undefined, 
      periodEnd || undefined
    );
    
    if (result) {
      // Reset form
      setFile(null);
      setDocumentType('other');
      setPeriodStart('');
      setPeriodEnd('');
      onOpenChange(false);
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setDocumentType('other');
    setPeriodStart('');
    setPeriodEnd('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Financial Document</DialogTitle>
          <DialogDescription>
            Upload bank statements, receipts, invoices, or tax documents for analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
              isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              file && "border-success bg-success/5"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-10 h-10 text-success" />
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-muted-foreground" />
                <p className="font-medium text-foreground">Drop file here or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  PDF, CSV, Excel, or images
                </p>
              </div>
            )}
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={documentType} onValueChange={(v) => setDocumentType(v as typeof documentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Period Start (optional)</Label>
              <Input 
                type="date" 
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Period End (optional)</Label>
              <Input 
                type="date" 
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
