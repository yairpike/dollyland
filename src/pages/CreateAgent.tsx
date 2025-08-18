import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AgentTemplates } from "@/components/AgentTemplates";
import { toast } from "sonner";
import { Sparkles, Loader2, ArrowLeft, ChevronLeft, Briefcase, Code, Palette, BarChart, MessageSquare, FileText, Brain, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CreateAgentTour } from "@/components/tours/CreateAgentTour";
import { useTourManager } from "@/components/OnboardingTour";

const AGENT_CATEGORIES = [
  { id: 'business', name: 'Business', icon: Briefcase },
  { id: 'development', name: 'Development', icon: Code },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'analytics', name: 'Analytics', icon: BarChart },
  { id: 'communication', name: 'Communication', icon: MessageSquare },
  { id: 'content', name: 'Content', icon: FileText },
  { id: 'ai', name: 'AI & ML', icon: Brain },
  { id: 'productivity', name: 'Productivity', icon: Zap }
];

export const CreateAgent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shouldShowTour, markTourAsCompleted } = useTourManager();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'template' | 'customize'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showCreateTour, setShowCreateTour] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    category: "",
    tags: [] as string[]
  });

  useEffect(() => {
    if (shouldShowTour('create-agent')) {
      setShowCreateTour(true);
    }
  }, [shouldShowTour]);

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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        <Card data-tour="create-agent-card">
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
              <div data-tour="agent-templates">
                <AgentTemplates onSelectTemplate={handleTemplateSelect} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" data-tour="customize-form">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name *</Label>
                  <Input
                    id="name"
                    data-tour="agent-name-input"
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
                    data-tour="agent-description-input"
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
                    data-tour="agent-system-prompt-input"
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

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category for your agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_CATEGORIES.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              {category.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose a category to help users discover your agent in the marketplace.
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
                  <Button type="submit" disabled={loading || !formData.name || !formData.systemPrompt} data-tour="create-agent-submit">
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

        {/* Create Agent Tour */}
        <CreateAgentTour 
          isOpen={showCreateTour}
          onClose={() => {
            setShowCreateTour(false);
            markTourAsCompleted('create-agent');
          }}
          currentStep={step}
          onTemplateSelected={() => {
            setShowCreateTour(false);
            markTourAsCompleted('create-agent');
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default CreateAgent;