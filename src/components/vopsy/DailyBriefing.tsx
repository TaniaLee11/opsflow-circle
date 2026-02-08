import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Calendar, AlertCircle, TrendingUp, CheckCircle2, BookOpen } from "lucide-react";
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

  if (!briefingData) {
    return null;
  }

  const { briefing } = briefingData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <VOPSyMascot size="sm" />
          <div className="flex-1">
            <CardTitle>Daily Briefing</CardTitle>
            <CardDescription>
              Generated for {briefing.date}
            </CardDescription>
          </div>
          <Button onClick={generateBriefing} variant="ghost" size="sm">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Priority Tasks */}
        {briefing.priorities && briefing.priorities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="flex gap-3 p-3 rounded-lg bg-muted/50"
          >
            <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2">Priority Tasks</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {briefing.priorities.map((priority, index) => (
                  <li key={index}>• {priority}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Upcoming Deadlines */}
        {briefing.deadlines && briefing.deadlines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 p-3 rounded-lg bg-muted/50"
          >
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2">Upcoming Deadlines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {briefing.deadlines.map((deadline, index) => (
                  <li key={index}>• {deadline}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {briefing.recommendations && briefing.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 p-3 rounded-lg bg-muted/50"
          >
            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {briefing.recommendations.map((recommendation, index) => (
                  <li key={index}>• {recommendation}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Suggested Courses */}
        {briefing.courses_suggested && briefing.courses_suggested.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 p-3 rounded-lg bg-muted/50"
          >
            <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2">Recommended Courses</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {briefing.courses_suggested.map((course, index) => (
                  <li key={index}>• {course}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
