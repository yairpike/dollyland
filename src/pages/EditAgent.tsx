import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeBaseManager } from "@/components/KnowledgeBaseManager";
import { AIProviderManager } from "@/components/AIProviderManager";
import { PublishAgentModal } from "@/components/PublishAgentModal";
import { GitHubIntegration } from "@/components/GitHubIntegration";
import { VercelIntegration } from "@/components/VercelIntegration";
import { LinearIntegration } from "@/components/LinearIntegration";
import { AgentActions } from "@/components/AgentActions";
import { WebhookManager } from "@/components/WebhookManager";
import { WorkflowBuilder } from "@/components/WorkflowBuilder";
import { DollyCopilot } from "@/components/DollyCopilot";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Loader2, Settings, Database, Zap, Globe, GitBranch, Rocket, ExternalLink, Webhook, Workflow } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string | null;
  is_public: boolean;
  category: string | null;
  tags: string[] | null;
  user_count: number;
  rating: number;
}

export const EditAgent = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: ""
  });

  useEffect(() => {
    console.log('EditAgent useEffect triggered - agentId:', agentId, 'user:', user);
    if (agentId && user) {
      fetchAgent();
    }
  }, [agentId, user]);

  const fetchAgent = async () => {
    console.log('fetchAgent called - agentId:', agentId, 'user:', user);
    if (!agentId || !user) {
      console.log('fetchAgent early return - missing agentId or user');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setAgent(data);
      setFormData({
        name: data.name,
        description: data.description || "",
        systemPrompt: data.system_prompt || ""
      });
    } catch (error: any) {
      console.error('Error fetching agent:', error);
      console.log('Full error details:', { error, agentId, userId: user?.id });
      toast.error("Failed to load agent");
      navigate('/dashboard');
    } finally {
      console.log('fetchAgent completed, setting loading to false');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !agent) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          name: formData.name,
          description: formData.description,
          system_prompt: formData.systemPrompt,
        })
        .eq('id', agent.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Agent updated successfully!");
      fetchAgent();
    } catch (error: any) {
      console.error('Error updating agent:', error);
      toast.error("Failed to update agent");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !agent) return;

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agent.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Agent deleted successfully!");
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      toast.error("Failed to delete agent");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  console.log('Render check - agent:', agent, 'loading:', loading, 'user:', user);
  
  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-background backdrop-blur-sm sticky top-0 z-10 -mx-4 lg:-mx-8 px-4 lg:px-8">
        <div className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold break-words">Edit Agent: {agent.name}</h1>
                <p className="text-muted-foreground text-sm">Configure your AI agent</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={agent.is_public ? 'default' : 'secondary'}>
                {agent.is_public ? 'Public' : 'Private'}
              </Badge>
              <Badge variant="outline">
                {agent.user_count} users
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="flex w-full bg-card border p-1 h-12 items-center overflow-x-auto scrollbar-hide gap-1">
            <TabsTrigger value="settings" className="flex items-center gap-2 whitespace-nowrap" data-tour="edit-agent-settings">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2 whitespace-nowrap" data-tour="edit-agent-knowledge">
              <Database className="w-4 h-4" />
              Knowledge
            </TabsTrigger>
            <TabsTrigger value="ai-setup" className="flex items-center gap-2 whitespace-nowrap" data-tour="edit-agent-ai-setup">
              <Zap className="w-4 h-4" />
              AI Setup
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2 whitespace-nowrap" data-tour="edit-agent-actions">
              <Zap className="w-4 h-4" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2 whitespace-nowrap" data-tour="edit-agent-workflows">
              <Workflow className="w-4 h-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2 whitespace-nowrap" data-tour="edit-agent-webhooks">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="linear" className="flex items-center gap-2 whitespace-nowrap" data-tour="edit-agent-linear">
              <ExternalLink className="w-4 h-4" />
              Linear
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center gap-2 whitespace-nowrap" data-tour="edit-agent-github">
              <GitBranch className="w-4 h-4" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="deploy" className="flex items-center gap-2 whitespace-nowrap" data-tour="edit-agent-deploy">
              <Rocket className="w-4 h-4" />
              Deploy
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Configuration</CardTitle>
                  <CardDescription>
                    Update your agent's basic settings and behavior
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Agent Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter agent name"
                        className="bg-input"
                        required
                        data-tour="agent-name-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Describe what your agent does"
                        className="bg-input"
                        rows={3}
                        data-tour="agent-description-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="systemPrompt">System Prompt</Label>
                      <Textarea
                        id="systemPrompt"
                        value={formData.systemPrompt}
                        onChange={(e) => handleChange("systemPrompt", e.target.value)}
                        placeholder="Define your agent's role and behavior"
                        className="bg-input"
                        rows={6}
                        data-tour="agent-system-prompt-input"
                      />
                    </div>
                    
                    <div className={`flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1"
                        data-tour="save-agent-button"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {isMobile ? 'Updating...' : 'Updating...'}
                          </>
                        ) : (
                          "Update Agent"
                        )}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" disabled={loading || deleteLoading} className={isMobile ? 'w-full' : ''}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{agent.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              disabled={deleteLoading}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {deleteLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete Agent"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4">
              <KnowledgeBaseManager agentId={agent.id} />
            </TabsContent>

            <TabsContent value="ai-setup" className="space-y-4">
              <AIProviderManager />
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <AgentActions agentId={agent.id} />
            </TabsContent>

            <TabsContent value="workflows" className="space-y-4">
              <WorkflowBuilder agentId={agent.id} />
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <WebhookManager agentId={agent.id} />
            </TabsContent>

            <TabsContent value="linear" className="space-y-4">
              <LinearIntegration agentId={agent.id} />
            </TabsContent>

            <TabsContent value="github" className="space-y-4">
              <GitHubIntegration agentId={agent.id} />
            </TabsContent>

            <TabsContent value="deploy" className="space-y-4">
              <VercelIntegration agentId={agent.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dollyland.AI Copilot */}
      <DollyCopilot context="edit-agent" />
    </DashboardLayout>
  );
};