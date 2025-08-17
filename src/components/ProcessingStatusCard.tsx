import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useKnowledgeProcessing } from "@/hooks/useKnowledgeProcessing";
import { Loader2, Play, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface ProcessingStatusCardProps {
  knowledgeBaseId: string;
}

export const ProcessingStatusCard = ({ knowledgeBaseId }: ProcessingStatusCardProps) => {
  const { stats, isProcessing, startProcessing, retryFailed } = useKnowledgeProcessing(knowledgeBaseId);

  const completionPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  if (stats.total === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : stats.failed > 0 ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : (
            <CheckCircle className="h-5 w-5 text-primary" />
          )}
          Processing Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-muted-foreground">Total Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <div className="text-muted-foreground">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
            <div className="text-muted-foreground">Failed</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <div className="flex gap-2">
          {stats.pending > 0 && (
            <Button 
              onClick={startProcessing}
              disabled={isProcessing}
              size="sm"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Processing
            </Button>
          )}
          
          {stats.failed > 0 && (
            <Button 
              onClick={retryFailed}
              disabled={isProcessing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Failed
            </Button>
          )}
        </div>

        {isProcessing && (
          <div className="text-sm text-muted-foreground">
            Processing files in the background. This page will update automatically.
          </div>
        )}
      </CardContent>
    </Card>
  );
};