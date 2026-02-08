import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Calendar, AlertCircle, TrendingUp, CheckCircle2, BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VOPSyMascot } from "@/components/brand/VOPSyMascot";

interface BriefingData {
  reply: string;
  briefing: {
    date: string;
    priorities: string[];
    deadlines: string[];
    recommendations: string[];
    courses_suggested: string[];
  };
}

export function DailyBriefing() {
  const { user, selectedTier } = useAuth();
  const [briefingData, setBriefingData] = useState<BriefingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only show briefing for operations, advisory, enterprise, cohort, owner tiers
  const showBriefing = ["operations", "advisory", "enterprise", "cohort", "owner"].includes(selectedTier || "");

  useEffect(() => {
    if (!showBriefing) {
      setIsLoading(false);
      return;
    }

    // Automatically generate briefing on mount (proactive)
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

      if (!data || !data.briefing) {
        throw new Error("Invalid briefing response");
      }

      setBriefingData(data);
    } catch (err) {
      console.error("Briefing error:", err);
      setError("Unable to generate briefing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!showBriefing) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-3">
            <VOPSyMascot size="md" />
            <div>
              <CardTitle className="text-xl">VOPSy's Daily Directive</CardTitle>
              <CardDescription>Analyzing your operations and priorities...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <VOPSyMascot size="md" />
            <div>
              <CardTitle className="text-xl">VOPSy's Daily Directive</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={generateBriefing} variant="outline">
            Regenerate Briefing
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!briefingData) {
    return null;
  }

  const { briefing } = briefingData;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VOPSyMascot size="md" />
            <div>
              <CardTitle className="text-xl">VOPSy's Daily Directive</CardTitle>
              <CardDescription>
                Your operations priorities for {new Date(briefing.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </CardDescription>
            </div>
          </div>
          <Button onClick={generateBriefing} variant="ghost" size="sm">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Priority Actions - Most Important */}
        {briefing.priorities && briefing.priorities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="flex gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20"
          >
            <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-base mb-2 text-primary">Here's what you need to do today:</h4>
              <ul className="text-sm space-y-2">
                {briefing.priorities.map((priority, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="font-semibold text-primary">{index + 1}.</span>
                    <span className="font-medium">{priority}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Urgent Deadlines */}
        {briefing.deadlines && briefing.deadlines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
          >
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-base mb-2 text-destructive">Don't miss these deadlines:</h4>
              <ul className="text-sm space-y-1">
                {briefing.deadlines.map((deadline, index) => (
                  <li key={index} className="font-medium">• {deadline}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Strategic Recommendations */}
        {briefing.recommendations && briefing.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 p-4 rounded-lg bg-muted/50 border border-border"
          >
            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-base mb-2">Strategic moves to consider:</h4>
              <ul className="text-sm space-y-1">
                {briefing.recommendations.map((recommendation, index) => (
                  <li key={index}>• {recommendation}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Learning Opportunities */}
        {briefing.courses_suggested && briefing.courses_suggested.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 p-4 rounded-lg bg-muted/50 border border-border"
          >
            <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-base mb-2">Strengthen your skills:</h4>
              <ul className="text-sm space-y-1">
                {briefing.courses_suggested.map((course, index) => (
                  <li key={index}>• {course}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Footer message */}
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground italic">
            I'm monitoring your operations. I'll alert you if anything urgent comes up.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
