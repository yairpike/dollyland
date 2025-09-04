import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Settings,
  GitBranch,
  ArrowRight,
  ArrowDown,
  Clock,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  Activity,
  Users,
  Brain,
  Network,
  Timer,
  AlertTriangle,
  Layers
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'agent' | 'condition' | 'action' | 'trigger' | 'delay' | 'parallel' | 'loop';
  name: string;
  description?: string;
  config: any;
  position: { x: number; y: number };
  connections: string[];
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
}

interface AdvancedWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  execution_mode: 'sequential' | 'parallel' | 'hybrid';
  status: 'draft' | 'active' | 'paused' | 'archived';
  version: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  execution_stats: {
    total_runs: number;
    success_rate: number;
    avg_duration_ms: number;
    last_run_at?: string;
  };
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  current_node_id?: string;
  execution_data: any;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  error_message?: string;
}

const NODE_TYPES = [
  {
    type: 'agent',
    name: 'AI Agent',
    icon: Brain,
    description: 'Execute an AI agent task',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    type: 'condition',
    name: 'Condition',
    icon: GitBranch,
    description: 'Branch workflow based on conditions',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    type: 'action',
    name: 'Action',
    icon: Zap,
    description: 'Perform a system action',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    type: 'trigger',
    name: 'Trigger',
    icon: Target,
    description: 'Start workflow on events',
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  {
    type: 'delay',
    name: 'Delay',
    icon: Clock,
    description: 'Wait for specified time',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  {
    type: 'parallel',
    name: 'Parallel',
    icon: Layers,
    description: 'Execute multiple paths simultaneously',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  },
  {
    type: 'loop',
    name: 'Loop',
    icon: RotateCcw,
    description: 'Repeat steps with conditions',
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  }
];

interface AdvancedWorkflowBuilderProps {
  agentId: string;
}

export const AdvancedWorkflowBuilder = ({ agentId }: AdvancedWorkflowBuilderProps) => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<AdvancedWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AdvancedWorkflow | null>(null);
  const [activeExecutions, setActiveExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('workflows');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    execution_mode: 'sequential' as const
  });

  useEffect(() => {
    fetchWorkflows();
    fetchActiveExecutions();
  }, [user]);

  const fetchWorkflows = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Generate mock advanced workflows
      const mockWorkflows: AdvancedWorkflow[] = [
        {
          id: '1',
          name: 'Customer Onboarding Pipeline',
          description: 'Complete customer onboarding with multiple agent handoffs and conditional logic',
          nodes: [
            {
              id: 'trigger-1',
              type: 'trigger',
              name: 'New Customer Signup',
              config: { event: 'user.signup', conditions: [] },
              position: { x: 100, y: 100 },
              connections: ['agent-1'],
              status: 'completed'
            },
            {
              id: 'agent-1',
              type: 'agent',
              name: 'Welcome Agent',
              config: { agent_id: 'welcome-agent', max_retries: 3 },
              position: { x: 300, y: 100 },
              connections: ['condition-1'],
              status: 'completed'
            },
            {
              id: 'condition-1',
              type: 'condition',
              name: 'Check User Type',
              config: { 
                expression: 'user.type === "enterprise"',
                true_path: ['agent-2'],
                false_path: ['agent-3']
              },
              position: { x: 500, y: 100 },
              connections: ['agent-2', 'agent-3'],
              status: 'completed'
            },
            {
              id: 'agent-2',
              type: 'agent',
              name: 'Enterprise Onboarding',
              config: { agent_id: 'enterprise-agent' },
              position: { x: 700, y: 50 },
              connections: ['action-1'],
              status: 'running'
            },
            {
              id: 'agent-3',
              type: 'agent',
              name: 'Standard Onboarding',
              config: { agent_id: 'standard-agent' },
              position: { x: 700, y: 150 },
              connections: ['action-1'],
              status: 'pending'
            },
            {
              id: 'action-1',
              type: 'action',
              name: 'Send Welcome Email',
              config: { action_type: 'send_email', template: 'welcome' },
              position: { x: 900, y: 100 },
              connections: [],
              status: 'pending'
            }
          ],
          execution_mode: 'hybrid',
          status: 'active',
          version: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user.id,
          execution_stats: {
            total_runs: 247,
            success_rate: 94.3,
            avg_duration_ms: 45000,
            last_run_at: new Date().toISOString()
          }
        },
        {
          id: '2',
          name: 'Content Approval Workflow',
          description: 'Multi-stage content review with parallel processing and approval chains',
          nodes: [
            {
              id: 'trigger-2',
              type: 'trigger',
              name: 'Content Submitted',
              config: { event: 'content.submitted' },
              position: { x: 100, y: 200 },
              connections: ['parallel-1'],
              status: 'completed'
            },
            {
              id: 'parallel-1',
              type: 'parallel',
              name: 'Parallel Review',
              config: { 
                branches: ['agent-4', 'agent-5'],
                wait_for: 'all'
              },
              position: { x: 300, y: 200 },
              connections: ['agent-4', 'agent-5'],
              status: 'completed'
            },
            {
              id: 'agent-4',
              type: 'agent',
              name: 'Technical Reviewer',
              config: { agent_id: 'tech-reviewer' },
              position: { x: 500, y: 150 },
              connections: ['condition-2'],
              status: 'completed'
            },
            {
              id: 'agent-5',
              type: 'agent',
              name: 'Content Reviewer',
              config: { agent_id: 'content-reviewer' },
              position: { x: 500, y: 250 },
              connections: ['condition-2'],
              status: 'completed'
            },
            {
              id: 'condition-2',
              type: 'condition',
              name: 'All Approved?',
              config: {
                expression: 'tech_approved && content_approved',
                true_path: ['action-2'],
                false_path: ['agent-6']
              },
              position: { x: 700, y: 200 },
              connections: ['action-2', 'agent-6'],
              status: 'pending'
            },
            {
              id: 'action-2',
              type: 'action',
              name: 'Publish Content',
              config: { action_type: 'publish' },
              position: { x: 900, y: 150 },
              connections: [],
              status: 'pending'
            },
            {
              id: 'agent-6',
              type: 'agent',
              name: 'Revision Agent',
              config: { agent_id: 'revision-agent' },
              position: { x: 900, y: 250 },
              connections: [],
              status: 'pending'
            }
          ],
          execution_mode: 'hybrid',
          status: 'active',
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user.id,
          execution_stats: {
            total_runs: 89,
            success_rate: 87.6,
            avg_duration_ms: 120000,
            last_run_at: new Date(Date.now() - 3600000).toISOString()
          }
        }
      ];

      setWorkflows(mockWorkflows);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveExecutions = async () => {
    if (!user) return;
    
    try {
      // Generate mock active executions
      const mockExecutions: WorkflowExecution[] = [
        {
          id: 'exec-1',
          workflow_id: '1',
          status: 'running',
          current_node_id: 'agent-2',
          execution_data: { user_id: 'user-123', user_type: 'enterprise' },
          started_at: new Date(Date.now() - 30000).toISOString(),
          duration_ms: 30000
        },
        {
          id: 'exec-2',
          workflow_id: '2',
          status: 'running',
          current_node_id: 'condition-2',
          execution_data: { content_id: 'content-456' },
          started_at: new Date(Date.now() - 120000).toISOString(),
          duration_ms: 120000
        }
      ];

      setActiveExecutions(mockExecutions);
    } catch (error) {
      console.error('Error fetching active executions:', error);
    }
  };

  const createWorkflow = async () => {
    if (!user || !formData.name.trim()) return;

    setLoading(true);
    try {
      const newWorkflow: AdvancedWorkflow = {
        id: Date.now().toString(),
        ...formData,
        nodes: [],
        status: 'draft',
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
        execution_stats: {
          total_runs: 0,
          success_rate: 0,
          avg_duration_ms: 0
        }
      };

      setWorkflows(prev => [newWorkflow, ...prev]);
      setSelectedWorkflow(newWorkflow);
      setIsCreateModalOpen(false);
      setIsBuilderOpen(true);
      setFormData({ name: '', description: '', execution_mode: 'sequential' });
      toast.success('Workflow created successfully!');
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const newExecution: WorkflowExecution = {
        id: Date.now().toString(),
        workflow_id: workflowId,
        status: 'running',
        current_node_id: 'trigger-1',
        execution_data: {},
        started_at: new Date().toISOString()
      };

      setActiveExecutions(prev => [newExecution, ...prev]);
      toast.success('Workflow execution started!');
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
    }
  };

  const pauseWorkflow = async (workflowId: string) => {
    try {
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, status: 'paused' as const } : w
      ));
      toast.success('Workflow paused');
    } catch (error) {
      console.error('Error pausing workflow:', error);
      toast.error('Failed to pause workflow');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4 text-green-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'active': return <Play className="w-4 h-4 text-green-500" />;
      case 'draft': return <Edit className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getNodeTypeConfig = (type: string) => {
    return NODE_TYPES.find(nt => nt.type === type) || NODE_TYPES[0];
  };

  const renderWorkflowBuilder = () => {
    if (!selectedWorkflow) return null;

    return (
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Workflow Builder: {selectedWorkflow.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex h-[70vh]">
            {/* Node Palette */}
            <div className="w-64 border-r p-4 overflow-y-auto">
              <h4 className="font-medium mb-3">Node Types</h4>
              <div className="space-y-2">
                {NODE_TYPES.map((nodeType) => {
                  const IconComponent = nodeType.icon;
                  return (
                    <Card 
                      key={nodeType.type} 
                      className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${nodeType.color}`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        <div>
                          <p className="font-medium text-sm">{nodeType.name}</p>
                          <p className="text-xs opacity-75">{nodeType.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-gray-50 overflow-hidden">
              <div className="absolute inset-0 p-4">
                <div className="w-full h-full relative">
                  {/* Grid Background */}
                  <svg className="absolute inset-0 w-full h-full">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Workflow Nodes */}
                  {selectedWorkflow.nodes.map((node) => {
                    const nodeConfig = getNodeTypeConfig(node.type);
                    const IconComponent = nodeConfig.icon;
                    
                    return (
                      <div
                        key={node.id}
                        className={`absolute w-40 ${nodeConfig.color} border-2 rounded-lg p-3 shadow-sm`}
                        style={{
                          left: node.position.x,
                          top: node.position.y
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="w-4 h-4" />
                          <span className="font-medium text-xs">{nodeConfig.name}</span>
                          {node.status && getStatusIcon(node.status)}
                        </div>
                        <p className="text-xs font-medium">{node.name}</p>
                        {node.description && (
                          <p className="text-xs opacity-75 mt-1">{node.description}</p>
                        )}
                      </div>
                    );
                  })}

                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {selectedWorkflow.nodes.map((node) =>
                      node.connections.map((connectionId) => {
                        const targetNode = selectedWorkflow.nodes.find(n => n.id === connectionId);
                        if (!targetNode) return null;

                        const startX = node.position.x + 80; // Center of node
                        const startY = node.position.y + 20;
                        const endX = targetNode.position.x + 80;
                        const endY = targetNode.position.y + 20;

                        return (
                          <line
                            key={`${node.id}-${connectionId}`}
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke="#6b7280"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                          />
                        );
                      })
                    )}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="w-64 border-l p-4 overflow-y-auto">
              <h4 className="font-medium mb-3">Properties</h4>
              <div className="space-y-4">
                <div>
                  <Label>Execution Mode</Label>
                  <Select value={selectedWorkflow.execution_mode}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential</SelectItem>
                      <SelectItem value="parallel">Parallel</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedWorkflow.status)}
                    <Badge variant="outline" className="capitalize">
                      {selectedWorkflow.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Version</Label>
                  <p className="text-sm font-medium mt-1">v{selectedWorkflow.version}</p>
                </div>

                <div>
                  <Label>Total Nodes</Label>
                  <p className="text-sm font-medium mt-1">{selectedWorkflow.nodes.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsBuilderOpen(false)}>
                Close
              </Button>
              <Button>
                Save Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" data-tour="workflow-canvas">
        <div>
          <h3 className="text-lg font-semibold">Advanced Workflow Builder</h3>
          <p className="text-sm text-muted-foreground">
            Create sophisticated multi-agent workflows with visual drag-and-drop interface
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name</Label>
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
                  placeholder="Describe what this workflow does..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Execution Mode</Label>
                <Select
                  value={formData.execution_mode}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    execution_mode: value as any 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sequential">Sequential</SelectItem>
                    <SelectItem value="parallel">Parallel</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createWorkflow}
                  disabled={loading || !formData.name.trim()}
                >
                  Create & Open Builder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Active Executions</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : workflows.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Workflow className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Create your first advanced workflow with visual builder
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Workflow className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{workflow.name}</CardTitle>
                          <CardDescription>{workflow.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(workflow.status)}
                        <Badge variant="outline" className="capitalize">
                          {workflow.status}
                        </Badge>
                        <Badge variant="secondary">
                          v{workflow.version}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          {workflow.execution_stats.total_runs}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Runs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {workflow.execution_stats.success_rate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {Math.round(workflow.execution_stats.avg_duration_ms / 1000)}s
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Duration</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {workflow.nodes.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Nodes</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {workflow.execution_mode}
                        </Badge>
                        {workflow.execution_stats.last_run_at && (
                          <span className="text-xs text-muted-foreground">
                            Last run: {new Date(workflow.execution_stats.last_run_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWorkflow(workflow);
                            setIsBuilderOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        {workflow.status === 'active' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => executeWorkflow(workflow.id)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Run
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => pauseWorkflow(workflow.id)}
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => executeWorkflow(workflow.id)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {activeExecutions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active executions</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Workflow executions will appear here when running
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeExecutions.map((execution) => {
                const workflow = workflows.find(w => w.id === execution.workflow_id);
                return (
                  <Card key={execution.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(execution.status)}
                            <div>
                              <h4 className="font-medium">
                                {workflow?.name || 'Unknown Workflow'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Started {new Date(execution.started_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {execution.current_node_id && (
                            <Badge variant="outline">
                              Current: {execution.current_node_id}
                            </Badge>
                          )}
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {Math.round((execution.duration_ms || 0) / 1000)}s
                            </p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Customer Support Pipeline',
                description: 'Complete customer support with escalation and resolution tracking',
                nodes: 6,
                category: 'Support'
              },
              {
                name: 'Content Approval Workflow',
                description: 'Multi-stage content review with parallel processing',
                nodes: 8,
                category: 'Content'
              },
              {
                name: 'Lead Qualification System',
                description: 'Automated lead scoring and assignment workflow',
                nodes: 5,
                category: 'Sales'
              },
              {
                name: 'Data Processing Pipeline',
                description: 'ETL workflow with validation and error handling',
                nodes: 7,
                category: 'Data'
              }
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="w-5 h-5 text-primary" />
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {template.nodes} nodes
                    </span>
                    <Button size="sm">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {renderWorkflowBuilder()}
    </div>
  );
};