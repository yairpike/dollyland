import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, Trash2, Edit, Brain } from "lucide-react";
import { KnowledgeBaseManager } from "./KnowledgeBaseManager";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string | null;
}

interface EditAgentModalProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentUpdated: () => void;
}

export const EditAgentModal = ({ agent, open, onOpenChange, onAgentUpdated }: EditAgentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: ""
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        description: agent.description || "",
        systemPrompt: agent.system_prompt || ""
      });
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          name: formData.name,
          description: formData.description,
          system_prompt: formData.systemPrompt,
        })
        .eq('id', agent.id);

      if (error) throw error;

      toast.success("Agent updated successfully!");
      onAgentUpdated();
    } catch (error: any) {
      console.error('Error updating agent:', error);
      toast.error("Failed to update agent");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!agent) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agent.id);

      if (error) throw error;

      toast.success("Agent deleted successfully!");
      setDeleteDialogOpen(false);
      onOpenChange(false);
      onAgentUpdated();
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      toast.error("Failed to delete agent");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!agent) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Edit Agent: {agent.name}
            </DialogTitle>
            <DialogDescription>
              Customize your agent's behavior and upload knowledge to make it an expert
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Agent Settings</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Marketing Expert, Code Reviewer"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this agent specializes in..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">System Prompt *</Label>
                  <Textarea
                    id="systemPrompt"
                    placeholder="You are an expert professional with extensive experience. You help with specific tasks and provide actionable insights..."
                    value={formData.systemPrompt}
                    onChange={(e) => handleChange("systemPrompt", e.target.value)}
                    rows={8}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Define how your agent should behave, its expertise, and response style.
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Agent
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading || !formData.name || !formData.systemPrompt}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Update Agent
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="knowledge" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Train Your Agent</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload your professional documents, case studies, and expertise to create a truly personalized AI clone that can reference your actual work.
                </p>
              </div>
              <KnowledgeBaseManager agentId={agent.id} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{agent.name}"? This will permanently delete the agent, all its conversations, and all uploaded knowledge bases. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
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
    </>
  );
};