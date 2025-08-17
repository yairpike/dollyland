import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

interface DebugPanelProps {
  knowledgeBaseId?: string;
}

export const DebugPanel = ({ knowledgeBaseId }: DebugPanelProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runDebugChecks = async () => {
    if (!knowledgeBaseId) return;
    
    setIsChecking(true);
    setResults(null);
    
    try {
      console.log('Running debug checks for knowledge base:', knowledgeBaseId);
      
      // Test the process-knowledge function
      const { data, error } = await supabase.functions.invoke('process-knowledge', {
        body: { 
          knowledgeBaseId,
          batchProcess: true 
        }
      });

      const debugResults = {
        timestamp: new Date().toISOString(),
        knowledgeBaseId,
        response: data,
        error: error,
        success: !error
      };

      console.log('Debug results:', debugResults);
      setResults(debugResults);

      if (error) {
        toast({
          title: "Debug Check Failed",
          description: `Error: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Debug Check Complete",
          description: "Check console for detailed results",
        });
      }
    } catch (error: any) {
      console.error('Debug check error:', error);
      const debugResults = {
        timestamp: new Date().toISOString(),
        knowledgeBaseId,
        response: null,
        error: { message: error.message, stack: error.stack },
        success: false
      };
      setResults(debugResults);
      
      toast({
        title: "Debug Check Failed",
        description: `Network error: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={runDebugChecks}
            disabled={isChecking || !knowledgeBaseId}
            size="sm"
            variant="outline"
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            Run Debug Check
          </Button>
          
          {!knowledgeBaseId && (
            <Badge variant="destructive">No Knowledge Base ID</Badge>
          )}
        </div>

        {results && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {results.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {results.success ? 'Success' : 'Failed'}
              </span>
              <Badge variant="outline">{results.timestamp}</Badge>
            </div>

            {results.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm font-medium text-red-800 mb-1">Error Details:</div>
                <div className="text-sm text-red-700 font-mono">
                  {typeof results.error === 'string' ? results.error : results.error.message}
                </div>
              </div>
            )}

            {results.response && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm font-medium text-green-800 mb-1">Response:</div>
                <pre className="text-xs text-green-700 overflow-auto">
                  {JSON.stringify(results.response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Common Issues:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>FIRECRAWL_API_KEY not set in Supabase secrets</li>
            <li>OpenAI API quota exceeded (check your billing)</li>
            <li>Network connectivity issues</li>
            <li>Database permissions or missing tables</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};