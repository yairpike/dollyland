import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
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
import { toast } from "sonner";
import { Trash2, Loader2, Settings, Database, Zap, Globe, GitBranch, Rocket, ExternalLink, Webhook, Workflow } from "lucide-react";

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

interface EditAgentModalProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentUpdated: () => void;
}

export const EditAgentModal = ({ agent, open, onOpenChange, onAgentUpdated }: EditAgentModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: agent?.name || "",
    description: agent?.description || "",
    systemPrompt: agent?.system_prompt || ""
  });

  // Update form data when agent prop changes
  if (agent && formData.name !== agent.name) {
    setFormData({
      name: agent.name,
      description: agent.description || "",
      systemPrompt: agent.system_prompt || ""
    });
  }

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
      onAgentUpdated();
      onOpenChange(false);
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
      onAgentUpdated();
      onOpenChange(false);
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

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Agent: {agent.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="settings" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-9 bg-white border">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Knowledge
            </TabsTrigger>
            <TabsTrigger value="ai-setup" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Setup
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="linear" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Linear
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="deploy" className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Deploy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4 flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter agent name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe what your agent does"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={formData.systemPrompt}
                  onChange={(e) => handleChange("systemPrompt", e.target.value)}
                  placeholder="Define your agent's role and behavior"
                  rows={6}
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Agent"
                  )}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={loading || deleteLoading}>
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
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4 flex-1 overflow-y-auto">
            <KnowledgeBaseManager agentId={agent.id} />
          </TabsContent>

          <TabsContent value="ai-setup" className="space-y-4 flex-1 overflow-y-auto">
            <AIProviderManager />
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 flex-1 overflow-y-auto">
            <AgentActions agentId={agent.id} />
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4 flex-1 overflow-y-auto">
            <WorkflowBuilder agentId={agent.id} />
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4 flex-1 overflow-y-auto">
            <WebhookManager agentId={agent.id} />
          </TabsContent>

          <TabsContent value="linear" className="space-y-4 flex-1 overflow-y-auto">
            <LinearIntegration agentId={agent.id} />
          </TabsContent>

          <TabsContent value="github" className="space-y-4 flex-1 overflow-y-auto">
            <GitHubIntegration agentId={agent.id} />
          </TabsContent>

          <TabsContent value="deploy" className="space-y-4 flex-1 overflow-y-auto">
            <VercelIntegration agentId={agent.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};