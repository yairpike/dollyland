import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  Webhook, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Settings,
  Zap,
  Key,
  Globe
} from 'lucide-react'

interface WebhookData {
  id: string
  url: string
  events: string[]
  secret?: string
  headers?: Record<string, string>
  is_active: boolean
  created_at: string
  updated_at: string
}

interface WebhookDelivery {
  id: string
  webhook_id: string
  event: string
  payload: any
  status_code?: number
  success: boolean
  response_body?: string
  error?: string
  is_retry: boolean
  delivered_at: string
}

interface WebhookManagerProps {
  agentId: string
}

const AVAILABLE_EVENTS = [
  'agent.created',
  'agent.updated',
  'agent.deleted',
  'conversation.started',
  'conversation.ended',
  'message.sent',
  'message.received',
  'action.executed',
  'workflow.started',
  'workflow.completed',
  'deployment.started',
  'deployment.completed'
]

export const WebhookManager: React.FC<WebhookManagerProps> = ({ agentId }) => {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([])
  const [selectedWebhook, setSelectedWebhook] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [createWebhookOpen, setCreateWebhookOpen] = useState(false)
  const [editWebhookOpen, setEditWebhookOpen] = useState(false)
  const [testWebhookOpen, setTestWebhookOpen] = useState(false)
  const [currentWebhook, setCurrentWebhook] = useState<Partial<WebhookData>>({
    url: '',
    events: [],
    secret: '',
    headers: {},
    is_active: true
  })
  const [testPayload, setTestPayload] = useState('{\n  "test": true,\n  "timestamp": "' + new Date().toISOString() + '"\n}')
  const { toast } = useToast()

  const fetchWebhooks = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('webhook-manager', {
        body: {
          action: 'getWebhooks',
          data: { agentId }
        }
      })

      if (error) throw error
      setWebhooks(data.webhooks || [])
    } catch (error: any) {
      toast({
        title: 'Error fetching webhooks',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDeliveries = async (webhookId: string) => {
    if (!webhookId) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('webhook-manager', {
        body: {
          action: 'getDeliveries',
          data: { webhookId, limit: 50 }
        }
      })

      if (error) throw error
      setDeliveries(data.deliveries || [])
    } catch (error: any) {
      toast({
        title: 'Error fetching deliveries',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createWebhook = async () => {
    if (!currentWebhook.url || !currentWebhook.events?.length) {
      toast({
        title: 'Please fill in required fields',
        description: 'URL and at least one event are required',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('webhook-manager', {
        body: {
          action: 'createWebhook',
          data: {
            agentId,
            ...currentWebhook
          }
        }
      })

      if (error) throw error

      toast({
        title: 'Webhook created successfully'
      })

      setCreateWebhookOpen(false)
      resetCurrentWebhook()
      fetchWebhooks()
    } catch (error: any) {
      toast({
        title: 'Error creating webhook',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateWebhook = async () => {
    if (!currentWebhook.id || !currentWebhook.url || !currentWebhook.events?.length) {
      toast({
        title: 'Please fill in required fields',
        description: 'URL and at least one event are required',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('webhook-manager', {
        body: {
          action: 'updateWebhook',
          data: {
            webhookId: currentWebhook.id,
            url: currentWebhook.url,
            events: currentWebhook.events,
            secret: currentWebhook.secret,
            isActive: currentWebhook.is_active
          }
        }
      })

      if (error) throw error

      toast({
        title: 'Webhook updated successfully'
      })

      setEditWebhookOpen(false)
      resetCurrentWebhook()
      fetchWebhooks()
    } catch (error: any) {
      toast({
        title: 'Error updating webhook',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('webhook-manager', {
        body: {
          action: 'deleteWebhook',
          data: { webhookId }
        }
      })

      if (error) throw error

      toast({
        title: 'Webhook deleted successfully'
      })

      fetchWebhooks()
      if (selectedWebhook === webhookId) {
        setSelectedWebhook('')
        setDeliveries([])
      }
    } catch (error: any) {
      toast({
        title: 'Error deleting webhook',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async () => {
    if (!selectedWebhook) return

    let payload
    try {
      payload = JSON.parse(testPayload)
    } catch {
      toast({
        title: 'Invalid JSON',
        description: 'Please enter valid JSON for the test payload',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('webhook-manager', {
        body: {
          action: 'triggerWebhook',
          data: {
            event: 'test.webhook',
            payload,
            agentId
          }
        }
      })

      if (error) throw error

      toast({
        title: 'Test webhook sent',
        description: `Sent to ${data.deliveries?.length || 0} webhook(s)`
      })

      setTestWebhookOpen(false)
      fetchDeliveries(selectedWebhook)
    } catch (error: any) {
      toast({
        title: 'Error sending test webhook',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const retryDelivery = async (deliveryId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('webhook-manager', {
        body: {
          action: 'retryDelivery',
          data: { deliveryId }
        }
      })

      if (error) throw error

      toast({
        title: 'Delivery retried'
      })

      fetchDeliveries(selectedWebhook)
    } catch (error: any) {
      toast({
        title: 'Error retrying delivery',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetCurrentWebhook = () => {
    setCurrentWebhook({
      url: '',
      events: [],
      secret: '',
      headers: {},
      is_active: true
    })
  }

  const handleEventToggle = (event: string) => {
    const events = currentWebhook.events || []
    if (events.includes(event)) {
      setCurrentWebhook(prev => ({
        ...prev,
        events: events.filter(e => e !== event)
      }))
    } else {
      setCurrentWebhook(prev => ({
        ...prev,
        events: [...events, event]
      }))
    }
  }

  useEffect(() => {
    fetchWebhooks()
  }, [agentId])

  useEffect(() => {
    if (selectedWebhook) {
      fetchDeliveries(selectedWebhook)
    }
  }, [selectedWebhook])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Webhook Manager
          </CardTitle>
          <CardDescription>
            Configure webhooks to receive real-time notifications about agent events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="webhooks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
            </TabsList>

            <TabsContent value="webhooks" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Webhooks</h3>
                  <Badge variant="secondary">{webhooks.length}</Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={fetchWebhooks} disabled={loading} variant="outline">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  
                  <Dialog open={createWebhookOpen} onOpenChange={setCreateWebhookOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetCurrentWebhook}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Webhook
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Webhook</DialogTitle>
                        <DialogDescription>
                          Configure a new webhook endpoint
                        </DialogDescription>
                      </DialogHeader>
                      <WebhookForm 
                        webhook={currentWebhook}
                        setWebhook={setCurrentWebhook}
                        onEventToggle={handleEventToggle}
                        onSubmit={createWebhook}
                        onCancel={() => setCreateWebhookOpen(false)}
                        loading={loading}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid gap-4">
                {webhooks.map((webhook) => (
                  <Card key={webhook.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4" />
                          <span className="font-medium truncate">{webhook.url}</span>
                          <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                            {webhook.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {webhook.secret && (
                            <Badge variant="outline">
                              <Key className="w-3 h-3 mr-1" />
                              Secured
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(webhook.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedWebhook(webhook.id)
                            setTestWebhookOpen(true)
                          }}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setCurrentWebhook(webhook)
                            setEditWebhookOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteWebhook(webhook.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedWebhook(webhook.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {webhooks.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No webhooks configured
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="deliveries" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Recent Deliveries</h3>
                  <Badge variant="secondary">{deliveries.length}</Badge>
                </div>
                
                <div className="flex gap-2">
                  <select 
                    className="text-sm border rounded px-2 py-1"
                    value={selectedWebhook}
                    onChange={(e) => setSelectedWebhook(e.target.value)}
                  >
                    <option value="">Select webhook</option>
                    {webhooks.map((webhook) => (
                      <option key={webhook.id} value={webhook.id}>
                        {webhook.url}
                      </option>
                    ))}
                  </select>
                  
                  <Button 
                    onClick={() => fetchDeliveries(selectedWebhook)} 
                    disabled={loading || !selectedWebhook} 
                    variant="outline"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {deliveries.map((delivery) => (
                    <Card key={delivery.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {delivery.success ? 
                              <CheckCircle className="w-4 h-4 text-green-500" /> : 
                              <XCircle className="w-4 h-4 text-red-500" />
                            }
                            <Badge variant={delivery.success ? 'default' : 'destructive'}>
                              {delivery.status_code || 'Failed'}
                            </Badge>
                            <span className="font-medium">{delivery.event}</span>
                            {delivery.is_retry && (
                              <Badge variant="outline">Retry</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(delivery.delivered_at).toLocaleString()}
                            </span>
                          </div>
                          
                          {delivery.payload && (
                            <div className="mb-2">
                              <p className="text-sm text-muted-foreground mb-1">Payload:</p>
                              <code className="text-xs bg-muted p-2 rounded block">
                                {JSON.stringify(delivery.payload, null, 2)}
                              </code>
                            </div>
                          )}
                          
                          {delivery.response_body && (
                            <div className="mb-2">
                              <p className="text-sm text-muted-foreground mb-1">Response:</p>
                              <code className="text-xs bg-muted p-2 rounded block">
                                {delivery.response_body}
                              </code>
                            </div>
                          )}
                          
                          {delivery.error && (
                            <div className="mb-2">
                              <p className="text-sm text-muted-foreground mb-1">Error:</p>
                              <code className="text-xs bg-red-50 p-2 rounded block text-red-600">
                                {delivery.error}
                              </code>
                            </div>
                          )}
                        </div>
                        
                        {!delivery.success && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => retryDelivery(delivery.id)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {deliveries.length === 0 && selectedWebhook && !loading && (
                    <div className="text-center py-8 text-muted-foreground">
                      No deliveries found for this webhook
                    </div>
                  )}
                  
                  {!selectedWebhook && (
                    <div className="text-center py-8 text-muted-foreground">
                      Select a webhook to view deliveries
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Webhook Dialog */}
      <Dialog open={editWebhookOpen} onOpenChange={setEditWebhookOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Webhook</DialogTitle>
            <DialogDescription>
              Update webhook configuration
            </DialogDescription>
          </DialogHeader>
          <WebhookForm 
            webhook={currentWebhook}
            setWebhook={setCurrentWebhook}
            onEventToggle={handleEventToggle}
            onSubmit={updateWebhook}
            onCancel={() => setEditWebhookOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Test Webhook Dialog */}
      <Dialog open={testWebhookOpen} onOpenChange={setTestWebhookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Webhook</DialogTitle>
            <DialogDescription>
              Send a test payload to the selected webhook
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Test Payload (JSON)</Label>
              <Textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTestWebhookOpen(false)}>
                Cancel
              </Button>
              <Button onClick={testWebhook} disabled={loading}>
                <Send className="w-4 h-4 mr-2" />
                Send Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface WebhookFormProps {
  webhook: Partial<WebhookData>
  setWebhook: (webhook: Partial<WebhookData>) => void
  onEventToggle: (event: string) => void
  onSubmit: () => void
  onCancel: () => void
  loading: boolean
}

const WebhookForm: React.FC<WebhookFormProps> = ({
  webhook,
  setWebhook,
  onEventToggle,
  onSubmit,
  onCancel,
  loading
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Webhook URL</Label>
        <Input
          value={webhook.url || ''}
          onChange={(e) => setWebhook({ ...webhook, url: e.target.value })}
          placeholder="https://your-domain.com/webhook"
        />
      </div>
      
      <div>
        <Label>Events</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {AVAILABLE_EVENTS.map((event) => (
            <div key={event} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={event}
                checked={webhook.events?.includes(event) || false}
                onChange={() => onEventToggle(event)}
                className="rounded"
              />
              <label htmlFor={event} className="text-sm">
                {event}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label>Secret (optional)</Label>
        <Input
          type="password"
          value={webhook.secret || ''}
          onChange={(e) => setWebhook({ ...webhook, secret: e.target.value })}
          placeholder="Webhook secret for signature verification"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={webhook.is_active !== false}
          onCheckedChange={(checked) => setWebhook({ ...webhook, is_active: checked })}
        />
        <Label>Active</Label>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={loading}>
          {webhook.id ? 'Update' : 'Create'} Webhook
        </Button>
      </div>
    </div>
  )
}