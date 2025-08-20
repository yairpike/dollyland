import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Slack, 
  MessageSquare, 
  Zap, 
  Code, 
  Globe, 
  Copy, 
  ExternalLink,
  Plus,
  Settings,
  Trash2,
  Play
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Integration {
  id: string;
  agent_id: string;
  user_id: string;
  integration_type: 'slack' | 'discord' | 'zapier' | 'api' | 'widget';
  config: any;
  webhook_url?: string;
  api_key?: string;
  is_active: boolean;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
}

interface AgentIntegrationsProps {
  agentId: string;
  agentName: string;
}

export const AgentIntegrations: React.FC<AgentIntegrationsProps> = ({ agentId, agentName }) => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states for new integrations
  const [slackConfig, setSlackConfig] = useState({ webhook_url: '', channel: '#general' });
  const [discordConfig, setDiscordConfig] = useState({ webhook_url: '', username: agentName });
  const [zapierConfig, setZapierConfig] = useState({ webhook_url: '' });
  const [apiConfig, setApiConfig] = useState({ rate_limit: 100, cors_origins: '*' });
  const [widgetConfig, setWidgetConfig] = useState({ 
    theme: 'light', 
    position: 'bottom-right',
    welcome_message: `Hi! I'm ${agentName}. How can I help you?`
  });

  useEffect(() => {
    fetchIntegrations();
  }, [agentId]);

  const fetchIntegrations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agent_integrations')
        .select('*')
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations((data || []) as Integration[]);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const createIntegration = async (type: string, config: any, webhookUrl?: string) => {
    if (!user) return;

    try {
      const integrationData = {
        agent_id: agentId,
        user_id: user.id,
        integration_type: type,
        config,
        webhook_url: webhookUrl,
        api_key_encrypted: type === 'api' ? generateApiKey() : '',
        is_active: true,
      };

      const { error } = await supabase
        .from('agent_integrations')
        .insert(integrationData);

      if (error) throw error;

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} integration created successfully!`);
      await fetchIntegrations();

      // Track analytics
      await supabase.from('detailed_analytics').insert({
        agent_id: agentId,
        user_id: user.id,
        event_type: 'integration_created',
        integration_type: type,
        metadata: { integration_type: type },
      });

    } catch (error) {
      console.error('Error creating integration:', error);
      toast.error('Failed to create integration');
    }
  };

  const toggleIntegration = async (integrationId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('agent_integrations')
        .update({ is_active: isActive })
        .eq('id', integrationId);

      if (error) throw error;

      toast.success(`Integration ${isActive ? 'activated' : 'deactivated'}`);
      await fetchIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast.error('Failed to update integration');
    }
  };

  const deleteIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      const { error } = await supabase
        .from('agent_integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;

      toast.success('Integration deleted successfully');
      await fetchIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast.error('Failed to delete integration');
    }
  };

  const generateApiKey = () => {
    return `dolly_${agentId.slice(0, 8)}_${Math.random().toString(36).substring(2, 15)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const testZapierWebhook = async (webhookUrl: string) => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          test: true,
          agent_name: agentName,
          message: 'Test message from your AI agent',
          timestamp: new Date().toISOString(),
        }),
      });

      toast.success('Test webhook sent! Check your Zapier history.');
    } catch (error) {
      toast.error('Failed to send test webhook');
    }
  };

  const integrationTypes = [
    {
      id: 'slack',
      name: 'Slack',
      icon: Slack,
      description: 'Deploy your agent to Slack channels',
      color: 'bg-purple-500'
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: MessageSquare,
      description: 'Add your agent to Discord servers',
      color: 'bg-indigo-500'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      icon: Zap,
      description: 'Trigger workflows with agent responses',
      color: 'bg-orange-500'
    },
    {
      id: 'api',
      name: 'API Access',
      icon: Code,
      description: 'Programmatic access to your agent',
      color: 'bg-green-500'
    },
    {
      id: 'widget',
      name: 'Web Widget',
      icon: Globe,
      description: 'Embed agent chat on your website',
      color: 'bg-blue-500'
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading integrations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Integrations for {agentName}</h2>
        <Badge variant="outline">{integrations.length} active integrations</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-3 bg-card border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Integration Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrationTypes.map((type) => {
              const integration = integrations.find(i => i.integration_type === type.id);
              const Icon = type.icon;
              
              return (
                <Card key={type.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {integration && (
                        <Badge variant={integration.is_active ? "default" : "secondary"}>
                          {integration.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold mb-2">{type.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
                    
                    {integration ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Usage:</span>
                          <span>{integration.usage_count} calls</span>
                        </div>
                        {integration.last_used_at && (
                          <div className="flex items-center justify-between text-sm">
                            <span>Last used:</span>
                            <span>{new Date(integration.last_used_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => setActiveTab('create')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Setup
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Calls</p>
                  <p className="text-2xl font-bold">
                    {integrations.reduce((sum, i) => sum + i.usage_count, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">
                    {integrations.filter(i => i.is_active).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Types</p>
                  <p className="text-2xl font-bold">
                    {new Set(integrations.map(i => i.integration_type)).size}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="text-sm font-medium">
                    {integrations.length > 0 ? 'Today' : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Tabs defaultValue="slack" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="slack">Slack</TabsTrigger>
              <TabsTrigger value="discord">Discord</TabsTrigger>
              <TabsTrigger value="zapier">Zapier</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="widget">Widget</TabsTrigger>
            </TabsList>

            {/* Slack Integration */}
            <TabsContent value="slack">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Slack className="w-5 h-5" />
                    Slack Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                    <Input
                      id="slack-webhook"
                      placeholder="https://hooks.slack.com/services/..."
                      value={slackConfig.webhook_url}
                      onChange={(e) => setSlackConfig({...slackConfig, webhook_url: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="slack-channel">Default Channel</Label>
                    <Input
                      id="slack-channel"
                      placeholder="#general"
                      value={slackConfig.channel}
                      onChange={(e) => setSlackConfig({...slackConfig, channel: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={() => createIntegration('slack', slackConfig, slackConfig.webhook_url)}
                    disabled={!slackConfig.webhook_url}
                  >
                    Create Slack Integration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Discord Integration */}
            <TabsContent value="discord">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Discord Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="discord-webhook">Discord Webhook URL</Label>
                    <Input
                      id="discord-webhook"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={discordConfig.webhook_url}
                      onChange={(e) => setDiscordConfig({...discordConfig, webhook_url: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discord-username">Bot Username</Label>
                    <Input
                      id="discord-username"
                      placeholder="AI Agent"
                      value={discordConfig.username}
                      onChange={(e) => setDiscordConfig({...discordConfig, username: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={() => createIntegration('discord', discordConfig, discordConfig.webhook_url)}
                    disabled={!discordConfig.webhook_url}
                  >
                    Create Discord Integration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Zapier Integration */}
            <TabsContent value="zapier">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Zapier Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="zapier-webhook">Zapier Webhook URL</Label>
                    <Input
                      id="zapier-webhook"
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      value={zapierConfig.webhook_url}
                      onChange={(e) => setZapierConfig({...zapierConfig, webhook_url: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => createIntegration('zapier', zapierConfig, zapierConfig.webhook_url)}
                      disabled={!zapierConfig.webhook_url}
                    >
                      Create Zapier Integration
                    </Button>
                    {zapierConfig.webhook_url && (
                      <Button 
                        variant="outline"
                        onClick={() => testZapierWebhook(zapierConfig.webhook_url)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Integration */}
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    API Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="api-rate-limit">Rate Limit (requests/hour)</Label>
                    <Input
                      id="api-rate-limit"
                      type="number"
                      value={apiConfig.rate_limit}
                      onChange={(e) => setApiConfig({...apiConfig, rate_limit: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-cors">CORS Origins</Label>
                    <Input
                      id="api-cors"
                      placeholder="https://yourdomain.com"
                      value={apiConfig.cors_origins}
                      onChange={(e) => setApiConfig({...apiConfig, cors_origins: e.target.value})}
                    />
                  </div>
                  <Button onClick={() => createIntegration('api', apiConfig)}>
                    Generate API Key
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Widget Integration */}
            <TabsContent value="widget">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Web Widget
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="widget-theme">Theme</Label>
                    <select 
                      id="widget-theme"
                      className="w-full border rounded px-3 py-2"
                      value={widgetConfig.theme}
                      onChange={(e) => setWidgetConfig({...widgetConfig, theme: e.target.value})}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="widget-position">Position</Label>
                    <select 
                      id="widget-position"
                      className="w-full border rounded px-3 py-2"
                      value={widgetConfig.position}
                      onChange={(e) => setWidgetConfig({...widgetConfig, position: e.target.value})}
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="widget-welcome">Welcome Message</Label>
                    <Textarea
                      id="widget-welcome"
                      placeholder="Welcome message..."
                      value={widgetConfig.welcome_message}
                      onChange={(e) => setWidgetConfig({...widgetConfig, welcome_message: e.target.value})}
                    />
                  </div>
                  <Button onClick={() => createIntegration('widget', widgetConfig)}>
                    Generate Widget Code
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No integrations created yet</p>
                <Button 
                  className="mt-4"
                  onClick={() => setActiveTab('create')}
                >
                  Create Your First Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {integration.integration_type.toUpperCase()}
                        </Badge>
                        <div>
                          <h3 className="font-medium">{integration.integration_type} Integration</h3>
                          <p className="text-sm text-muted-foreground">
                            {integration.usage_count} calls • Created {new Date(integration.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={integration.is_active}
                          onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                        />
                        
                        {integration.api_key && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(integration.api_key!)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {integration.webhook_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(integration.webhook_url!)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteIntegration(integration.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Show configuration details */}
                    {integration.integration_type === 'widget' && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Embed Code:</h4>
                        <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`<script src="https://dolly-ai.com/widget.js"></script>
<script>
  DollyWidget.init({
    agentId: "${agentId}",
    theme: "${integration.config.theme}",
    position: "${integration.config.position}"
  });
</script>`}
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => copyToClipboard(`<script src="https://dolly-ai.com/widget.js"></script>\n<script>\n  DollyWidget.init({\n    agentId: "${agentId}",\n    theme: "${integration.config.theme}",\n    position: "${integration.config.position}"\n  });\n</script>`)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Code
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};