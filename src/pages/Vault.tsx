import { FolderOpen, Upload, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Vault() {
  const handleUpload = () => {
    // TODO: Open file upload
    console.log("Upload clicked");
  };

  const handleCreateFolder = () => {
    // TODO: Create folder
    console.log("Create folder clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vault</h1>
          <p className="text-muted-foreground mt-1">
            Secure document storage
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateFolder}
            className="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent"
          >
            <Plus className="w-4 h-4" />
            New Folder
          </button>
          <button
            onClick={handleUpload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      <EmptyState
        icon={FolderOpen}
        title="No documents yet"
        description="Upload your first document to start building your secure document vault."
        actions={[
          {
            label: "Upload Document",
            onClick: handleUpload,
          },
        ]}
      />
    </div>
  );
}
