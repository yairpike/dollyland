import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  Play, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Pause, 
  RefreshCw, 
  Code, 
  ExternalLink,
  Zap,
  GitBranch,
  Globe,
  Bell,
  Settings
} from 'lucide-react'

interface ActionExecution {
  id: string
  agent_id: string
  action_type: string
  parameters: any
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  error?: string
  created_at: string
  completed_at?: string
}

interface AgentActionsProps {
  agentId: string
}

const ACTION_TYPES = [
  { 
    id: 'linear_create_issue', 
    name: 'Create Linear Issue', 
    icon: ExternalLink, 
    description: 'Create a new issue in Linear',
    fields: [
      { name: 'teamId', label: 'Team ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['1', '2', '3', '4'] }
    ]
  },
  { 
    id: 'github_create_repo', 
    name: 'Create GitHub Repo', 
    icon: GitBranch, 
    description: 'Create a new GitHub repository',
    fields: [
      { name: 'name', label: 'Repository Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'private', label: 'Private', type: 'select', options: ['true', 'false'] }
    ]
  },
  { 
    id: 'vercel_deploy', 
    name: 'Deploy to Vercel', 
    icon: Globe, 
    description: 'Deploy project to Vercel',
    fields: [
      { name: 'name', label: 'Project Name', type: 'text', required: true },
      { name: 'gitUrl', label: 'Git Repository URL', type: 'text', required: true },
      { name: 'framework', label: 'Framework', type: 'select', options: ['nextjs', 'react', 'vue', 'other'] }
    ]
  },
  { 
    id: 'send_notification', 
    name: 'Send Notification', 
    icon: Bell, 
    description: 'Send a notification',
    fields: [
      { name: 'type', label: 'Type', type: 'select', options: ['email', 'slack', 'webhook'], required: true },
      { name: 'recipient', label: 'Recipient', type: 'text', required: true },
      { name: 'message', label: 'Message', type: 'textarea', required: true }
    ]
  },
  { 
    id: 'trigger_webhook', 
    name: 'Trigger Webhook', 
    icon: Zap, 
    description: 'Send HTTP request to webhook URL',
    fields: [
      { name: 'url', label: 'Webhook URL', type: 'text', required: true },
      { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'payload', label: 'Payload (JSON)', type: 'textarea' }
    ]
  },
  { 
    id: 'custom_code', 
    name: 'Custom Code', 
    icon: Code, 
    description: 'Execute custom JavaScript code',
    fields: [
      { name: 'code', label: 'JavaScript Code', type: 'textarea', required: true },
      { name: 'context', label: 'Context (JSON)', type: 'textarea' }
    ]
  }
]

export const AgentActions: React.FC<AgentActionsProps> = ({ agentId }) => {
  const [executions, setExecutions] = useState<ActionExecution[]>([])
  const [loading, setLoading] = useState(false)
  const [createActionOpen, setCreateActionOpen] = useState(false)
  const [selectedActionType, setSelectedActionType] = useState('')
  const [actionParameters, setActionParameters] = useState<Record<string, any>>({})
  const { toast } = useToast()

  const fetchExecutions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('agent-actions', {
        body: {
          action: 'getExecutions',
          agentId
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

  const executeAction = async () => {
    if (!selectedActionType) {
      toast({
        title: 'Please select an action type',
        variant: 'destructive'
      })
      return
    }

    const actionConfig = ACTION_TYPES.find(a => a.id === selectedActionType)
    const requiredFields = actionConfig?.fields.filter(f => f.required) || []
    
    for (const field of requiredFields) {
      if (!actionParameters[field.name]) {
        toast({
          title: `${field.label} is required`,
          variant: 'destructive'
        })
        return
      }
    }

    setLoading(true)
    try {
      // Process parameters based on field types
      const processedParameters = { ...actionParameters }
      
      actionConfig?.fields.forEach(field => {
        if (field.type === 'select' && field.name === 'private') {
          processedParameters[field.name] = processedParameters[field.name] === 'true'
        }
        if (field.name === 'payload' || field.name === 'context') {
          try {
            processedParameters[field.name] = JSON.parse(processedParameters[field.name] || '{}')
          } catch {
            // Keep as string if not valid JSON
          }
        }
      })

      const { data, error } = await supabase.functions.invoke('agent-actions', {
        body: {
          action: 'executeAction',
          agentId,
          actionType: selectedActionType,
          parameters: processedParameters
        }
      })

      if (error) throw error

      toast({
        title: 'Action executed successfully',
        description: `Started ${actionConfig?.name || selectedActionType}`
      })

      setCreateActionOpen(false)
      setSelectedActionType('')
      setActionParameters({})
      fetchExecutions()
    } catch (error: any) {
      toast({
        title: 'Error executing action',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const cancelExecution = async (executionId: string) => {
    try {
      const { error } = await supabase.functions.invoke('agent-actions', {
        body: {
          action: 'cancelExecution',
          executionId
        }
      })

      if (error) throw error

      toast({
        title: 'Execution cancelled'
      })

      fetchExecutions()
    } catch (error: any) {
      toast({
        title: 'Error cancelling execution',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  useEffect(() => {
    fetchExecutions()
  }, [agentId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Pause className="w-4 h-4 text-gray-500" />
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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Agent Actions
          </CardTitle>
          <CardDescription>
            Execute automated actions for your agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="executions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white border p-1 h-12 items-center">
              <TabsTrigger value="executions">Executions</TabsTrigger>
              <TabsTrigger value="templates">Action Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="executions" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Recent Executions</h3>
                  <Badge variant="secondary">{executions.length}</Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={fetchExecutions} disabled={loading} variant="outline">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  
                  <Dialog open={createActionOpen} onOpenChange={setCreateActionOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Execute Action
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Execute Action</DialogTitle>
                        <DialogDescription>
                          Choose an action type and configure parameters
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label>Action Type</Label>
                          <Select value={selectedActionType} onValueChange={setSelectedActionType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select action type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACTION_TYPES.map((action) => (
                                <SelectItem key={action.id} value={action.id}>
                                  <div className="flex items-center gap-2">
                                    <action.icon className="w-4 h-4" />
                                    {action.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedActionType && (
                          <div className="space-y-4">
                            {ACTION_TYPES.find(a => a.id === selectedActionType)?.description && (
                              <Alert>
                                <AlertDescription>
                                  {ACTION_TYPES.find(a => a.id === selectedActionType)?.description}
                                </AlertDescription>
                              </Alert>
                            )}

                            {ACTION_TYPES.find(a => a.id === selectedActionType)?.fields.map((field) => (
                              <div key={field.name}>
                                <Label>
                                  {field.label}
                                  {field.required && <span className="text-red-500">*</span>}
                                </Label>
                                
                                {field.type === 'textarea' ? (
                                  <Textarea
                                    value={actionParameters[field.name] || ''}
                                    onChange={(e) => setActionParameters(prev => ({
                                      ...prev,
                                      [field.name]: e.target.value
                                    }))}
                                    placeholder={field.label}
                                    rows={3}
                                  />
                                ) : field.type === 'select' ? (
                                  <Select 
                                    value={actionParameters[field.name] || ''} 
                                    onValueChange={(value) => setActionParameters(prev => ({
                                      ...prev,
                                      [field.name]: value
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.options?.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    value={actionParameters[field.name] || ''}
                                    onChange={(e) => setActionParameters(prev => ({
                                      ...prev,
                                      [field.name]: e.target.value
                                    }))}
                                    placeholder={field.label}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setCreateActionOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={executeAction} disabled={loading || !selectedActionType}>
                            <Play className="w-4 h-4 mr-2" />
                            Execute
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                              {ACTION_TYPES.find(a => a.id === execution.action_type)?.name || execution.action_type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(execution.created_at).toLocaleString()}
                            </span>
                          </div>
                          
                          {execution.parameters && (
                            <div className="mb-2">
                              <p className="text-sm text-muted-foreground mb-1">Parameters:</p>
                              <code className="text-xs bg-muted p-2 rounded block">
                                {JSON.stringify(execution.parameters, null, 2)}
                              </code>
                            </div>
                          )}
                          
                          {execution.result && (
                            <div className="mb-2">
                              <p className="text-sm text-muted-foreground mb-1">Result:</p>
                              <code className="text-xs bg-green-50 p-2 rounded block border">
                                {JSON.stringify(execution.result, null, 2)}
                              </code>
                            </div>
                          )}
                          
                          {execution.error && (
                            <div className="mb-2">
                              <p className="text-sm text-muted-foreground mb-1">Error:</p>
                              <code className="text-xs bg-red-50 p-2 rounded block border text-red-600">
                                {execution.error}
                              </code>
                            </div>
                          )}
                          
                          {execution.completed_at && (
                            <p className="text-xs text-muted-foreground">
                              Completed: {new Date(execution.completed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        {execution.status === 'running' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => cancelExecution(execution.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
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

            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-4">
                {ACTION_TYPES.map((actionType) => (
                  <Card key={actionType.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <actionType.icon className="w-5 h-5 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium">{actionType.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {actionType.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {actionType.fields.map((field) => (
                            <Badge key={field.name} variant="outline" className="text-xs">
                              {field.label}
                              {field.required && '*'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedActionType(actionType.id)
                          setCreateActionOpen(true)
                        }}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Use
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
