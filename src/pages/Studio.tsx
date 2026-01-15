import { useState, useRef } from "react";
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
  RefreshCw,
  Maximize,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

type GenerationType = "image" | "video" | "audio";

interface GeneratedContent {
  type: GenerationType;
  url: string;
  prompt: string;
  createdAt: Date;
  isBeta?: boolean;
}

// Custom video player component
function VideoPlayer({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlaybackRate = (rate: string) => {
    const rateNum = parseFloat(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rateNum;
      setPlaybackRate(rateNum);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className={cn("relative group", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        className="w-full rounded-lg border border-border"
        onLoadedData={() => setIsLoading(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>

          <Select value={playbackRate.toString()} onValueChange={handlePlaybackRate}>
            <SelectTrigger className="w-16 h-7 text-xs bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="1.5">1.5x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Studio() {
  const [activeTab, setActiveTab] = useState<GenerationType>("image");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [videoProgress, setVideoProgress] = useState<string | null>(null);

  // Poll for video generation status
  const pollVideoStatus = async (predictionId: string, originalPrompt: string) => {
    const maxAttempts = 60; // 5 minutes max (5s intervals)
    let attempts = 0;

    const poll = async (): Promise<void> => {
      attempts++;
      setVideoProgress(`Generating video... (${Math.min(attempts * 5, 100)}%)`);

      try {
        const { data, error } = await supabase.functions.invoke("studio-generate", {
          body: { predictionId }
        });

        if (error) {
          throw new Error(error.message);
        }

        console.log("Poll response:", data);

        if (data.status === "succeeded" && data.output) {
          // Video is ready
          const videoUrl = typeof data.output === 'string' ? data.output : data.output[0];
          setGeneratedContent(prev => [{
            type: "video",
            url: videoUrl,
            prompt: originalPrompt,
            createdAt: new Date(),
            isBeta: false
          }, ...prev]);
          toast.success("Video generated successfully!");
          setIsGenerating(false);
          setVideoProgress(null);
          return;
        }

        if (data.status === "failed") {
          throw new Error(data.error || "Video generation failed");
        }

        if (data.status === "canceled") {
          throw new Error("Video generation was canceled");
        }

        // Still processing - continue polling
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          throw new Error("Video generation timed out. Please try again.");
        }
      } catch (err: any) {
        console.error("Polling error:", err);
        toast.error(err.message || "Failed to check video status");
        setIsGenerating(false);
        setVideoProgress(null);
      }
    };

    await poll();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setVideoProgress(null);

    try {
      const { data, error } = await supabase.functions.invoke("studio-generate", {
        body: { 
          type: activeTab, 
          prompt: prompt.trim() 
        }
      });

      if (error) {
        if (error.message?.includes("429") || error.message?.includes("rate")) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message?.includes("402")) {
          toast.error("Usage limit reached. Please add credits to continue.");
        } else {
          throw error;
        }
        setIsGenerating(false);
        return;
      }

      // Handle video polling
      if (data?.polling && data?.predictionId) {
        toast.info("Video generation started! This may take 1-3 minutes...");
        setPrompt("");
        pollVideoStatus(data.predictionId, prompt.trim());
        return;
      }

      if (data?.url) {
        const isBeta = activeTab === "audio"; // Only audio is beta now
        setGeneratedContent(prev => [{
          type: activeTab,
          url: data.url,
          prompt: prompt.trim(),
          createdAt: new Date(),
          isBeta
        }, ...prev]);
        
        if (isBeta) {
          toast.info(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} generation is in beta - showing sample content`);
        } else {
          toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} generated successfully!`);
        }
        setPrompt("");
        setIsGenerating(false);
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate content. Please try again.");
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

  const tabConfig: Record<GenerationType, {
    icon: typeof Image;
    label: string;
    placeholder: string;
    color: string;
    available: boolean;
    betaMessage?: string;
  }> = {
    image: {
      icon: Image,
      label: "Image",
      placeholder: "Describe the image you want to create... (e.g., 'A serene mountain landscape at sunset with vibrant colors')",
      color: "text-primary",
      available: true
    },
    video: {
      icon: Video,
      label: "Video",
      placeholder: "Describe the video scene... (e.g., 'Gentle waves crashing on a tropical beach, slow motion')",
      color: "text-info",
      available: true
    },
    audio: {
      icon: Music,
      label: "Audio",
      placeholder: "Describe the audio or music... (e.g., 'Calm ambient music with soft piano and nature sounds')",
      color: "text-success",
      available: false,
      betaMessage: "Audio generation is coming soon. Currently showing sample content."
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
                        {/* Beta warning for video/audio */}
                        {!config.available && config.betaMessage && (
                          <Alert className="border-warning/50 bg-warning/10">
                            <AlertCircle className="h-4 w-4 text-warning" />
                            <AlertDescription className="text-sm">
                              {config.betaMessage}
                            </AlertDescription>
                          </Alert>
                        )}

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

                        {/* Video progress indicator */}
                        {videoProgress && activeTab === "video" && (
                          <div className="p-4 rounded-lg bg-info/10 border border-info/30">
                            <div className="flex items-center gap-3">
                              <Loader2 className="w-5 h-5 animate-spin text-info" />
                              <div>
                                <p className="text-sm font-medium text-foreground">{videoProgress}</p>
                                <p className="text-xs text-muted-foreground">Video generation typically takes 1-3 minutes</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleGenerate}
                          disabled={isGenerating || !prompt.trim()}
                          className="w-full glow-primary-sm"
                          size="lg"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {videoProgress ? "Processing..." : `Generating ${config.label}...`}
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate {config.label}
                              {!config.available && <span className="ml-1 text-xs opacity-70">(Beta)</span>}
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
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                                    {content.prompt}
                                  </p>
                                  {content.isBeta && (
                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-warning/20 text-warning-foreground">
                                      Beta
                                    </span>
                                  )}
                                </div>

                                {content.type === "image" && (
                                  <img
                                    src={content.url}
                                    alt={content.prompt}
                                    className="w-full max-w-md rounded-lg border border-border"
                                  />
                                )}

                                {content.type === "video" && (
                                  <VideoPlayer 
                                    src={content.url} 
                                    className="max-w-md"
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
