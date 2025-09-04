import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Calendar, 
  MessageSquare, 
  Mail, 
  Database,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  status: 'connected' | 'available' | 'configured';
  lastSync?: string;
  config?: any;
}

interface IntegrationCategory {
  id: string;
  name: string;
  description: string;
  integrations: Integration[];
}

export const ThirdPartyIntegrations: React.FC = () => {
  const [categories, setCategories] = useState<IntegrationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [zapierWebhook, setZapierWebhook] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    // Simulate API call - replace with real Supabase queries
    setTimeout(() => {
      setCategories([
        {
          id: 'automation',
          name: 'Automation & Workflows',
          description: 'Connect with workflow automation platforms',
          integrations: [
            {
              id: 'zapier',
              name: 'Zapier',
              description: 'Automate workflows between Dolly AI and 5000+ apps',
              category: 'automation',
              icon: <Zap className="h-6 w-6" />,
              status: 'available'
            },
            {
              id: 'make',
              name: 'Make (Integromat)',
              description: 'Visual workflow automation and data integration',
              category: 'automation',
              icon: <Settings className="h-6 w-6" />,
              status: 'available'
            }
          ]
        },
        {
          id: 'communication',
          name: 'Communication & Collaboration',
          description: 'Integrate with messaging and communication tools',
          integrations: [
            {
              id: 'slack',
              name: 'Slack',
              description: 'Send notifications and interact with agents in Slack',
              category: 'communication',
              icon: <MessageSquare className="h-6 w-6" />,
              status: 'connected',
              lastSync: '2 minutes ago'
            },
            {
              id: 'discord',
              name: 'Discord',
              description: 'Bot integration for Discord servers',
              category: 'communication',
              icon: <MessageSquare className="h-6 w-6" />,
              status: 'available'
            },
            {
              id: 'teams',
              name: 'Microsoft Teams',
              description: 'Enterprise collaboration and agent integration',
              category: 'communication',
              icon: <MessageSquare className="h-6 w-6" />,
              status: 'configured'
            }
          ]
        },
        {
          id: 'productivity',
          name: 'Productivity & Calendar',
          description: 'Sync with calendars and productivity apps',
          integrations: [
            {
              id: 'google-calendar',
              name: 'Google Calendar',
              description: 'Schedule meetings and manage calendar events',
              category: 'productivity',
              icon: <Calendar className="h-6 w-6" />,
              status: 'connected',
              lastSync: '15 minutes ago'
            },
            {
              id: 'outlook',
              name: 'Microsoft Outlook',
              description: 'Email and calendar integration',
              category: 'productivity',
              icon: <Mail className="h-6 w-6" />,
              status: 'available'
            },
            {
              id: 'notion',
              name: 'Notion',
              description: 'Create and update Notion pages and databases',
              category: 'productivity',
              icon: <FileText className="h-6 w-6" />,
              status: 'available'
            }
          ]
        },
        {
          id: 'business',
          name: 'Business & CRM',
          description: 'Connect with CRM and business tools',
          integrations: [
            {
              id: 'salesforce',
              name: 'Salesforce',
              description: 'Sync leads, contacts, and opportunities',
              category: 'business',
              icon: <Database className="h-6 w-6" />,
              status: 'connected',
              lastSync: '1 hour ago'
            },
            {
              id: 'hubspot',
              name: 'HubSpot',
              description: 'Marketing, sales, and customer service integration',
              category: 'business',
              icon: <BarChart3 className="h-6 w-6" />,
              status: 'available'
            },
            {
              id: 'shopify',
              name: 'Shopify',
              description: 'E-commerce integration for order management',
              category: 'business',
              icon: <ShoppingCart className="h-6 w-6" />,
              status: 'available'
            }
          ]
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const connectIntegration = (integrationId: string) => {
    toast({
      title: "Integration Connected",
      description: "Successfully connected to the service"
    });

    setCategories(prev => 
      prev.map(category => ({
        ...category,
        integrations: category.integrations.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'connected', lastSync: 'Just now' }
            : integration
        )
      }))
    );
  };

  const disconnectIntegration = (integrationId: string) => {
    toast({
      title: "Integration Disconnected",
      description: "Service has been disconnected"
    });

    setCategories(prev => 
      prev.map(category => ({
        ...category,
        integrations: category.integrations.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'available', lastSync: undefined }
            : integration
        )
      }))
    );
  };

  const handleZapierWebhook = async () => {
    if (!zapierWebhook.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(zapierWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          message: "Test webhook from Dolly AI",
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });

      toast({
        title: "Webhook Triggered",
        description: "Test webhook sent to Zapier. Check your Zap's history to confirm."
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the webhook. Please check the URL.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'configured':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'default';
      case 'configured':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Zap className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Third-Party Integrations</h2>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Integrations</TabsTrigger>
          <TabsTrigger value="zapier">Zapier Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.integrations.map((integration) => (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {integration.icon}
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusIcon(integration.status)}
                              <Badge variant={getStatusColor(integration.status)} className="text-xs">
                                {integration.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <CardDescription className="text-sm">
                        {integration.description}
                      </CardDescription>
                      
                      {integration.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Last sync: {integration.lastSync}
                        </p>
                      )}
                      
                      <div className="flex space-x-2">
                        {integration.status === 'connected' ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => disconnectIntegration(integration.id)}
                            >
                              Disconnect
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => connectIntegration(integration.id)}
                          >
                            Connect
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="zapier" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Zapier Integration Setup</span>
              </CardTitle>
              <CardDescription>
                Connect Dolly AI with 5000+ apps using Zapier webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  To set up Zapier integration, create a new Zap with a "Webhooks by Zapier" trigger, 
                  then paste the webhook URL below to test the connection.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Zapier Webhook URL</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={zapierWebhook}
                    onChange={(e) => setZapierWebhook(e.target.value)}
                  />
                  <Button onClick={handleZapierWebhook}>
                    Test Webhook
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Available Zapier Triggers</h4>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Agent Created</span>
                      <p className="text-sm text-muted-foreground">Triggered when a new agent is created</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Conversation Completed</span>
                      <p className="text-sm text-muted-foreground">Triggered when a conversation ends</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Payment Received</span>
                      <p className="text-sm text-muted-foreground">Triggered when a payment is processed</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Agent Performance Alert</span>
                      <p className="text-sm text-muted-foreground">Triggered when agent performance metrics change</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Setup Instructions</h4>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li>1. Create a new Zap in your Zapier account</li>
                  <li>2. Choose "Webhooks by Zapier" as the trigger app</li>
                  <li>3. Select "Catch Hook" as the trigger event</li>
                  <li>4. Copy the webhook URL and paste it above</li>
                  <li>5. Click "Test Webhook" to send sample data</li>
                  <li>6. Complete your Zap with the desired action</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};