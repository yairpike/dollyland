import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, File, Trash2, Plus, Loader2, AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { KnowledgeBaseUpload } from "./KnowledgeBaseUpload";
import { ProcessingStatusCard } from "./ProcessingStatusCard";
import { DebugPanel } from "./DebugPanel";

interface KnowledgeBase {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  files: KnowledgeFile[];
}

interface KnowledgeFile {
  id: string;
  file_name: string;
  file_size: number;
  processing_status: string;
  created_at: string;
}

interface KnowledgeBaseManagerProps {
  agentId: string;
}

export const KnowledgeBaseManager = ({ agentId }: KnowledgeBaseManagerProps) => {
  const { user } = useAuth();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    if (user && agentId) {
      fetchKnowledgeBases();
    }
  }, [user, agentId]);

  // Set up real-time subscriptions for processing status updates
  useEffect(() => {
    if (!agentId || knowledgeBases.length === 0) return;

    const kbIds = knowledgeBases.map(kb => kb.id);
    const channel = supabase
      .channel('knowledge-files-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'knowledge_files',
        },
        (payload) => {
          // Knowledge file status updated
          // Refresh the knowledge bases to show updated status
          fetchKnowledgeBases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId, knowledgeBases.length]);

  // Add retry processing function
  const retryProcessing = async (fileId: string) => {
    try {
      const { error } = await supabase.functions.invoke('process-knowledge', {
        body: { fileId }
      });

      if (error) {
        toast.error("Failed to retry processing");
      } else {
        toast.success("Processing restarted");
        // Update the file status to pending
        await supabase
          .from('knowledge_files')
          .update({ processing_status: 'pending' })
          .eq('id', fileId);
        
        fetchKnowledgeBases();
      }
    } catch (error) {
      console.error('Error retrying processing:', error);
      toast.error("Failed to retry processing");
    }
  };

  const fetchKnowledgeBases = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_bases')
        .select(`
          id,
          name,
          description,
          created_at,
          knowledge_files!inner(
            id,
            file_name,
            file_size,
            processing_status,
            created_at
          )
        `)
        .eq('agent_id', agentId)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to group files under knowledge bases
      const transformedData: KnowledgeBase[] = [];
      const kbMap = new Map();

      data?.forEach((item: any) => {
        if (!kbMap.has(item.id)) {
          kbMap.set(item.id, {
            id: item.id,
            name: item.name,
            description: item.description,
            created_at: item.created_at,
            files: []
          });
          transformedData.push(kbMap.get(item.id));
        }
        
        // Add the file to the knowledge base
        if (item.knowledge_files) {
          kbMap.get(item.id).files.push(...(Array.isArray(item.knowledge_files) ? item.knowledge_files : [item.knowledge_files]));
        }
      });

      setKnowledgeBases(transformedData);
    } catch (error: any) {
      console.error('Error fetching knowledge bases:', error);
      toast.error("Failed to load knowledge bases");
    } finally {
      setLoading(false);
    }
  };

  const deleteKnowledgeBase = async (kbId: string) => {
    if (!confirm("Are you sure you want to delete this knowledge base? This action cannot be undone.")) {
      return;
    }

    setDeletingId(kbId);
    try {
      const { error } = await supabase
        .from('knowledge_bases')
        .delete()
        .eq('id', kbId)
        .eq('user_id', user!.id);

      if (error) throw error;

      toast.success("Knowledge base deleted successfully");
      fetchKnowledgeBases();
    } catch (error: any) {
      console.error('Error deleting knowledge base:', error);
      toast.error("Failed to delete knowledge base");
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'chunking':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />;
      case 'chunking':
        return <Loader2 className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Knowledge Bases
            </CardTitle>
            <CardDescription>
              Manage your agent's training data and expertise
            </CardDescription>
          </div>
          <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Knowledge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Knowledge Base</DialogTitle>
              </DialogHeader>
              <KnowledgeBaseUpload 
                agentId={agentId} 
                onKnowledgeAdded={() => {
                  setUploadModalOpen(false);
                  fetchKnowledgeBases();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

      {knowledgeBases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Knowledge Bases Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload documents to give your agent professional expertise and knowledge
            </p>
            <Button onClick={() => setUploadModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Knowledge Base
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {knowledgeBases.map((kb) => (
            <div key={kb.id} className="space-y-4">
              <ProcessingStatusCard knowledgeBaseId={kb.id} />
              <DebugPanel knowledgeBaseId={kb.id} />
              
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        {kb.name}
                      </CardTitle>
                      {kb.description && (
                        <CardDescription>{kb.description}</CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteKnowledgeBase(kb.id)}
                      disabled={deletingId === kb.id}
                    >
                      {deletingId === kb.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {kb.files.length} file{kb.files.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-muted-foreground">
                        Created {new Date(kb.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {kb.files.length > 0 && (
                      <div className="space-y-2">
                        {kb.files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                {getStatusIcon(file.processing_status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {file.file_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                                </p>
                                {file.processing_status === 'failed' && (
                                  <p className="text-xs text-destructive mt-1">
                                    Processing failed - click retry to try again
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="secondary" 
                                className={getStatusColor(file.processing_status)}
                              >
                                {file.processing_status}
                              </Badge>
                              {file.processing_status === 'failed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => retryProcessing(file.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
      </CardContent>
    </Card>
    </div>
  );
};