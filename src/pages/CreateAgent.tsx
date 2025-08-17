import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AgentTemplates } from "@/components/AgentTemplates";
import { toast } from "sonner";
import { Sparkles, Loader2, ArrowLeft, ChevronLeft } from "lucide-react";

export const CreateAgent = () => {
  const navigate = useNavigate();
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
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast.error("Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'customize') {
      setStep('template');
      setSelectedTemplate(null);
    } else {
      navigate('/dashboard');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 'template' ? 'Back to Dashboard' : 'Back to Templates'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {step === 'template' ? 'Create New AI Agent' : `Customize ${selectedTemplate?.name}`}
            </CardTitle>
            <CardDescription>
              {step === 'template' 
                ? 'Choose a template to get started with proven agent capabilities'
                : 'Customize your agent with specific knowledge and behavior'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
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

                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateAgent;