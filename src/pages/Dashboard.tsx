import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, MessageSquare, Users, TrendingUp, Activity, Globe, Lock, Settings, Edit, Trash2, ShoppingBag } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PublishAgentModal } from "@/components/PublishAgentModal";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardTour } from "@/components/tours/DashboardTour";
import { useTourManager } from "@/components/OnboardingTour";
import { CommunityFeaturesTour } from "@/components/tours/CommunityFeaturesTour";
import { DeveloperAPITour } from "@/components/tours/DeveloperAPITour";
import { ThirdPartyIntegrationsTour } from "@/components/tours/ThirdPartyIntegrationsTour";
import { PredictiveAnalyticsTour } from "@/components/tours/PredictiveAnalyticsTour";
import { useRealAnalytics } from "@/hooks/useRealAnalytics";
import { AIMarketplaceDiscovery } from "@/components/AIMarketplaceDiscovery";
import { CommunityFeatures } from "@/components/CommunityFeatures";
import { DeveloperAPIPortal } from "@/components/DeveloperAPIPortal";
import { ThirdPartyIntegrations } from "@/components/ThirdPartyIntegrations";
import { PredictiveAnalytics } from "@/components/PredictiveAnalytics";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  system_prompt: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  category: string | null;
  tags: string[] | null;
  user_count: number;
  rating: number;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { analytics, loading: analyticsLoading } = useRealAnalytics('7d');
  
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishingAgent, setPublishingAgent] = useState<Agent | null>(null);
  const { shouldShowTour } = useTourManager();
  const [showDashboardTour, setShowDashboardTour] = useState(false);
  const [isCommunityTourOpen, setIsCommunityTourOpen] = useState(false);
  const [isDeveloperTourOpen, setIsDeveloperTourOpen] = useState(false);
  const [isIntegrationsTourOpen, setIsIntegrationsTourOpen] = useState(false);
  const [isAnalyticsTourOpen, setIsAnalyticsTourOpen] = useState(false);

  useEffect(() => {
    if (shouldShowTour('dashboard')) {
      setShowDashboardTour(true);
    }
  }, [shouldShowTour]);

  useEffect(() => {
    fetchAgents();
  }, [user]);

  const fetchAgents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentPublished = () => {
    fetchAgents();
    setIsPublishModalOpen(false);
    setPublishingAgent(null);
  };

  const handleEditAgent = (agent: Agent) => {
    navigate(`/edit-agent/${agent.id}`);
  };

  const handlePublishAgent = (agent: Agent) => {
    setPublishingAgent(agent);
    setIsPublishModalOpen(true);
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;
      
      toast.success('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onCreateAgent={() => navigate('/create-agent')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" data-tour="dashboard-header">
          <div>
            <h1 className="text-3xl font-semibold">Home</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your agents.</p>
          </div>
          <Button onClick={() => navigate('/create-agent')} data-tour="create-agent-button">
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tour="dashboard-stats">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                  <p className="text-3xl font-semibold">{analytics?.totalAgents || agents.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics?.totalAgents > 0 ? `${analytics.totalAgents} total created` : `${agents.length} total created`}
                  </p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
              </div>
               <div className="h-16">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={analytics?.weeklyEngagement?.map((day, index) => ({
                     name: day.day,
                     value: Math.max(1, Math.ceil(analytics.totalAgents / 7)), // Distribute agents across week
                     pattern: ['dots', 'stripes', 'solid'][index % 3]
                   })) || [
                     { name: 'Mon', value: 0, pattern: 'dots' },
                     { name: 'Tue', value: 0, pattern: 'stripes' },
                     { name: 'Wed', value: 0, pattern: 'dots' },
                     { name: 'Thu', value: 0, pattern: 'solid' },
                     { name: 'Fri', value: 0, pattern: 'stripes' },
                     { name: 'Sat', value: 0, pattern: 'dots' },
                     { name: 'Sun', value: 0, pattern: 'solid' }
                   ]}>
                     <defs>
                       <pattern id="dots" patternUnits="userSpaceOnUse" width="4" height="4">
                         <rect width="4" height="4" fill="hsl(var(--chart-1))" opacity="0.3"/>
                         <circle cx="2" cy="2" r="1" fill="hsl(var(--chart-1))"/>
                       </pattern>
                       <pattern id="stripes" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                         <rect width="4" height="4" fill="hsl(var(--chart-1))" opacity="0.3"/>
                         <rect width="2" height="4" fill="hsl(var(--chart-1))"/>
                       </pattern>
                     </defs>
                     <Bar dataKey="value" radius={2}>
                       {(analytics?.weeklyEngagement?.map((day, index) => ({
                         name: day.day,
                         value: Math.max(1, Math.ceil(analytics.totalAgents / 7)),
                         pattern: ['dots', 'stripes', 'solid'][index % 3]
                       })) || []).map((entry, index) => (
                         <Cell 
                           key={`cell-${index}`} 
                           fill={entry.pattern === 'solid' ? 'hsl(var(--chart-1))' : `url(#${entry.pattern})`} 
                         />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversations</p>
                  <p className="text-3xl font-semibold">{analytics?.totalConversations || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics?.totalConversations > 0 ? 'Active conversations' : 'No conversations yet'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
               <div className="h-16">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={analytics?.weeklyEngagement?.map((day, index) => ({
                     name: day.day,
                     value: day.messages,
                     pattern: ['stripes', 'dots', 'solid'][index % 3]
                   })) || [
                     { name: 'Mon', value: 0, pattern: 'stripes' },
                     { name: 'Tue', value: 0, pattern: 'dots' },
                     { name: 'Wed', value: 0, pattern: 'stripes' },
                     { name: 'Thu', value: 0, pattern: 'solid' },
                     { name: 'Fri', value: 0, pattern: 'dots' },
                     { name: 'Sat', value: 0, pattern: 'stripes' },
                     { name: 'Sun', value: 0, pattern: 'solid' }
                   ]}>
                     <defs>
                       <pattern id="dots2" patternUnits="userSpaceOnUse" width="4" height="4">
                         <rect width="4" height="4" fill="hsl(var(--chart-1))" opacity="0.3"/>
                         <circle cx="2" cy="2" r="1" fill="hsl(var(--chart-1))"/>
                       </pattern>
                       <pattern id="stripes2" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                         <rect width="4" height="4" fill="hsl(var(--chart-1))" opacity="0.3"/>
                         <rect width="2" height="4" fill="hsl(var(--chart-1))"/>
                       </pattern>
                     </defs>
                     <Bar dataKey="value" radius={2}>
                       {(analytics?.weeklyEngagement?.map((day, index) => ({
                         name: day.day,
                         value: day.messages,
                         pattern: ['stripes2', 'dots2', 'solid'][index % 3]
                       })) || []).map((entry, index) => (
                         <Cell 
                           key={`cell-${index}`} 
                           fill={entry.pattern === 'solid' ? 'hsl(var(--chart-1))' : `url(#${entry.pattern})`} 
                         />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-semibold">{analytics?.activeUsers || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics?.activeUsers > 0 ? 'Unique users' : 'No active users'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
               <div className="h-16">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={analytics?.weeklyEngagement?.map(day => ({
                     name: day.day,
                     value: day.activeUsers,
                     gradient: true
                   })) || [
                     { name: 'Mon', value: 0, gradient: true },
                     { name: 'Tue', value: 0, gradient: true },
                     { name: 'Wed', value: 0, gradient: true },
                     { name: 'Thu', value: 0, gradient: true },
                     { name: 'Fri', value: 0, gradient: true },
                     { name: 'Sat', value: 0, gradient: true },
                     { name: 'Sun', value: 0, gradient: true }
                   ]}>
                     <defs>
                       <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity="1"/>
                         <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity="0.6"/>
                       </linearGradient>
                     </defs>
                     <Bar dataKey="value" fill="url(#userGradient)" radius={2} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Performance</p>
                  <p className="text-3xl font-semibold">{analytics ? `${Math.round(analytics.performance)}%` : '100%'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Success rate</p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
               <div className="h-16">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={analytics?.weeklyEngagement?.map(day => ({
                     name: day.day,
                     value: analytics.performance || 100,
                     gradient: true
                   })) || [
                     { name: 'Mon', value: 100, gradient: true },
                     { name: 'Tue', value: 100, gradient: true },
                     { name: 'Wed', value: 100, gradient: true },
                     { name: 'Thu', value: 100, gradient: true },
                     { name: 'Fri', value: 100, gradient: true },
                     { name: 'Sat', value: 100, gradient: true },
                     { name: 'Sun', value: 100, gradient: true }
                   ]}>
                     <defs>
                       <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity="1"/>
                         <stop offset="50%" stopColor="hsl(var(--chart-1))" stopOpacity="0.8"/>
                         <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity="0.4"/>
                       </linearGradient>
                     </defs>
                     <Bar dataKey="value" fill="url(#performanceGradient)" radius={2} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="agents" className="space-y-6" data-tour="dashboard-tabs">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-card border py-2 h-12 content-center">
            <TabsTrigger value="agents">My Agents</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="developer">Developer</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            {agents.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Agents Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first AI agent to get started
                  </p>
                  <Button onClick={() => navigate('/create-agent')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Agent
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour="agents-grid">
                {agents.map((agent) => (
                  <Card key={agent.id} className="hover:shadow-lg transition-shadow duration-200" data-tour="agent-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Bot className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              {agent.is_public ? (
                                <Badge variant="secondary" className="text-xs">
                                  <Globe className="w-3 h-3 mr-1" />
                                  Public
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {agent.description || "No description provided"}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/chat/${agent.id}`)}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAgent(agent)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex gap-1">
                          {!agent.is_public && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublishAgent(agent)}
                            >
                              <Globe className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>


          <TabsContent value="community" className="space-y-6">
            <div className="space-y-4">
              <CommunityFeatures />
              <PredictiveAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="developer" className="space-y-6">
            <div className="space-y-4">
              <DeveloperAPIPortal />
              <ThirdPartyIntegrations />
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {publishingAgent && (
          <PublishAgentModal
            agent={publishingAgent}
            open={isPublishModalOpen}
            onOpenChange={(open) => {
              setIsPublishModalOpen(open);
              if (!open) setPublishingAgent(null);
            }}
            onAgentUpdated={handleAgentPublished}
          />
        )}

        {/* Tours */}
        <DashboardTour 
          isOpen={showDashboardTour}
          onClose={() => setShowDashboardTour(false)}
        />
        <CommunityFeaturesTour 
          isOpen={isCommunityTourOpen} 
          onClose={() => setIsCommunityTourOpen(false)} 
        />
        <DeveloperAPITour 
          isOpen={isDeveloperTourOpen} 
          onClose={() => setIsDeveloperTourOpen(false)} 
        />
        <ThirdPartyIntegrationsTour 
          isOpen={isIntegrationsTourOpen} 
          onClose={() => setIsIntegrationsTourOpen(false)} 
        />
        <PredictiveAnalyticsTour 
          isOpen={isAnalyticsTourOpen} 
          onClose={() => setIsAnalyticsTourOpen(false)} 
        />
      </div>
    </DashboardLayout>
  );
};