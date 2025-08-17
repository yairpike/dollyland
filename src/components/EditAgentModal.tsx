import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeBaseManager } from "@/components/KnowledgeBaseManager";
import { AIProviderManager } from "@/components/AIProviderManager";
import { PublishAgentModal } from "@/components/PublishAgentModal";
import { GitHubIntegration } from "@/components/GitHubIntegration";
import { toast } from "sonner";
import { Trash2, Loader2, Settings, Database, Zap, Globe, GitBranch } from "lucide-react";

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
  const [publishModalOpen, setPublishModalOpen] = useState(false);
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent: {agent.name}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
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
              <TabsTrigger value="github" className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Marketplace
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4">
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

            <TabsContent value="knowledge" className="space-y-4">
              <KnowledgeBaseManager agentId={agent.id} />
            </TabsContent>

            <TabsContent value="ai-setup" className="space-y-4">
              <AIProviderManager />
            </TabsContent>

            <TabsContent value="github" className="space-y-4">
              <GitHubIntegration agentId={agent.id} />
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-4">
              <div className="space-y-4">
                {/* Marketplace Status */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Marketplace Status</h3>
                    <Badge variant={agent.is_public ? "default" : "secondary"}>
                      {agent.is_public ? "Published" : "Private"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {agent.is_public 
                      ? "Your agent is live in the marketplace and available for others to discover and use."
                      : "Your agent is private and only accessible to you."
                    }
                  </p>
                  
                  {agent.is_public && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-background rounded-lg">
                        <div className="font-semibold text-lg">{agent.user_count || 0}</div>
                        <div className="text-xs text-muted-foreground">Total Users</div>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <div className="font-semibold text-lg flex items-center justify-center gap-1">
                          {agent.rating || 0}
                          <span className="text-yellow-500">★</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => setPublishModalOpen(true)}
                    className="w-full"
                    variant={agent.is_public ? "outline" : "default"}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {agent.is_public ? "Manage Marketplace Settings" : "Publish to Marketplace"}
                  </Button>
                </div>

                {/* Categories & Tags */}
                {agent.is_public && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm text-muted-foreground">
                        {agent.category || "No category set"}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {agent.tags && agent.tags.length > 0 ? (
                          agent.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No tags set</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Publish Modal */}
      <PublishAgentModal
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        agent={agent}
        onAgentUpdated={onAgentUpdated}
      />
    </>
  );
};