import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Plus, 
  Users, 
  Play, 
  Pause, 
  Settings, 
  ArrowRight, 
  GitBranch, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Brain,
  Zap
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
}

interface AgentWorkflow {
  id: string;
  name: string;
  description: string;
  agents: string[];
  workflow_config: any;
  is_active: boolean;
  created_at: string;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: string;
  current_step: string | number;
  results: any;
  started_at: string;
  completed_at?: string;
}

interface AgentCollaborationProps {
  agentId: string;
}

export const AgentCollaboration = ({ agentId }: AgentCollaborationProps) => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<AgentWorkflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedAgents: [] as string[],
    workflowType: 'sequential',
    conditions: [] as any[]
  });

  useEffect(() => {
    fetchUserAgents();
    fetchWorkflows();
    fetchExecutions();
  }, [agentId]);

  const fetchUserAgents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, description, system_prompt')
        .eq('user_id', user.id);

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchWorkflows = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const workflowsData = data?.map(w => ({
        ...w,
        agents: [w.agent_id], // Convert single agent_id to array format
        workflow_config: w.steps || {}
      })) || [];
      setWorkflows(workflowsData);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutions = async () => {
    if (!workflows.length) return;
    
    try {
      const workflowIds = workflows.map(w => w.id);
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .in('workflow_id', workflowIds)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      const executionsData = data?.map(e => ({
        ...e,
        started_at: e.created_at,
        results: e.context || {},
        current_step: parseInt(String(e.current_step || 0))
      })) || [];
      setExecutions(executionsData);
    } catch (error) {
      console.error('Error fetching executions:', error);
    }
  };

  const createWorkflow = async () => {
    if (!user || !formData.name || formData.selectedAgents.length < 2) return;

    setLoading(true);
    try {
      const workflowConfig = {
        type: formData.workflowType,
        steps: formData.selectedAgents.map((agentId, index) => ({
          agent_id: agentId,
          order: index,
          conditions: formData.conditions[index] || {}
        })),
        settings: {
          timeout: 300000,
          retry_attempts: 3,
          parallel_execution: formData.workflowType === 'parallel'
        }
      };

      const { error } = await supabase
        .from('workflows')
        .insert({
          name: formData.name,
          description: formData.description,
          agent_id: formData.selectedAgents[0], // Primary agent
          steps: workflowConfig.steps,
          triggers: [],
          is_active: true,
          user_id: user.id
        });

      if (error) throw error;

      toast.success('Workflow created successfully!');
      setIsDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        selectedAgents: [],
        workflowType: 'sequential',
        conditions: []
      });
      fetchWorkflows();
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('workflow-engine', {
        body: {
          action: 'execute',
          workflow_id: workflowId,
          input: {
            user_message: "Execute workflow",
            context: {}
          }
        }
      });

      if (error) throw error;

      toast.success('Workflow execution started!');
      fetchExecutions();
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
    }
  };

  const pauseWorkflow = async (executionId: string) => {
    try {
      const { error } = await supabase
        .from('workflow_executions')
        .update({ status: 'paused' })
        .eq('id', executionId);

      if (error) throw error;

      toast.success('Workflow paused');
      fetchExecutions();
    } catch (error) {
      console.error('Error pausing workflow:', error);
      toast.error('Failed to pause workflow');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agent Collaboration</h3>
          <p className="text-sm text-muted-foreground">
            Create workflows where multiple agents work together
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Agent Workflow</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workflow-name">Workflow Name</Label>
                  <Input
                    id="workflow-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Content Creation Pipeline"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workflow-type">Execution Type</Label>
                  <Select
                    value={formData.workflowType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, workflowType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential (One after another)</SelectItem>
                      <SelectItem value="parallel">Parallel (All at once)</SelectItem>
                      <SelectItem value="conditional">Conditional (Based on results)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this workflow accomplishes..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Select Agents (minimum 2)</Label>
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {agents.map((agent) => (
                    <Card
                      key={agent.id}
                      className={`cursor-pointer transition-all ${
                        formData.selectedAgents.includes(agent.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        const isSelected = formData.selectedAgents.includes(agent.id);
                        if (isSelected) {
                          setFormData(prev => ({
                            ...prev,
                            selectedAgents: prev.selectedAgents.filter(id => id !== agent.id)
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            selectedAgents: [...prev.selectedAgents, agent.id]
                          }));
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Brain className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{agent.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {agent.description}
                            </p>
                          </div>
                          {formData.selectedAgents.includes(agent.id) && (
                            <Badge variant="default">Selected</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createWorkflow}
                  disabled={loading || !formData.name || formData.selectedAgents.length < 2}
                >
                  Create Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {workflows.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No workflows created</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Create workflows to enable multiple agents to collaborate on complex tasks
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                        <CardDescription>{workflow.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={workflow.is_active ? "default" : "secondary"}>
                          {workflow.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => executeWorkflow(workflow.id)}
                          disabled={!workflow.is_active}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Execute
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Users className="w-4 h-4" />
                      {workflow.agents.length} agents •
                      <GitBranch className="w-4 h-4" />
                      {workflow.workflow_config?.type || 'sequential'} execution
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {workflow.agents.map((agentId, index) => {
                        const agent = agents.find(a => a.id === agentId);
                        return (
                          <div key={agentId} className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Brain className="w-3 h-3" />
                              {agent?.name || 'Unknown Agent'}
                            </Badge>
                            {index < workflow.agents.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {executions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No executions yet</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Workflow executions will appear here when you run workflows
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => {
                const workflow = workflows.find(w => w.id === execution.workflow_id);
                return (
                  <Card key={execution.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(execution.status)}
                          <div>
                            <h4 className="font-medium">{workflow?.name || 'Unknown Workflow'}</h4>
                            <p className="text-sm text-muted-foreground">
                              Started {new Date(execution.started_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(execution.status)}>
                            {execution.status}
                          </Badge>
                          {execution.status === 'running' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => pauseWorkflow(execution.id)}
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total Workflows</p>
                    <p className="text-2xl font-bold">{workflows.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Executions</p>
                    <p className="text-2xl font-bold">{executions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {executions.length > 0
                        ? Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};