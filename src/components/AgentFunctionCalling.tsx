import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus, Trash2, Code, Globe, Calculator, FileText, Search, Mail } from "lucide-react";

interface AgentFunction {
  id: string;
  name: string;
  description: string;
  function_type: string;
  config: any;
  is_enabled: boolean;
}

const FUNCTION_TYPES = [
  { 
    id: 'web_scraping',
    name: 'Web Scraping',
    icon: Globe,
    description: 'Extract data from websites',
    configFields: [
      { key: 'url', label: 'Default URL', type: 'url' },
      { key: 'selector', label: 'CSS Selector', type: 'text' },
      { key: 'wait_time', label: 'Wait Time (ms)', type: 'number' }
    ]
  },
  {
    id: 'api_call',
    name: 'API Call',
    icon: Code,
    description: 'Make HTTP requests to external APIs',
    configFields: [
      { key: 'base_url', label: 'Base URL', type: 'url' },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea' },
      { key: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] }
    ]
  },
  {
    id: 'calculation',
    name: 'Calculations',
    icon: Calculator,
    description: 'Perform mathematical calculations',
    configFields: [
      { key: 'precision', label: 'Decimal Precision', type: 'number' },
      { key: 'allow_complex', label: 'Allow Complex Numbers', type: 'boolean' }
    ]
  },
  {
    id: 'file_processing',
    name: 'File Processing',
    icon: FileText,
    description: 'Process and analyze files',
    configFields: [
      { key: 'max_size_mb', label: 'Max File Size (MB)', type: 'number' },
      { key: 'allowed_types', label: 'Allowed File Types', type: 'text' }
    ]
  },
  {
    id: 'search',
    name: 'Web Search',
    icon: Search,
    description: 'Search the web for information',
    configFields: [
      { key: 'max_results', label: 'Max Results', type: 'number' },
      { key: 'safe_search', label: 'Safe Search', type: 'boolean' }
    ]
  },
  {
    id: 'email',
    name: 'Email Sending',
    icon: Mail,
    description: 'Send emails via agent',
    configFields: [
      { key: 'smtp_host', label: 'SMTP Host', type: 'text' },
      { key: 'smtp_port', label: 'SMTP Port', type: 'number' },
      { key: 'from_email', label: 'From Email', type: 'email' }
    ]
  }
];

interface AgentFunctionCallingProps {
  agentId: string;
}

