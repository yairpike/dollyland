import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Loader2 } from "lucide-react";

interface CreateAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated: () => void;
}

export const CreateAgentModal = ({ open, onOpenChange, onAgentCreated }: CreateAgentModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .insert({
          name: formData.name,
          description: formData.description,
          system_prompt: formData.systemPrompt,
          user_id: user.id
        });

      if (error) throw error;

      toast.success("Agent created successfully!");
      setFormData({ name: "", description: "", systemPrompt: "" });
      onOpenChange(false);
      onAgentCreated();
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast.error("Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Create New AI Agent
          </DialogTitle>
          <DialogDescription>
            Create a custom AI agent with your own personality and expertise.
          </DialogDescription>
        </DialogHeader>
        
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
              placeholder="You are an expert marketing professional with 10+ years of experience. You help with content strategy, social media campaigns, and brand messaging. Always provide actionable insights and specific recommendations..."
              value={formData.systemPrompt}
              onChange={(e) => handleChange("systemPrompt", e.target.value)}
              rows={6}
              required
            />
            <p className="text-sm text-muted-foreground">
              Define how your agent should behave, its expertise, and response style.
            </p>
          </div>

          <div className="flex justify-end gap-3">
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
                  Creating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Create Agent
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};