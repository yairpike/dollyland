import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Settings, Trash2, Key, Loader2, CheckCircle } from "lucide-react";

interface AIProvider {
  id: string;
  provider_name: string;
  model_name: string;
  display_name: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

const AI_PROVIDERS = {
  openai: {
    name: "OpenAI",
    models: [
      { id: "gpt-4o-mini", name: "GPT-4o Mini (Recommended)", cost: "Low" },
      { id: "gpt-4o", name: "GPT-4o", cost: "Medium" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", cost: "High" }
    ],
    endpoint: "https://api.openai.com/v1/chat/completions"
  },
  deepseek: {
    name: "DeepSeek",
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat (Free Tier)", cost: "Free" },
      { id: "deepseek-coder", name: "DeepSeek Coder", cost: "Free" }
    ],
    endpoint: "https://api.deepseek.com/chat/completions"
  },
  anthropic: {
    name: "Anthropic",
    models: [
      { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", cost: "Low" },
      { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet", cost: "Medium" },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", cost: "High" }
    ],
    endpoint: "https://api.anthropic.com/v1/messages"
  }
};

export const AIProviderManager = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    provider: "",
    model: "",
    apiKey: "",
    displayName: "",
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      fetchProviders();
    }
  }, [user]);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('user_ai_providers')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error: any) {
      console.error('Error fetching AI providers:', error);
      toast.error("Failed to load AI providers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.provider || !formData.model || !formData.apiKey) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // If this is set as default, unset other defaults first
      if (formData.isDefault) {
        await supabase
          .from('user_ai_providers')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      // Encrypt the API key
      const { data: encryptedKey, error: encryptError } = await supabase
        .rpc('encrypt_api_key', { 
          api_key: formData.apiKey,
          user_id: user.id 
        });

      if (encryptError) throw encryptError;

      const { error } = await supabase
        .from('user_ai_providers')
        .insert({
          user_id: user.id,
          provider_name: formData.provider,
          model_name: formData.model,
          api_key_encrypted: encryptedKey,
          display_name: formData.displayName || `${AI_PROVIDERS[formData.provider as keyof typeof AI_PROVIDERS]?.name} (${formData.model})`,
          is_default: formData.isDefault || providers.length === 0 // First provider becomes default
        });

      if (error) throw error;

      toast.success("AI provider added successfully!");
      setAddModalOpen(false);
      setFormData({ provider: "", model: "", apiKey: "", displayName: "", isDefault: false });
      fetchProviders();
    } catch (error: any) {
      console.error('Error adding AI provider:', error);
      toast.error("Failed to add AI provider");
    } finally {
      setLoading(false);
    }
  };

  const toggleDefault = async (providerId: string) => {
    try {
      // Unset all defaults first
      await supabase
        .from('user_ai_providers')
        .update({ is_default: false })
        .eq('user_id', user!.id);

      // Set the selected one as default
      const { error } = await supabase
        .from('user_ai_providers')
        .update({ is_default: true })
        .eq('id', providerId)
        .eq('user_id', user!.id);

      if (error) throw error;

      toast.success("Default AI provider updated");
      fetchProviders();
    } catch (error: any) {
      console.error('Error updating default provider:', error);
      toast.error("Failed to update default provider");
    }
  };

  const deleteProvider = async (providerId: string) => {
    if (!confirm("Are you sure you want to delete this AI provider?")) return;

    try {
      const { error } = await supabase
        .from('user_ai_providers')
        .delete()
        .eq('id', providerId)
        .eq('user_id', user!.id);

      if (error) throw error;

      toast.success("AI provider deleted");
      fetchProviders();
    } catch (error: any) {
      console.error('Error deleting provider:', error);
      toast.error("Failed to delete provider");
    }
  };

  const getCostBadgeColor = (cost: string) => {
    switch (cost) {
      case 'Free': return 'bg-green-100 text-green-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">AI Providers</h3>
          <p className="text-sm text-muted-foreground">
            Configure multiple AI providers and choose your preferred models
          </p>
        </div>
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add AI Provider</DialogTitle>
              <DialogDescription>
                Configure a new AI provider with your API key
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddProvider} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, provider: value, model: "" }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose AI provider" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                      <SelectItem key={key} value={key}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.provider && (
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={formData.model}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose model" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {AI_PROVIDERS[formData.provider as keyof typeof AI_PROVIDERS]?.models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{model.name}</span>
                            <Badge 
                              variant="secondary" 
                              className={`ml-2 ${getCostBadgeColor(model.cost)}`}
                            >
                              {model.cost}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  className="bg-white"
                  value={formData.apiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name (Optional)</Label>
                <Input
                  id="displayName"
                  placeholder="e.g., My Personal OpenAI"
                  className="bg-white"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="isDefault">Set as default provider</Label>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Add Provider
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {providers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No AI Providers Configured</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add an AI provider to start using your agents. Choose from free or paid options.
            </p>
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Provider
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {providers.map((provider) => {
            const providerInfo = AI_PROVIDERS[provider.provider_name as keyof typeof AI_PROVIDERS];
            const modelInfo = providerInfo?.models.find(m => m.id === provider.model_name);
            
            return (
              <Card key={provider.id} className={provider.is_default ? 'ring-2 ring-primary' : ''}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {providerInfo?.name || provider.provider_name}
                        {provider.is_default && (
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {provider.display_name || `${provider.model_name} model`}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {modelInfo && (
                        <Badge 
                          variant="secondary" 
                          className={getCostBadgeColor(modelInfo.cost)}
                        >
                          {modelInfo.cost}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProvider(provider.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                      Model: {provider.model_name}
                    </div>
                    {!provider.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDefault(provider.id)}
                        className="w-full sm:w-auto"
                      >
                        Set as Default
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};