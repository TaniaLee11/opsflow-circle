import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FolderLock, 
  Upload, 
  Search, 
  Grid3X3, 
  List, 
  FileText, 
  Image, 
  FileSpreadsheet,
  File,
  FolderOpen,
  Download,
  Share2,
  Trash2,
  MoreVertical,
  Plus,
  Clock,
  Star,
  Users,
  Lock,
  Sparkles,
  Eye,
  Presentation,
  Loader2
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useClientView } from "@/contexts/ClientViewContext";
import { VOPSyAgent } from "@/components/vopsy/VOPSyAgent";
import { usePresentationIntelligence, VaultDocument } from "@/hooks/usePresentationIntelligence";
import { GoogleDriveSection } from "@/components/vault/GoogleDriveSection";
import { FileUploadZone } from "@/components/vault/FileUploadZone";

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="w-5 h-5 text-destructive" />;
    case "spreadsheet":
      return <FileSpreadsheet className="w-5 h-5 text-success" />;
    case "folder":
      return <FolderOpen className="w-5 h-5 text-warning" />;
    case "image":
      return <Image className="w-5 h-5 text-info" />;
    case "document":
      return <FileText className="w-5 h-5 text-primary" />;
    case "presentation":
      return <Presentation className="w-5 h-5 text-accent" />;
    default:
      return <File className="w-5 h-5 text-muted-foreground" />;
  }
};

// Templates for new business owners
const templates = [
  {
    id: "t1",
    name: "Business Plan Template",
    description: "Comprehensive business plan for startups and small businesses",
    category: "Planning",
    downloads: 1240,
  },
  {
    id: "t2",
    name: "Invoice Template",
    description: "Professional invoice template with automatic calculations",
    category: "Finance",
    downloads: 2350,
  },
  {
    id: "t3",
    name: "Employee Handbook",
    description: "Complete employee handbook template for new hires",
    category: "HR",
    downloads: 890,
  },
  {
    id: "t4",
    name: "Marketing Plan",
    description: "Strategic marketing plan template for growth",
    category: "Marketing",
    downloads: 1560,
  },
  {
    id: "t5",
    name: "LLC Operating Agreement",
    description: "Standard operating agreement for LLCs",
    category: "Legal",
    downloads: 3200,
  },
  {
    id: "t6",
    name: "First-Year Budget Planner",
    description: "Budget planning spreadsheet for your first year in business",
    category: "Finance",
    downloads: 1890,
  },
];

function VaultContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("my-files");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { isOwner } = useAuth();
  const { viewedClient, isViewingClient } = useClientView();
  
  // Real documents from database
  const { 
    documents: vaultDocuments, 
    fetchDocuments, 
    downloadDocument,
    deleteDocument, 
    toggleStarred,
    isLoading: isDocumentsLoading 
  } = usePresentationIntelligence();
  
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Handle upload complete - refresh documents and close dialog
  const handleUploadComplete = () => {
    fetchDocuments();
    setIsUploadOpen(false);
  };
  
  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Map real documents for display
  const allDocuments = vaultDocuments.map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    size: doc.size_bytes ? `${(doc.size_bytes / 1024).toFixed(1)} KB` : 'N/A',
    modified: new Date(doc.updated_at).toLocaleDateString(),
    shared: doc.shared,
    starred: doc.starred,
    owner: 'You',
    storagePath: doc.storage_path,
    category: doc.category,
    description: doc.description,
  }));

  const filteredDocuments = allDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine if we're in read-only mode (owner viewing client data)
  const isReadOnly = isOwner && isViewingClient;

  // Handle document download
  const handleDownload = async (doc: any) => {
    if (doc.storagePath) {
      setDownloadingId(doc.id);
      try {
        await downloadDocument(doc.storagePath, doc.name);
      } finally {
        setDownloadingId(null);
      }
    }
  };

  // Handle document delete
  const handleDelete = async (doc: any) => {
    if (doc.storagePath) {
      await deleteDocument(doc.id, doc.storagePath);
    }
  };

  // Handle star toggle
  const handleToggleStar = async (doc: any) => {
    await toggleStarred(doc.id, !doc.starred);
  };

  return (
    <div className={cn("min-h-screen bg-background", isReadOnly && "pt-10")}>
      <Sidebar />
      
      <main className="lg:pl-64 min-h-screen pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FolderLock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {isReadOnly ? `${viewedClient?.displayName || viewedClient?.companyName || "Client"}'s Vault` : "Vault"}
                </h1>
                {isReadOnly && (
                  <Badge className="bg-warning/20 text-warning border-0 gap-1 text-xs">
                    <Eye className="w-3 h-3" />
                    Read Only
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isReadOnly 
                  ? `Viewing documents for ${viewedClient?.email || "this client"}`
                  : "Secure document storage shared between you and your advisor"}
              </p>
            </div>

            {!isReadOnly && (
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                    <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                  </DialogHeader>
                  <FileUploadZone onUploadComplete={handleUploadComplete} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documents and templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded transition-colors",
                  viewMode === "grid" ? "bg-background shadow-sm" : "hover:bg-background/50"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded transition-colors",
                  viewMode === "list" ? "bg-background shadow-sm" : "hover:bg-background/50"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats + Google Drive Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-3 sm:gap-4">
              <Card className="bg-card/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{vaultDocuments.length}</p>
                    <p className="text-xs text-muted-foreground">Total Files</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{vaultDocuments.filter(d => d.shared).length}</p>
                    <p className="text-xs text-muted-foreground">Shared</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{vaultDocuments.filter(d => d.starred).length}</p>
                    <p className="text-xs text-muted-foreground">Starred</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-xs text-muted-foreground">Encrypted</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Google Drive Recent Files */}
            <GoogleDriveSection />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="my-files" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                My Files
              </TabsTrigger>
              <TabsTrigger value="shared" className="gap-2">
                <Users className="w-4 h-4" />
                Shared with Advisor
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="w-4 h-4" />
                Recent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-files" className="space-y-4">
              {isDocumentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : filteredDocuments.length === 0 ? (
                <Card className="bg-card/50">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <FolderOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                      Upload your first document to get started. Drag & drop files or click to browse.
                    </p>
                    <FileUploadZone 
                      onUploadComplete={() => fetchDocuments()} 
                      className="w-full max-w-md"
                    />
                  </CardContent>
                </Card>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* New Folder Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors min-h-[160px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">New Folder</span>
                  </motion.div>

                  {filteredDocuments.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={cn(
                          "hover:shadow-lg transition-all cursor-pointer group",
                          downloadingId === doc.id && "opacity-70"
                        )}
                        onClick={() => handleDownload(doc)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center relative">
                              {downloadingId === doc.id ? (
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                              ) : (
                                getFileIcon(doc.type)
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {doc.starred && (
                                <Star className="w-4 h-4 text-warning fill-warning" />
                              )}
                              {doc.shared && (
                                <Users className="w-4 h-4 text-info" />
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <button className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuItem 
                                    onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                                    disabled={downloadingId === doc.id}
                                  >
                                    {downloadingId === doc.id ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Download className="w-4 h-4 mr-2" />
                                    )}
                                    {downloadingId === doc.id ? 'Downloading...' : 'Download'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStar(doc); }}>
                                    <Star className="w-4 h-4 mr-2" />
                                    {doc.starred ? 'Unstar' : 'Star'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive" 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <h3 className="font-medium text-sm mb-1 truncate">{doc.name}</h3>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{doc.size}</span>
                            <span>{doc.modified}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Owner</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Modified</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Size</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocuments.map((doc) => (
                          <tr 
                            key={doc.id} 
                            className={cn(
                              "border-b last:border-0 hover:bg-muted/50 cursor-pointer",
                              downloadingId === doc.id && "opacity-70"
                            )}
                            onClick={() => handleDownload(doc)}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {downloadingId === doc.id ? (
                                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                ) : (
                                  getFileIcon(doc.type)
                                )}
                                <span className="font-medium text-sm">{doc.name}</span>
                                {doc.starred && <Star className="w-3 h-3 text-warning fill-warning" />}
                                {doc.shared && <Users className="w-3 h-3 text-info" />}
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{doc.owner}</td>
                            <td className="p-4 text-sm text-muted-foreground">{doc.modified}</td>
                            <td className="p-4 text-sm text-muted-foreground">{doc.size}</td>
                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => handleDownload(doc)}
                                    disabled={downloadingId === doc.id}
                                  >
                                    {downloadingId === doc.id ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Download className="w-4 h-4 mr-2" />
                                    )}
                                    {downloadingId === doc.id ? 'Downloading...' : 'Download'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDelete(doc)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="shared" className="space-y-4">
              <Card className="border-info/20 bg-info/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <h3 className="font-medium">Shared Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      These documents are shared between you and your advisor for secure collaboration
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.filter(d => d.shared).map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            {getFileIcon(doc.type)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {doc.owner}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-sm mb-1 truncate">{doc.name}</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{doc.size}</span>
                          <span>{doc.modified}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">First-Year Business Templates</h3>
                    <p className="text-sm text-muted-foreground">
                      Professional templates to help you get your business started right
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-all cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Download className="w-3 h-3" />
                            {template.downloads.toLocaleString()}
                          </div>
                        </div>
                        <h3 className="font-semibold mb-2">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                        <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    Recently Accessed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filteredDocuments.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.type)}
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">Modified {doc.modified}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Owner View: Client Documents */}
          {isOwner && (
            <div className="mt-8">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Client Vaults
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    As an owner, you can view and manage documents for all your clients
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["Acme Corp", "TechStart LLC", "Green Solutions"].map((client, i) => (
                      <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {client.split(" ").map(w => w[0]).join("")}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{client}</p>
                            <p className="text-xs text-muted-foreground">{5 + i * 3} documents</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <VOPSyAgent />
    </div>
  );
}

export default function Vault() {
  return (
    <AccessGate>
      <VaultContent />
    </AccessGate>
  );
}
