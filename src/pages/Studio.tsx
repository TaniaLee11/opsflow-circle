import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { 
  Image, 
  Video, 
  Music, 
  Wand2, 
  Download, 
  Loader2,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type GenerationType = "image" | "video" | "audio";

interface GeneratedContent {
  type: GenerationType;
  url: string;
  prompt: string;
  createdAt: Date;
}

export default function Studio() {
  const [activeTab, setActiveTab] = useState<GenerationType>("image");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("studio-generate", {
        body: { 
          type: activeTab, 
          prompt: prompt.trim() 
        }
      });

      if (error) {
        // Check for rate limiting or payment errors
        if (error.message?.includes("429") || error.message?.includes("rate")) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message?.includes("402")) {
          toast.error("Usage limit reached. Please add credits to continue.");
        } else {
          throw error;
        }
        return;
      }

      if (data?.url) {
        setGeneratedContent(prev => [{
          type: activeTab,
          url: data.url,
          prompt: prompt.trim(),
          createdAt: new Date()
        }, ...prev]);
        toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} generated successfully!`);
        setPrompt("");
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (content: GeneratedContent) => {
    try {
      const response = await fetch(content.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `studio-${content.type}-${Date.now()}.${content.type === "audio" ? "mp3" : content.type === "video" ? "mp4" : "png"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download started!");
    } catch (error) {
      toast.error("Failed to download");
    }
  };

  const tabConfig = {
    image: {
      icon: Image,
      label: "Image",
      placeholder: "Describe the image you want to create... (e.g., 'A serene mountain landscape at sunset with vibrant colors')",
      color: "text-primary"
    },
    video: {
      icon: Video,
      label: "Video",
      placeholder: "Describe the video scene... (e.g., 'Gentle waves crashing on a tropical beach, slow motion')",
      color: "text-info"
    },
    audio: {
      icon: Music,
      label: "Audio",
      placeholder: "Describe the audio or music... (e.g., 'Calm ambient music with soft piano and nature sounds')",
      color: "text-success"
    }
  };

  return (
    <AccessGate>
      <div className="min-h-screen bg-background">
        <Sidebar />
        
        <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
          {/* Header */}
          <header className="sticky top-0 lg:top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-primary/20 to-info/20 text-primary">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Creative Studio</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Generate images, videos, and audio with AI</p>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Generation Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass gradient-border rounded-2xl p-6"
              >
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GenerationType)}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    {(Object.keys(tabConfig) as GenerationType[]).map((type) => {
                      const config = tabConfig[type];
                      return (
                        <TabsTrigger
                          key={type}
                          value={type}
                          className="flex items-center gap-2 data-[state=active]:bg-primary/10"
                        >
                          <config.icon className={cn("w-4 h-4", activeTab === type && config.color)} />
                          {config.label}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {(Object.keys(tabConfig) as GenerationType[]).map((type) => {
                    const config = tabConfig[type];
                    return (
                      <TabsContent key={type} value={type} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Wand2 className="w-4 h-4 text-primary" />
                            Describe what you want to create
                          </label>
                          <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={config.placeholder}
                            rows={4}
                            className="resize-none"
                          />
                        </div>

                        <Button
                          onClick={handleGenerate}
                          disabled={isGenerating || !prompt.trim()}
                          className="w-full glow-primary-sm"
                          size="lg"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating {config.label}...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate {config.label}
                            </>
                          )}
                        </Button>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </motion.div>

              {/* Generated Content */}
              {generatedContent.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-primary" />
                    Recent Generations
                  </h2>

                  <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                      {generatedContent.map((content, index) => {
                        const config = tabConfig[content.type];
                        return (
                          <motion.div
                            key={`${content.createdAt.getTime()}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass rounded-xl p-4 border border-border"
                          >
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "p-2 rounded-lg",
                                content.type === "image" && "bg-primary/10",
                                content.type === "video" && "bg-info/10",
                                content.type === "audio" && "bg-success/10"
                              )}>
                                <config.icon className={cn("w-5 h-5", config.color)} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {content.prompt}
                                </p>

                                {content.type === "image" && (
                                  <img
                                    src={content.url}
                                    alt={content.prompt}
                                    className="w-full max-w-md rounded-lg border border-border"
                                  />
                                )}

                                {content.type === "video" && (
                                  <video
                                    src={content.url}
                                    controls
                                    className="w-full max-w-md rounded-lg border border-border"
                                  />
                                )}

                                {content.type === "audio" && (
                                  <audio
                                    src={content.url}
                                    controls
                                    className="w-full max-w-md"
                                  />
                                )}

                                <div className="flex items-center gap-2 mt-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload(content)}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                  <span className="text-xs text-muted-foreground">
                                    {content.createdAt.toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Empty State */}
              {generatedContent.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Start Creating
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Enter a prompt above to generate images, videos, or audio using AI
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AccessGate>
  );
}
