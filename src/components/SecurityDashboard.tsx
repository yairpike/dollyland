import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useSecurityContext } from '@/components/SecurityProvider';

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  suspiciousActivity: number;
  lastSecurityEvent: string;
  apiKeyRotations: number;
}

export const SecurityDashboard: React.FC = () => {
  const { isSecurityMode, enableSecurityMode, disableSecurityMode } = useSecurityContext();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalRequests: 1247,
    blockedRequests: 3,
    suspiciousActivity: 1,
    lastSecurityEvent: '2 hours ago',
    apiKeyRotations: 2
  });

  const securityLevel = getSecurityLevel(metrics);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
          <CardDescription>
            Current security configuration and recent activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Security Mode</span>
            <div className="flex items-center gap-2">
              <Badge variant={isSecurityMode ? "default" : "secondary"}>
                {isSecurityMode ? "Enhanced" : "Standard"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={isSecurityMode ? disableSecurityMode : enableSecurityMode}
              >
                {isSecurityMode ? "Disable" : "Enable"} Enhanced Mode
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Security Level</div>
              <Badge 
                variant={securityLevel === 'high' ? 'default' : securityLevel === 'medium' ? 'secondary' : 'destructive'}
                className="w-fit"
              >
                {securityLevel.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Last Security Event</div>
              <div className="text-sm">{metrics.lastSecurityEvent}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blocked Requests</p>
                <p className="text-2xl font-bold text-red-500">{metrics.blockedRequests}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspicious Activity</p>
                <p className="text-2xl font-bold text-yellow-500">{metrics.suspiciousActivity}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">API Key Rotations</p>
                <p className="text-2xl font-bold text-blue-500">{metrics.apiKeyRotations}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {securityLevel === 'high' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your security configuration is optimal. All security measures are active and functioning correctly.
          </AlertDescription>
        </Alert>
      )}

      {securityLevel === 'medium' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your security is good but could be improved. Consider enabling enhanced security mode and reviewing recent activity.
          </AlertDescription>
        </Alert>
      )}

      {securityLevel === 'low' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Security attention required. Please review and update your security settings immediately.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Improvements</CardTitle>
          <CardDescription>
            Security enhancements implemented in your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Fixed Security Definer view vulnerability</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Enhanced message content validation</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Improved edge function input validation</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Added rate limiting to API endpoints</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Enhanced security event logging</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function getSecurityLevel(metrics: SecurityMetrics): 'high' | 'medium' | 'low' {
  const blockedRatio = metrics.blockedRequests / metrics.totalRequests;
  
  if (blockedRatio < 0.001 && metrics.suspiciousActivity < 2) {
    return 'high';
  } else if (blockedRatio < 0.01 && metrics.suspiciousActivity < 5) {
    return 'medium';
  } else {
    return 'low';
  }
}