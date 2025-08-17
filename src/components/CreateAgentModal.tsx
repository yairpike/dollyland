import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AgentTemplates } from "@/components/AgentTemplates";
import { toast } from "sonner";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";

interface CreateAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated: () => void;
}

export const CreateAgentModal = ({ open, onOpenChange, onAgentCreated }: CreateAgentModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'template' | 'customize'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    category: "",
    tags: [] as string[]
  });

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      systemPrompt: template.systemPrompt,
      category: template.category,
      tags: template.skills
    });
    setStep('customize');
  };

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
          user_id: user.id,
          category: formData.category || null,
          tags: formData.tags.length > 0 ? formData.tags : null,
          template_id: selectedTemplate?.id || null,
        });

      if (error) throw error;

      toast.success("Agent created successfully!");
      setFormData({ name: "", description: "", systemPrompt: "", category: "", tags: [] });
      setStep('template');
      setSelectedTemplate(null);
      onOpenChange(false);
      onAgentCreated();
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast.error("Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('template');
    setSelectedTemplate(null);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {step === 'template' ? 'Create New AI Agent' : `Customize ${selectedTemplate?.name}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'template' 
              ? 'Choose a template to get started with proven agent capabilities'
              : 'Customize your agent with specific knowledge and behavior'
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 'template' ? (
          <AgentTemplates onSelectTemplate={handleTemplateSelect} />
        ) : (
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
                placeholder="Define your agent's role, expertise, and behavior..."
                value={formData.systemPrompt}
                onChange={(e) => handleChange("systemPrompt", e.target.value)}
                rows={8}
                required
              />
              <p className="text-sm text-muted-foreground">
                This prompt defines how your agent will behave and respond to users.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
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
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Agent
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};