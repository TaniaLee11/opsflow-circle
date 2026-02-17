import { BookOpen, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function HelpDesk() {
  const handleCreateArticle = () => {
    // TODO: Implement create article
    console.log("Create Article clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Help Desk</h1>
          <p className="text-muted-foreground mt-1">
            Build your knowledge base and help articles
          </p>
        </div>
        <button
          onClick={handleCreateArticle}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Article
        </button>
      </div>

      <EmptyState
        icon={BookOpen}
        title="No help desk yet"
        description="Build your knowledge base and help articles"
        actions={[
          {
            label: "Create Article",
            onClick: handleCreateArticle,
          },
        ]}
      />
    </div>
  );
}
