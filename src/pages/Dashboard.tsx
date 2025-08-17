import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, MessageSquare, Users, TrendingUp, Activity, Globe, Lock, Settings, Edit, Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CreateAgentModal } from "@/components/CreateAgentModal";
import { EditAgentModal } from "@/components/EditAgentModal";
import { PublishAgentModal } from "@/components/PublishAgentModal";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [publishingAgent, setPublishingAgent] = useState<Agent | null>(null);

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

  const handleAgentCreated = () => {
    fetchAgents();
    setIsCreateModalOpen(false);
  };

  const handleAgentUpdated = () => {
    fetchAgents();
    setIsEditModalOpen(false);
    setEditingAgent(null);
  };

  const handleAgentPublished = () => {
    fetchAgents();
    setIsPublishModalOpen(false);
    setPublishingAgent(null);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setIsEditModalOpen(true);
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your agents.</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="self-start sm:self-auto">
            <Plus className="w-5 h-5 mr-2" />
            Create Agent
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Agents</p>
                  <p className="text-3xl font-semibold text-blue-900 dark:text-blue-100">{agents.length}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+2 this week</p>
                </div>
                <div className="h-12 w-12 bg-blue-200 dark:bg-blue-800 rounded-xl flex items-center justify-center">
                  <Bot className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Conversations</p>
                  <p className="text-3xl font-semibold text-emerald-900 dark:text-emerald-100">156</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+12% vs last week</p>
                </div>
                <div className="h-12 w-12 bg-emerald-200 dark:bg-emerald-800 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border-violet-200 dark:border-violet-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Active Users</p>
                  <p className="text-3xl font-semibold text-violet-900 dark:text-violet-100">89</p>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">+5 today</p>
                </div>
                <div className="h-12 w-12 bg-violet-200 dark:bg-violet-800 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-violet-600 dark:text-violet-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Performance</p>
                  <p className="text-3xl font-semibold text-amber-900 dark:text-amber-100">98%</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Uptime</p>
                </div>
                <div className="h-12 w-12 bg-amber-200 dark:bg-amber-800 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="agents">My Agents</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
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
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Agent
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <Card key={agent.id} className="hover:shadow-lg transition-shadow duration-200">
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

          <TabsContent value="marketplace">
            <Card className="p-12">
              <div className="text-center">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Marketplace</h3>
                <p className="text-muted-foreground mb-6">
                  Discover and purchase AI agents from the community
                </p>
                <Button onClick={() => navigate('/marketplace')}>
                  Browse Marketplace
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CreateAgentModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onAgentCreated={handleAgentCreated}
        />

        {editingAgent && (
          <EditAgentModal
            agent={editingAgent}
            open={isEditModalOpen}
            onOpenChange={(open) => {
              setIsEditModalOpen(open);
              if (!open) setEditingAgent(null);
            }}
            onAgentUpdated={handleAgentUpdated}
          />
        )}

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
      </div>
    </DashboardLayout>
  );
};