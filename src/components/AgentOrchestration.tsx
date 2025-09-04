import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Network, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  ArrowRight, 
  Users, 
  Brain,
  Zap,
  GitBranch,
  Activity,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Workflow
} from "lucide-react";

interface AgentOrchestration {
  id: string;
  name: string;
  description: string;
  orchestration_type: 'sequential' | 'parallel' | 'conditional' | 'swarm';
  agents: OrchestrationAgent[];
  conditions: OrchestrationCondition[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface OrchestrationAgent {
  id: string;
  agent_id: string;
  agent_name: string;
  role: string;
  priority: number;
  handoff_conditions: string[];
  max_iterations: number;
}

interface OrchestrationCondition {
  id: string;
  type: 'success' | 'failure' | 'timeout' | 'custom';
  condition: string;
  next_agent_id?: string;
  action: 'continue' | 'retry' | 'escalate' | 'terminate';
}

interface AgentOrchestrationProps {
  agentId?: string;
}

const ORCHESTRATION_TYPES = [
  {
    id: 'sequential',
    name: 'Sequential Workflow',
    description: 'Agents work one after another in order',
    icon: ArrowRight,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'parallel',
    name: 'Parallel Processing',
    description: 'Multiple agents work simultaneously',
    icon: Users,
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'conditional',
    name: 'Conditional Handoff',
    description: 'Agents hand off based on conditions',
    icon: GitBranch,
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'swarm',
    name: 'Agent Swarm',
    description: 'Intelligent swarm collaboration',
    icon: Network,
    color: 'bg-orange-100 text-orange-700'
  }
];

export const AgentOrchestration = ({ agentId }: AgentOrchestrationProps) => {
  const { user } = useAuth();
  const [orchestrations, setOrchestrations] = useState<AgentOrchestration[]>([]);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    orchestration_type: 'sequential' as const,
    agents: [] as OrchestrationAgent[],
    conditions: [] as OrchestrationCondition[]
  });

  useEffect(() => {
    fetchOrchestrations();
    fetchAvailableAgents();
  }, [user]);

