import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  calculateFinancialHealthMetrics, 
  getFinancialHealthScore,
  type FinancialData,
  type FinancialHealthMetric
} from "@/lib/industryMetrics";

interface FinancialHealthDashboardProps {
  financialData: FinancialData;
  industry?: string;
}

export function FinancialHealthDashboard({ financialData, industry }: FinancialHealthDashboardProps) {
  const metrics = calculateFinancialHealthMetrics(financialData, industry);
  const healthScore = getFinancialHealthScore(metrics);

  const getStatusColor = (status: FinancialHealthMetric['status']) => {
    switch (status) {
      case 'excellent':
        return 'text-success bg-success/10 border-success/20';
      case 'good':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'warning':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'critical':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      default:
        return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getStatusIcon = (status: FinancialHealthMetric['status']) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-success';
      case 'B':
        return 'text-primary';
      case 'C':
        return 'text-warning';
      case 'D':
      case 'F':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass gradient-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Financial Health Score
                </CardTitle>
                <CardDescription>
                  {industry ? `Benchmarked for ${industry} industry` : 'Overall business health'}
                </CardDescription>
              </div>
              <div className="text-center">
                <div className={cn("text-5xl font-bold", getGradeColor(healthScore.grade))}>
                  {healthScore.grade}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {healthScore.score}/100
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{healthScore.summary}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 2) }}
          >
            <Card className={cn(
              "glass border-2 transition-all hover:scale-105",
              getStatusColor(metric.status)
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      {metric.label}
                      {getStatusIcon(metric.status)}
                    </CardTitle>
                    {metric.benchmark && (
                      <CardDescription className="text-xs mt-1">
                        Target: {metric.benchmark}
                      </CardDescription>
                    )}
                  </div>
                  {metric.trend && (
                    <div className={cn(
                      "p-1 rounded",
                      metric.trend === 'up' ? 'text-success' : metric.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : null}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold">
                  {metric.value}
                </div>
                <div className="flex items-start gap-2">
                  <Info className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {metric.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Industry Context */}
      {industry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass gradient-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Industry Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                These metrics are tailored for <strong>{industry}</strong> businesses. 
                Benchmarks reflect typical performance standards in your industry to help you 
                understand where you stand relative to peers.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
