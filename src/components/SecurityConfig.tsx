import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityMetrics {
  apiKeyRotationDue: number;
  failedAuthAttempts: number;
  suspiciousActivity: number;
  rateLimitHits: number;
}

interface SecurityConfigProps {
  metrics: SecurityMetrics;
  onRotateApiKey?: (providerId: string) => void;
  onViewAuditLogs?: () => void;
}

export const SecurityConfig: React.FC<SecurityConfigProps> = ({
  metrics,
  onRotateApiKey,
  onViewAuditLogs
}) => {
  const getSecurityLevel = (): 'high' | 'medium' | 'low' => {
    const issues = [
      metrics.apiKeyRotationDue > 0,
      metrics.failedAuthAttempts > 10,
      metrics.suspiciousActivity > 5
    ].filter(Boolean).length;

    if (issues === 0) return 'high';
    if (issues === 1) return 'medium';
    return 'low';
  };

  const securityLevel = getSecurityLevel();
  const hasIssues = securityLevel !== 'high';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Status
          </CardTitle>
          <Badge 
            variant={securityLevel === 'high' ? 'default' : securityLevel === 'medium' ? 'secondary' : 'destructive'}
          >
            {securityLevel.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasIssues && (
          <Alert variant={securityLevel === 'low' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Security issues detected. Review the metrics below and take action.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Keys Due for Rotation</span>
              <Badge variant={metrics.apiKeyRotationDue > 0 ? 'destructive' : 'secondary'}>
                {metrics.apiKeyRotationDue}
              </Badge>
            </div>
            {metrics.apiKeyRotationDue > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRotateApiKey?.('all')}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Rotate Keys
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Failed Auth Attempts</span>
              <Badge variant={metrics.failedAuthAttempts > 10 ? 'destructive' : 'secondary'}>
                {metrics.failedAuthAttempts}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Suspicious Activity</span>
              <Badge variant={metrics.suspiciousActivity > 5 ? 'destructive' : 'secondary'}>
                {metrics.suspiciousActivity}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rate Limit Hits</span>
              <Badge variant={metrics.rateLimitHits > 50 ? 'destructive' : 'secondary'}>
                {metrics.rateLimitHits}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAuditLogs}
            className="flex-1"
          >
            View Audit Logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Security scan initiated')}
            className="flex-1"
          >
            Run Security Scan
          </Button>
        </div>

        {securityLevel === 'high' && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            All security checks passed
          </div>
        )}
      </CardContent>
    </Card>
  );
};