  const fetchOrchestrations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // For demo purposes, create mock orchestrations
      const mockOrchestrations: AgentOrchestration[] = [
        {
          id: '1',
          name: 'Customer Support Pipeline',
          description: 'Multi-stage customer support with escalation',
          orchestration_type: 'conditional',
          agents: [
            {
              id: '1',
              agent_id: 'agent-1',
              agent_name: 'Initial Support Agent',
              role: 'first_contact',
              priority: 1,
              handoff_conditions: ['complexity_high', 'sentiment_negative'],
              max_iterations: 3
            },
            {
              id: '2',
              agent_id: 'agent-2',
              agent_name: 'Technical Specialist',
              role: 'technical_expert',
              priority: 2,
              handoff_conditions: ['technical_issue'],
              max_iterations: 5
            }
          ],
          conditions: [
            {
              id: '1',
              type: 'custom',
              condition: 'user_satisfaction < 0.7',
              next_agent_id: 'agent-2',
              action: 'escalate'
            }
          ],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user.id
        }
      ];
      setOrchestrations(mockOrchestrations);
    } catch (error) {
      console.error('Error fetching orchestrations:', error);
      toast.error('Failed to load orchestrations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAgents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, description, category')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const createOrchestration = async () => {
    if (!user || !formData.name.trim()) return;

    setLoading(true);
    try {
      // For demo purposes, just add to local state
      const newOrchestration: AgentOrchestration = {
        id: Date.now().toString(),
        ...formData,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id
      };

      setOrchestrations(prev => [newOrchestration, ...prev]);
      toast.success('Orchestration created successfully!');
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        description: '',
        orchestration_type: 'sequential',
        agents: [],
        conditions: []
      });
    } catch (error) {
      console.error('Error creating orchestration:', error);
      toast.error('Failed to create orchestration');
    } finally {
      setLoading(false);
    }
  };

  const startOrchestration = async (orchestrationId: string) => {
    try {
      // In production, this would call an edge function to start the orchestration
      setOrchestrations(prev => prev.map(o => 
        o.id === orchestrationId ? { ...o, status: 'active' as const } : o
      ));
      toast.success('Orchestration started!');
    } catch (error) {
      console.error('Error starting orchestration:', error);
      toast.error('Failed to start orchestration');
    }
  };

  const pauseOrchestration = async (orchestrationId: string) => {
    try {
      setOrchestrations(prev => prev.map(o => 
        o.id === orchestrationId ? { ...o, status: 'paused' as const } : o
      ));
      toast.success('Orchestration paused');
    } catch (error) {
      console.error('Error pausing orchestration:', error);
      toast.error('Failed to pause orchestration');
    }
  };

  const addAgentToOrchestration = () => {
    const newAgent: OrchestrationAgent = {
      id: Date.now().toString(),
      agent_id: '',
      agent_name: '',
      role: '',
      priority: formData.agents.length + 1,
      handoff_conditions: [],
      max_iterations: 3
    };
    setFormData(prev => ({
      ...prev,
      agents: [...prev.agents, newAgent]
    }));
  };

  const removeAgentFromOrchestration = (agentId: string) => {
    setFormData(prev => ({
      ...prev,
      agents: prev.agents.filter(a => a.id !== agentId)
    }));
  };

  const updateOrchestrationAgent = (agentId: string, updates: Partial<OrchestrationAgent>) => {
    setFormData(prev => ({
      ...prev,
      agents: prev.agents.map(a => a.id === agentId ? { ...a, ...updates } : a)
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4 text-green-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'draft': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeConfig = (type: string) => {
    return ORCHESTRATION_TYPES.find(t => t.id === type) || ORCHESTRATION_TYPES[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agent Orchestration</h3>
          <p className="text-sm text-muted-foreground">
            Create multi-agent workflows and collaborative systems
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Orchestration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Agent Orchestration</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Orchestration Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Customer Support Pipeline"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this orchestration does..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Orchestration Type */}
              <div className="space-y-3">
                <Label>Orchestration Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {ORCHESTRATION_TYPES.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={formData.orchestration_type === type.id ? "default" : "outline"}
                        className="flex flex-col h-auto p-4 text-left"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          orchestration_type: type.id as any 
                        }))}
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

              {/* Agents Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Agents in Orchestration</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addAgentToOrchestration}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Agent
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.agents.map((agent, index) => (
                    <Card key={agent.id} className="p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Agent</Label>
                          <Select
                            value={agent.agent_id}
                            onValueChange={(value) => {
                              const selectedAgent = availableAgents.find(a => a.id === value);
                              updateOrchestrationAgent(agent.id, {
                                agent_id: value,
                                agent_name: selectedAgent?.name || ''
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select agent" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableAgents.map((a) => (
                                <SelectItem key={a.id} value={a.id}>
                                  {a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Input
                            value={agent.role}
                            onChange={(e) => updateOrchestrationAgent(agent.id, { role: e.target.value })}
                            placeholder="e.g., specialist, coordinator"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Max Iterations</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={agent.max_iterations}
                              onChange={(e) => updateOrchestrationAgent(agent.id, { 
                                max_iterations: parseInt(e.target.value) || 1 
                              })}
                              min="1"
                              max="10"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAgentFromOrchestration(agent.id)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createOrchestration}
                  disabled={loading || !formData.name.trim() || formData.agents.length === 0}
                >
                  Create Orchestration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Orchestrations List */}
      <div className="space-y-4">
        {orchestrations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Workflow className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orchestrations yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Create your first agent orchestration to enable multi-agent collaboration
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Orchestration
              </Button>
            </CardContent>
          </Card>
        ) : (
          orchestrations.map((orchestration) => {
            const typeConfig = getTypeConfig(orchestration.orchestration_type);
            const IconComponent = typeConfig.icon;
            
            return (
              <Card key={orchestration.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{orchestration.name}</CardTitle>
                        <CardDescription>{orchestration.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(orchestration.status)}
                        <Badge variant="outline" className="capitalize">
                          {orchestration.status}
                        </Badge>
                      </div>
                      <Badge variant="secondary">
                        {orchestration.agents.length} agents
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        Type: <span className="font-medium">{typeConfig.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(orchestration.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {orchestration.status === 'draft' || orchestration.status === 'paused' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startOrchestration(orchestration.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => pauseOrchestration(orchestration.id)}
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};