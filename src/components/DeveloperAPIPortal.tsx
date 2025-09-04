import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Code, 
  Key, 
  Globe, 
  Book, 
  Terminal, 
  Copy, 
  Eye, 
  EyeOff,
  Download,
  ExternalLink,
  Webhook,
  Zap
} from "lucide-react";

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  requests: number;
  status: 'active' | 'disabled';
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'paused';
  lastDelivery: string;
  deliveries: number;
}

export const DeveloperAPIPortal: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeveloperData();
  }, []);

  const fetchDeveloperData = async () => {
    setLoading(true);
    // Simulate API calls - replace with real Supabase queries
    setTimeout(() => {
      setApiKeys([
        {
          id: '1',
          name: 'Production API',
          key: 'sk_live_7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p',
          created: '2024-01-15',
          lastUsed: '2 hours ago',
          requests: 1247,
          status: 'active'
        },
        {
          id: '2',
          name: 'Development Testing',
          key: 'sk_test_9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k',
          created: '2024-01-10',
          lastUsed: '1 day ago',
          requests: 89,
          status: 'active'
        }
      ]);

      setWebhooks([
        {
          id: '1',
          url: 'https://myapp.com/webhooks/dolly',
          events: ['agent.created', 'conversation.completed', 'payment.received'],
          status: 'active',
          lastDelivery: '5 minutes ago',
          deliveries: 342
        }
      ]);

      setLoading(false);
    }, 1000);
  };

  const generateAPIKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your API key",
        variant: "destructive"
      });
      return;
    }

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substring(2, 34)}`,
      created: new Date().toLocaleDateString(),
      lastUsed: 'Never',
      requests: 0,
      status: 'active'
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    
    toast({
      title: "API Key Generated",
      description: "Your new API key has been created. Save it securely!"
    });
  };

  const addWebhook = () => {
    if (!newWebhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive"
      });
      return;
    }

    const newWebhook: WebhookEndpoint = {
      id: Date.now().toString(),
      url: newWebhookUrl,
      events: ['agent.created'],
      status: 'active',
      lastDelivery: 'Never',
      deliveries: 0
    };

    setWebhooks([newWebhook, ...webhooks]);
    setNewWebhookUrl('');
    
    toast({
      title: "Webhook Added",
      description: "Your webhook endpoint has been configured"
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard"
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '...' + key.substring(key.length - 4);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading developer portal...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Code className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Developer API Portal</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                <Terminal className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,453</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">2 new this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Webhook Deliveries</CardTitle>
                <Webhook className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.9%</div>
                <p className="text-xs text-muted-foreground">Success rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Get started with the Dolly AI API in minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Get your API key</h4>
                <p className="text-sm text-muted-foreground">Create an API key in the API Keys tab</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">2. Make your first request</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">
                    {`curl -X POST https://api.dolly.ai/v1/agents/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello, how can you help me?"}'`}
                  </code>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">3. Handle responses</h4>
                <p className="text-sm text-muted-foreground">Process JSON responses and integrate with your application</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>API Key Management</span>
              </CardTitle>
              <CardDescription>
                Create and manage API keys for your applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="API key name (e.g., Production App)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <Button onClick={generateAPIKey}>Generate Key</Button>
              </div>
              
              <Alert>
                <AlertDescription>
                  API keys provide access to your agents and data. Keep them secure and never share them publicly.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{apiKey.name}</span>
                        <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                          {apiKey.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Created: {apiKey.created}</span>
                        <span>Last used: {apiKey.lastUsed}</span>
                        <span>Requests: {apiKey.requests.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Revoke
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Webhook className="h-5 w-5" />
                <span>Webhook Endpoints</span>
              </CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Webhook URL (e.g., https://yourapp.com/webhook)"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
                <Button onClick={addWebhook}>Add Webhook</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <code className="text-sm">{webhook.url}</code>
                        <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                          {webhook.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Last delivery: {webhook.lastDelivery}</span>
                        <span>Total deliveries: {webhook.deliveries}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>API Reference</span>
                  <ExternalLink className="h-4 w-4" />
                </CardTitle>
                <CardDescription>
                  Complete documentation for all API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive guides for authentication, agents, conversations, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>SDKs & Libraries</span>
                </CardTitle>
                <CardDescription>
                  Official SDKs for popular programming languages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Node.js</span>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Python</span>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">React</span>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Terminal className="h-5 w-5" />
                  <span>Code Examples</span>
                </CardTitle>
                <CardDescription>
                  Ready-to-use code samples and tutorials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Copy-paste examples for common integration patterns.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Integration Guides</span>
                </CardTitle>
                <CardDescription>
                  Step-by-step guides for popular platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Zapier, Make, WordPress, Shopify, and more.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};