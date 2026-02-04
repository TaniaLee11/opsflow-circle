import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useVOPSyRecommendations, IntegrationRecommendation } from '@/hooks/useVOPSyRecommendations';
import { useNavigate } from 'react-router-dom';

interface VOPSyRecommendationsProps {
  connectedIntegrations?: string[];
  onConnect?: (integrationId: string) => void;
  compact?: boolean;
}

export function VOPSyRecommendations({ 
  connectedIntegrations = [],
  onConnect,
  compact = false
}: VOPSyRecommendationsProps) {
  const recommendations = useVOPSyRecommendations(connectedIntegrations);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const navigate = useNavigate();

  const visibleRecommendations = recommendations
    .filter(rec => !dismissed.includes(rec.integrationId))
    .slice(0, compact ? 1 : 3);

  if (visibleRecommendations.length === 0) {
    return null;
  }

  const handleDismiss = (integrationId: string) => {
    setDismissed(prev => [...prev, integrationId]);
  };

  const handleConnect = (integrationId: string) => {
    if (onConnect) {
      onConnect(integrationId);
    } else {
      // Navigate to integrations page with the integration highlighted
      navigate(`/integrations?highlight=${integrationId}`);
    }
  };

  const getPriorityColor = (priority: IntegrationRecommendation['priority']) => {
    switch (priority) {
      case 'high': return 'from-primary/10 to-primary/5 border-primary/30';
      case 'medium': return 'from-info/10 to-info/5 border-info/30';
      case 'low': return 'from-muted/10 to-muted/5 border-muted/30';
    }
  };

  const getPriorityBadge = (priority: IntegrationRecommendation['priority']) => {
    switch (priority) {
      case 'high': return <Badge variant="default" className="bg-primary/20 text-primary border-0">Recommended</Badge>;
      case 'medium': return <Badge variant="secondary">Suggested</Badge>;
      case 'low': return null;
    }
  };

  if (compact) {
    const rec = visibleRecommendations[0];
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="relative"
      >
        <Card className={`bg-gradient-to-br ${getPriorityColor(rec.priority)} border`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground">VOPSy suggests:</p>
                  {getPriorityBadge(rec.priority)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                <Button 
                  size="sm" 
                  onClick={() => handleConnect(rec.integrationId)}
                  className="h-7 text-xs"
                >
                  Connect Now
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => handleDismiss(rec.integrationId)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">VOPSy Recommends</h3>
      </div>

      <div className="grid gap-4">
        {visibleRecommendations.map((rec, index) => (
          <motion.div
            key={rec.integrationId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-gradient-to-br ${getPriorityColor(rec.priority)} border relative`}>
              <CardContent className="p-5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => handleDismiss(rec.integrationId)}
                >
                  <X className="w-3 h-3" />
                </Button>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityBadge(rec.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.context}</p>
                    <p className="font-medium text-foreground mb-3">{rec.reason}</p>
                    <Button 
                      onClick={() => handleConnect(rec.integrationId)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Connect Integration
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {recommendations.length > visibleRecommendations.length && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/integrations')}
        >
          View All Integration Recommendations
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
