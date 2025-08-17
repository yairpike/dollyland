import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  Workflow, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  RefreshCw, 
  GitBranch, 
  Clock, 
  CheckCircle, 
  XCircle,
  Settings,
  Zap,
  RotateCcw,
  ArrowRight,
  ArrowDown
} from 'lucide-react'

interface WorkflowData {
  id: string
  name: string
  description?: string
  steps: WorkflowStep[]
  triggers: WorkflowTrigger[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface WorkflowStep {
  id: string
  type: 'action' | 'condition' | 'loop' | 'parallel' | 'wait'
  name: string
  config: any
  nextStep?: string
  position: { x: number; y: number }
}

interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'manual'
  config: any
}

interface WorkflowExecution {
  id: string
  workflow_id: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  current_step?: string
  context: any
  created_at: string
  completed_at?: string
}

interface WorkflowBuilderProps {
  agentId: string
}

const STEP_TYPES = [
  { 
    id: 'action', 
    name: 'Action', 
    icon: Zap, 
    description: 'Execute an action',
    color: 'bg-blue-100 border-blue-300'
  },
  { 
    id: 'condition', 
    name: 'Condition', 
    icon: GitBranch, 
    description: 'Branching logic',
    color: 'bg-yellow-100 border-yellow-300'
  },
  { 
    id: 'wait', 
    name: 'Wait', 
    icon: Clock, 
    description: 'Pause execution',
    color: 'bg-gray-100 border-gray-300'
  },
  { 
    id: 'loop', 
    name: 'Loop', 
    icon: RotateCcw, 
    description: 'Repeat steps',
    color: 'bg-green-100 border-green-300'
  }
]

const TRIGGER_TYPES = [
  { id: 'manual', name: 'Manual', description: 'Start manually' },
  { id: 'event', name: 'Event', description: 'Triggered by events' },
  { id: 'schedule', name: 'Schedule', description: 'Run on schedule' }
]

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ agentId }) => {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [createWorkflowOpen, setCreateWorkflowOpen] = useState(false)
  const [editWorkflowOpen, setEditWorkflowOpen] = useState(false)
  const [executeWorkflowOpen, setExecuteWorkflowOpen] = useState(false)
  const [currentWorkflow, setCurrentWorkflow] = useState<Partial<WorkflowData>>({
    name: '',
    description: '',
    steps: [],
    triggers: [],
    is_active: true
  })
  const [executionContext, setExecutionContext] = useState('{}')
  const { toast } = useToast()

  const fetchWorkflows = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('workflow-engine', {
        body: {
          action: 'getWorkflows',
          data: { agentId }
        }
      })

      if (error) throw error
      setWorkflows(data.workflows || [])
    } catch (error: any) {
      toast({
        title: 'Error fetching workflows',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchExecutions = async (workflowId?: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('workflow-engine', {
        body: {
          action: 'getExecutions',
          data: { 
            workflowId: workflowId || selectedWorkflow,
            limit: 50 
          }
        }
      })

      if (error) throw error
      setExecutions(data.executions || [])
    } catch (error: any) {
      toast({
        title: 'Error fetching executions',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createWorkflow = async () => {
    if (!currentWorkflow.name) {
      toast({
        title: 'Please enter a workflow name',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('workflow-engine', {
        body: {
          action: 'createWorkflow',
          data: {
            agentId,
            ...currentWorkflow
          }
        }
      })

      if (error) throw error

      toast({
        title: 'Workflow created successfully'
      })

      setCreateWorkflowOpen(false)
      resetCurrentWorkflow()
      fetchWorkflows()
    } catch (error: any) {
      toast({
        title: 'Error creating workflow',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const executeWorkflow = async () => {
    if (!selectedWorkflow) return

    let context
    try {
      context = JSON.parse(executionContext)
    } catch {
      toast({
        title: 'Invalid JSON',
        description: 'Please enter valid JSON for the execution context',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('workflow-engine', {
        body: {
          action: 'executeWorkflow',
          data: {
            workflowId: selectedWorkflow,
            context: { ...context, agentId }
          }
        }
      })

      if (error) throw error

      toast({
        title: 'Workflow execution started',
        description: `Execution ID: ${data.execution.id}`
      })

      setExecuteWorkflowOpen(false)
      fetchExecutions()
    } catch (error: any) {
      toast({
        title: 'Error executing workflow',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const pauseExecution = async (executionId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('workflow-engine', {
        body: {
          action: 'pauseExecution',
          data: { executionId }
        }
      })

      if (error) throw error

      toast({
        title: 'Execution paused'
      })

      fetchExecutions()
    } catch (error: any) {
      toast({
        title: 'Error pausing execution',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const resumeExecution = async (executionId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('workflow-engine', {
        body: {
          action: 'resumeExecution',
          data: { executionId }
        }
      })

      if (error) throw error

      toast({
        title: 'Execution resumed'
      })

      fetchExecutions()
    } catch (error: any) {
      toast({
        title: 'Error resuming execution',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const addStep = (type: string) => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: type as any,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Step`,
      config: {},
      position: { x: 100, y: (currentWorkflow.steps?.length || 0) * 120 + 100 }
    }

    setCurrentWorkflow(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }))
  }

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps?.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ) || []
    }))
  }

  const removeStep = (stepId: string) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps?.filter(step => step.id !== stepId) || []
    }))
  }

  const resetCurrentWorkflow = () => {
    setCurrentWorkflow({
      name: '',
      description: '',
      steps: [],
      triggers: [],
      is_active: true
    })
  }

  useEffect(() => {
    fetchWorkflows()
  }, [agentId])

  useEffect(() => {
    if (selectedWorkflow) {
      fetchExecutions()
    }
  }, [selectedWorkflow])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'paused':
        return <Pause className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'paused':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            Workflow Builder
          </CardTitle>
          <CardDescription>
            Create and manage multi-step automated workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="workflows" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white border p-1 h-12 items-center">
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="executions">Executions</TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Workflows</h3>
                  <Badge variant="secondary">{workflows.length}</Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={fetchWorkflows} disabled={loading} variant="outline">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  
                  <Dialog open={createWorkflowOpen} onOpenChange={setCreateWorkflowOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetCurrentWorkflow}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Workflow
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>Create Workflow</DialogTitle>
                        <DialogDescription>
                          Design a new automated workflow
                        </DialogDescription>
                      </DialogHeader>
                      <WorkflowEditor 
                        workflow={currentWorkflow}
                        setWorkflow={setCurrentWorkflow}
                        onSubmit={createWorkflow}
                        onCancel={() => setCreateWorkflowOpen(false)}
                        loading={loading}
                        onAddStep={addStep}
                        onUpdateStep={updateStep}
                        onRemoveStep={removeStep}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid gap-4">
                {workflows.map((workflow) => (
                  <Card key={workflow.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Workflow className="w-4 h-4" />
                          <span className="font-medium">{workflow.name}</span>
                          <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                            {workflow.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {workflow.steps.length} steps
                          </Badge>
                        </div>
                        
                        {workflow.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {workflow.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {workflow.triggers.map((trigger, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {trigger.type}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(workflow.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedWorkflow(workflow.id)
                            setExecuteWorkflowOpen(true)
                          }}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setCurrentWorkflow(workflow)
                            setEditWorkflowOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedWorkflow(workflow.id)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {workflows.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No workflows created yet
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="executions" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Recent Executions</h3>
                  <Badge variant="secondary">{executions.length}</Badge>
                </div>
                
                <div className="flex gap-2">
                  <select 
                    className="text-sm border rounded px-2 py-1"
                    value={selectedWorkflow}
                    onChange={(e) => setSelectedWorkflow(e.target.value)}
                  >
                    <option value="">All workflows</option>
                    {workflows.map((workflow) => (
                      <option key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </option>
                    ))}
                  </select>
                  
                  <Button 
                    onClick={() => fetchExecutions()} 
                    disabled={loading} 
                    variant="outline"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {executions.map((execution) => (
                    <Card key={execution.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(execution.status)}
                            <Badge className={getStatusColor(execution.status)}>
                              {execution.status}
                            </Badge>
                            <span className="font-medium">
                              {workflows.find(w => w.id === execution.workflow_id)?.name || 'Unknown Workflow'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(execution.created_at).toLocaleString()}
                            </span>
                          </div>
                          
                          {execution.current_step && (
                            <p className="text-sm text-muted-foreground mb-2">
                              Current step: {execution.current_step}
                            </p>
                          )}
                          
                          {execution.context && Object.keys(execution.context).length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm text-muted-foreground mb-1">Context:</p>
                              <code className="text-xs bg-muted p-2 rounded block">
                                {JSON.stringify(execution.context, null, 2)}
                              </code>
                            </div>
                          )}
                          
                          {execution.completed_at && (
                            <p className="text-xs text-muted-foreground">
                              Completed: {new Date(execution.completed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {execution.status === 'running' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => pauseExecution(execution.id)}
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {execution.status === 'paused' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => resumeExecution(execution.id)}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {executions.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground">
                      No executions found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Execute Workflow Dialog */}
      <Dialog open={executeWorkflowOpen} onOpenChange={setExecuteWorkflowOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Workflow</DialogTitle>
            <DialogDescription>
              Start workflow execution with custom context
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Execution Context (JSON)</Label>
              <Textarea
                value={executionContext}
                onChange={(e) => setExecutionContext(e.target.value)}
                rows={6}
                className="font-mono text-sm"
                placeholder='{\n  "variable": "value",\n  "data": {}\n}'
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setExecuteWorkflowOpen(false)}>
                Cancel
              </Button>
              <Button onClick={executeWorkflow} disabled={loading}>
                <Play className="w-4 h-4 mr-2" />
                Execute
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface WorkflowEditorProps {
  workflow: Partial<WorkflowData>
  setWorkflow: (workflow: Partial<WorkflowData>) => void
  onSubmit: () => void
  onCancel: () => void
  loading: boolean
  onAddStep: (type: string) => void
  onUpdateStep: (stepId: string, updates: Partial<WorkflowStep>) => void
  onRemoveStep: (stepId: string) => void
}

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  workflow,
  setWorkflow,
  onSubmit,
  onCancel,
  loading,
  onAddStep,
  onUpdateStep,
  onRemoveStep
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Workflow Name</Label>
          <Input
            value={workflow.name || ''}
            onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
            placeholder="My Workflow"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={workflow.is_active !== false}
            onCheckedChange={(checked) => setWorkflow({ ...workflow, is_active: checked })}
          />
          <Label>Active</Label>
        </div>
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea
          value={workflow.description || ''}
          onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
          placeholder="Workflow description"
          rows={2}
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <Label>Workflow Steps</Label>
          <div className="flex gap-2">
            {STEP_TYPES.map((stepType) => (
              <Button
                key={stepType.id}
                variant="outline"
                size="sm"
                onClick={() => onAddStep(stepType.id)}
              >
                <stepType.icon className="w-4 h-4 mr-1" />
                {stepType.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {workflow.steps?.map((step, index) => (
            <Card key={step.id} className={`p-3 ${STEP_TYPES.find(t => t.id === step.type)?.color}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {React.createElement(STEP_TYPES.find(t => t.id === step.type)?.icon || Zap, {
                      className: "w-4 h-4"
                    })}
                    <Input
                      value={step.name}
                      onChange={(e) => onUpdateStep(step.id, { name: e.target.value })}
                      className="font-medium bg-transparent border-none p-0 h-auto"
                    />
                    <Badge variant="outline">{step.type}</Badge>
                  </div>
                  
                  {step.type === 'action' && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Action type (e.g., linear_create_issue)"
                        value={step.config.actionType || ''}
                        onChange={(e) => onUpdateStep(step.id, {
                          config: { ...step.config, actionType: e.target.value }
                        })}
                      />
                    </div>
                  )}
                  
                  {step.type === 'condition' && (
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Field"
                        value={step.config.field || ''}
                        onChange={(e) => onUpdateStep(step.id, {
                          config: { ...step.config, field: e.target.value }
                        })}
                      />
                      <Select 
                        value={step.config.operator || ''} 
                        onValueChange={(value) => onUpdateStep(step.id, {
                          config: { ...step.config, operator: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Value"
                        value={step.config.value || ''}
                        onChange={(e) => onUpdateStep(step.id, {
                          config: { ...step.config, value: e.target.value }
                        })}
                      />
                    </div>
                  )}
                  
                  {step.type === 'wait' && (
                    <Input
                      type="number"
                      placeholder="Duration (seconds)"
                      value={step.config.duration || ''}
                      onChange={(e) => onUpdateStep(step.id, {
                        config: { ...step.config, duration: parseInt(e.target.value) || 0 }
                      })}
                    />
                  )}
                  
                  {step.type === 'loop' && (
                    <Input
                      type="number"
                      placeholder="Iterations"
                      value={step.config.iterations || ''}
                      onChange={(e) => onUpdateStep(step.id, {
                        config: { ...step.config, iterations: parseInt(e.target.value) || 1 }
                      })}
                    />
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onRemoveStep(step.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {index < (workflow.steps?.length || 0) - 1 && (
                <div className="flex justify-center mt-2">
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </Card>
          ))}
          
          {(!workflow.steps || workflow.steps.length === 0) && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              Add steps to build your workflow
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={loading}>
          {workflow.id ? 'Update' : 'Create'} Workflow
        </Button>
      </div>
    </div>
  )
}