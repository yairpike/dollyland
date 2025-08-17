import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Star, 
  DollarSign, 
  Clock,
  Download,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsData {
  totalConversations: number;
  totalUsers: number;
  averageRating: number;
  totalRevenue: number;
  averageSessionDuration: number;
  conversationsByDay: Array<{ date: string; conversations: number }>;
  integrationUsage: Array<{ type: string; count: number }>;
  satisfactionScores: Array<{ score: number; count: number }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
}

interface AgentAnalyticsProps {
  agentId: string;
  agentName: string;
}

export const AgentAnalytics: React.FC<AgentAnalyticsProps> = ({ agentId, agentName }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [agentId, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Fetch detailed analytics
      const { data: detailedAnalytics, error: analyticsError } = await supabase
        .from('detailed_analytics')
        .select('*')
        .eq('agent_id', agentId)
        .gte('created_at', startDate.toISOString());

      if (analyticsError) throw analyticsError;

      // Fetch reviews for rating
      const { data: reviews, error: reviewsError } = await supabase
        .from('agent_reviews')
        .select('rating')
        .eq('agent_id', agentId);

      if (reviewsError) throw reviewsError;

      // Process data
      const totalConversations = detailedAnalytics?.filter(a => a.event_type === 'conversation_started').length || 0;
      const uniqueUsers = new Set(detailedAnalytics?.map(a => a.user_id)).size;
      const averageRating = reviews?.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;
      const totalRevenue = detailedAnalytics?.reduce((sum, a) => sum + (a.revenue_generated || 0), 0) || 0;
      
      const sessionDurations = detailedAnalytics?.filter(a => a.session_duration).map(a => a.session_duration) || [];
      const averageSessionDuration = sessionDurations.length > 0
        ? sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length
        : 0;

      // Conversations by day
      const conversationsByDay = Array.from({ length: daysAgo }, (_, i) => {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayConversations = detailedAnalytics?.filter(a => 
          a.event_type === 'conversation_started' && 
          a.created_at.startsWith(dateStr)
        ).length || 0;
        
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          conversations: dayConversations
        };
      });

      // Integration usage
      const integrationCounts: Record<string, number> = {};
      detailedAnalytics?.forEach(a => {
        if (a.integration_type) {
          integrationCounts[a.integration_type] = (integrationCounts[a.integration_type] || 0) + 1;
        }
      });
      
      const integrationUsage = Object.entries(integrationCounts).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count
      }));

      // Satisfaction scores
      const satisfactionCounts: Record<number, number> = {};
      detailedAnalytics?.forEach(a => {
        if (a.satisfaction_score) {
          satisfactionCounts[a.satisfaction_score] = (satisfactionCounts[a.satisfaction_score] || 0) + 1;
        }
      });
      
      const satisfactionScores = Object.entries(satisfactionCounts).map(([score, count]) => ({
        score: parseInt(score),
        count
      })).sort((a, b) => a.score - b.score);

      // Revenue by day
      const revenueByDay = Array.from({ length: daysAgo }, (_, i) => {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayRevenue = detailedAnalytics?.filter(a => 
          a.created_at.startsWith(dateStr)
        ).reduce((sum, a) => sum + (a.revenue_generated || 0), 0) || 0;
        
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: dayRevenue
        };
      });

      setAnalytics({
        totalConversations,
        totalUsers: uniqueUsers,
        averageRating,
        totalRevenue,
        averageSessionDuration,
        conversationsByDay,
        integrationUsage,
        satisfactionScores,
        revenueByDay
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Conversations', analytics.totalConversations],
      ['Total Users', analytics.totalUsers],
      ['Average Rating', analytics.averageRating.toFixed(2)],
      ['Total Revenue', `$${analytics.totalRevenue.toFixed(2)}`],
      ['Average Session Duration', `${Math.round(analytics.averageSessionDuration / 60)} minutes`],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agentName}-analytics-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No analytics data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Analytics for {agentName}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Conversations</p>
                <p className="text-2xl font-bold">{analytics.totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">{analytics.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Session</p>
                <p className="text-2xl font-bold">{Math.round(analytics.averageSessionDuration / 60)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-card border">
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversations Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Conversations Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.conversationsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="conversations" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Integration Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.integrationUsage.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.integrationUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.integrationUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No integration data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Satisfaction Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.satisfactionScores.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.satisfactionScores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No satisfaction data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};