export const AgentFunctionCalling = ({ agentId }: AgentFunctionCallingProps) => {
  const { user } = useAuth();
  const [functions, setFunctions] = useState<AgentFunction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    config: {}
  });

  useEffect(() => {
    fetchFunctions();
  }, [agentId]);

  const fetchFunctions = async () => {
    if (!agentId) return;
    
    setLoading(true);
    try {
      // Use agent_action_executions table which exists
      const { data, error } = await supabase
        .from('agent_action_executions')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Map the data to match our interface
      const functionsData = data?.map(item => ({
        id: item.id,
        name: item.action_type,
        description: `Action execution: ${item.action_type}`,
        function_type: item.action_type,
        config: item.parameters || {},
        is_enabled: item.status !== 'failed'
      })) || [];
      setFunctions(functionsData);
    } catch (error) {
      console.error('Error fetching functions:', error);
      toast.error('Failed to load agent functions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunction = async () => {
    if (!user || !selectedType) return;

    setLoading(true);
    try {
      // Use agent_action_executions for demo purposes
      const { error } = await supabase
        .from('agent_action_executions')
        .insert({
          agent_id: agentId,
          user_id: user.id,
          action_type: selectedType,
          parameters: {
            name: formData.name,
            description: formData.description,
            config: formData.config
          },
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Function added successfully!');
      setIsDialogOpen(false);
      setFormData({ name: '', description: '', config: {} });
      setSelectedType('');
      fetchFunctions();
    } catch (error) {
      console.error('Error adding function:', error);
      toast.error('Failed to add function');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFunction = async (functionId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('agent_action_executions')
        .update({ status: enabled ? 'pending' : 'failed' })
        .eq('id', functionId);

      if (error) throw error;
      
      setFunctions(prev => prev.map(fn => 
        fn.id === functionId ? { ...fn, is_enabled: enabled } : fn
      ));
      
      toast.success(enabled ? 'Function enabled' : 'Function disabled');
    } catch (error) {
      console.error('Error toggling function:', error);
      toast.error('Failed to update function');
    }
  };

  const handleDeleteFunction = async (functionId: string) => {
    try {
      const { error } = await supabase
        .from('agent_action_executions')
        .delete()
        .eq('id', functionId);

      if (error) throw error;
      
      setFunctions(prev => prev.filter(fn => fn.id !== functionId));
      toast.success('Function deleted');
    } catch (error) {
      console.error('Error deleting function:', error);
      toast.error('Failed to delete function');
    }
  };

  const getFunctionTypeIcon = (type: string) => {
    const functionType = FUNCTION_TYPES.find(ft => ft.id === type);
    return functionType?.icon || Code;
  };

  const selectedFunctionType = FUNCTION_TYPES.find(ft => ft.id === selectedType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Function Calling</h3>
          <p className="text-sm text-muted-foreground">
            Enable your agent to perform actions and call external services
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Function
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Agent Function</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Function Type Selection */}
              <div className="space-y-2">
                <Label>Function Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {FUNCTION_TYPES.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={selectedType === type.id ? "default" : "outline"}
                        className="flex flex-col h-auto p-4 text-left"
                        onClick={() => setSelectedType(type.id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="w-4 h-4" />
                          <span className="font-medium">{type.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {selectedType && (
                <>
                  {/* Basic Function Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Function Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Fetch product data"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this function does..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Dynamic Configuration Fields */}
                  {selectedFunctionType && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Configuration</h4>
                      {selectedFunctionType.configFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={field.key}>{field.label}</Label>
                          {field.type === 'text' || field.type === 'url' || field.type === 'email' ? (
                            <Input
                              id={field.key}
                              type={field.type}
                              value={formData.config[field.key] || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                config: { ...prev.config, [field.key]: e.target.value }
                              }))}
                            />
                          ) : field.type === 'number' ? (
                            <Input
                              id={field.key}
                              type="number"
                              value={formData.config[field.key] || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                config: { ...prev.config, [field.key]: parseInt(e.target.value) }
                              }))}
                            />
                          ) : field.type === 'textarea' ? (
                            <Textarea
                              id={field.key}
                              value={formData.config[field.key] || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                config: { ...prev.config, [field.key]: e.target.value }
                              }))}
                              rows={3}
                            />
                          ) : field.type === 'select' ? (
                            <Select
                              value={formData.config[field.key] || ''}
                              onValueChange={(value) => setFormData(prev => ({
                                ...prev,
                                config: { ...prev.config, [field.key]: value }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === 'boolean' ? (
                            <Switch
                              checked={formData.config[field.key] || false}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                config: { ...prev.config, [field.key]: checked }
                              }))}
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddFunction}
                      disabled={loading || !formData.name || !selectedType}
                    >
                      Add Function
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Functions List */}
      <div className="space-y-4">
        {functions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Code className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No functions configured</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Add functions to enable your agent to perform actions and call external services
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Function
              </Button>
            </CardContent>
          </Card>
        ) : (
          functions.map((fn) => {
            const IconComponent = getFunctionTypeIcon(fn.function_type);
            return (
              <Card key={fn.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{fn.name}</CardTitle>
                        <CardDescription>{fn.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {FUNCTION_TYPES.find(ft => ft.id === fn.function_type)?.name}
                      </Badge>
                      <Switch
                        checked={fn.is_enabled}
                        onCheckedChange={(enabled) => handleToggleFunction(fn.id, enabled)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFunction(fn.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};