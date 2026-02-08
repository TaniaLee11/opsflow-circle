import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Calendar, AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VOPSyMascot } from "@/components/brand/VOPSyMascot";

interface BriefingSection {
  icon: "calendar" | "alert" | "trending" | "check";
  title: string;
  content: string;
}

interface Briefing {
  greeting: string;
  sections: BriefingSection[];
  generated_at: Date;
}

const ICON_MAP = {
  calendar: Calendar,
  alert: AlertCircle,
  trending: TrendingUp,
  check: CheckCircle2,
};

export function DailyBriefing() {
  const { user, selectedTier } = useAuth();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only show briefing for operations, advisory, enterprise, cohort, owner tiers
  const showBriefing = ["operations", "advisory", "enterprise", "cohort", "owner"].includes(selectedTier || "");

  useEffect(() => {
    if (!showBriefing) {
      setIsLoading(false);
      return;
    }

    generateBriefing();
  }, [showBriefing, selectedTier]);

  const generateBriefing = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("vopsy-chat", {
        body: {
          messages: [{
            role: "user",
            content: "Generate my daily briefing",
          }],
          user_tier: selectedTier || "free",
          user_id: user?.id,
          briefing_mode: true,
        },
      });

      if (error) throw error;

      // Parse the briefing response
      const briefingData = parseBriefingResponse(data?.reply || "");
      setBriefing(briefingData);
    } catch (err) {
      console.error("Briefing error:", err);
      setError("Unable to generate briefing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const parseBriefingResponse = (response: string): Briefing => {
    // Simple parser - in production, this would be more sophisticated
    // or the API would return structured JSON
    const lines = response.split("\n").filter(l => l.trim());
    const greeting = lines[0] || "Good morning!";
    
    const sections: BriefingSection[] = [];
    let currentSection: BriefingSection | null = null;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith("📅") || line.toLowerCase().includes("today") || line.toLowerCase().includes("deadline")) {
        if (currentSection) sections.push(currentSection);
        currentSection = { icon: "calendar", title: "Today's Focus", content: line.replace("📅", "").trim() };
      } else if (line.startsWith("⚠️") || line.toLowerCase().includes("urgent") || line.toLowerCase().includes("attention")) {
        if (currentSection) sections.push(currentSection);
        currentSection = { icon: "alert", title: "Needs Attention", content: line.replace("⚠️", "").trim() };
      } else if (line.startsWith("📈") || line.toLowerCase().includes("recommend") || line.toLowerCase().includes("opportunity")) {
        if (currentSection) sections.push(currentSection);
        currentSection = { icon: "trending", title: "Recommendations", content: line.replace("📈", "").trim() };
      } else if (line.startsWith("✅") || line.toLowerCase().includes("completed") || line.toLowerCase().includes("done")) {
        if (currentSection) sections.push(currentSection);
        currentSection = { icon: "check", title: "Recent Wins", content: line.replace("✅", "").trim() };
      } else if (currentSection) {
        currentSection.content += "\n" + line;
      }
    }

    if (currentSection) sections.push(currentSection);

    return {
      greeting,
      sections,
      generated_at: new Date(),
    };
  };

  if (!showBriefing) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <VOPSyMascot size="sm" />
            <CardTitle>Daily Briefing</CardTitle>
          </div>
          <CardDescription>Preparing your daily operations overview...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <VOPSyMascot size="sm" />
            <CardTitle>Daily Briefing</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={generateBriefing} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!briefing) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <VOPSyMascot size="sm" />
          <div className="flex-1">
            <CardTitle>Daily Briefing</CardTitle>
            <CardDescription>
              Generated {briefing.generated_at.toLocaleTimeString()}
            </CardDescription>
          </div>
          <Button onClick={generateBriefing} variant="ghost" size="sm">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base font-medium">{briefing.greeting}</p>
        
        {briefing.sections.map((section, index) => {
          const Icon = ICON_MAP[section.icon];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-3 p-3 rounded-lg bg-muted/50"
            >
              <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{section.title}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
