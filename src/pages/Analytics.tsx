import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp, Users, MessageSquare, Bot, Activity, Eye, Clock, Star } from "lucide-react";
import { useRealAnalytics } from "@/hooks/useRealAnalytics";

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const { analytics, loading, error } = useRealAnalytics(timeRange);

  // Default values while loading
  const defaultData = {
    totalConversations: 0,
    activeUsers: 0,
    agentSessions: 0,
    avgResponseTime: 0,
    monthlyTrends: [],
    weeklyEngagement: [],
    agentPerformance: [],
    responseTimeData: []
  };

  const data = analytics || defaultData;

  const statsCards = [
    {
      title: "Total Conversations",
      value: data.totalConversations?.toLocaleString() || "0",
      change: "+12.5%",
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      title: "Active Users",
      value: data.activeUsers?.toLocaleString() || "0",
      change: "+8.2%",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Agent Sessions",
      value: (data.totalConversations * 1.2)?.toLocaleString() || "0",
      change: "+15.7%",
      icon: Bot,
      color: "text-purple-600"
    },
    {
      title: "Avg Response Time",
      value: data.avgResponseTime ? `${data.avgResponseTime.toFixed(1)}s` : "0.0s",
      change: "-5.1%",
      icon: Clock,
      color: "text-orange-600"
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load analytics: {error}</p>
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
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <p className="text-muted-foreground">Monitor your AI agents' performance and user engagement</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={timeRange === '7d' ? 'default' : 'outline'} 
                   className="cursor-pointer" onClick={() => setTimeRange('7d')}>
              7 days
            </Badge>
            <Badge variant={timeRange === '30d' ? 'default' : 'outline'} 
                   className="cursor-pointer" onClick={() => setTimeRange('30d')}>
              30 days
            </Badge>
            <Badge variant={timeRange === '90d' ? 'default' : 'outline'} 
                   className="cursor-pointer" onClick={() => setTimeRange('90d')}>
              90 days
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-semibold">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} vs last period
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                  <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.monthlyTrends.slice(-7)}>
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity="0.4"/>
                            <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity="0.1"/>
                          </linearGradient>
                        </defs>
                        <Area 
                          type="monotone" 
                          dataKey="conversations" 
                          stroke="hsl(var(--chart-1))" 
                          fill={`url(#gradient-${index})`}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-card border py-2 h-12">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Monthly Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="conversations" 
                          stroke="hsl(var(--chart-1))" 
                          strokeWidth={3}
                          name="Conversations"
                          dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="newUsers" 
                          stroke="hsl(var(--chart-2))" 
                          strokeWidth={3}
                          name="New Users"
                          dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Weekly Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.weeklyEngagement}>
                        <defs>
                          <pattern id="messageStripes" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                            <rect width="4" height="4" fill="hsl(var(--chart-1))" opacity="0.3"/>
                            <rect width="2" height="4" fill="hsl(var(--chart-1))"/>
                          </pattern>
                          <pattern id="userDots" patternUnits="userSpaceOnUse" width="4" height="4">
                            <rect width="4" height="4" fill="hsl(var(--chart-2))" opacity="0.3"/>
                            <circle cx="2" cy="2" r="1" fill="hsl(var(--chart-2))"/>
                          </pattern>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="messages" fill="url(#messageStripes)" name="Messages" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="activeUsers" fill="url(#userDots)" name="Active Users" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Response Time Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Response Time Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.responseTimeData}>
                        <defs>
                        <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity="0.6"/>
                          <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity="0.1"/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="avgResponse" 
                        stroke="hsl(var(--chart-3))" 
                        fill="url(#responseGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Agent Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Agent Usage Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.agentPerformance}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="usage"
                        >
                          {data.agentPerformance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Agent Satisfaction */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Satisfaction Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[4.0, 5.0]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="satisfaction" 
                          stroke="hsl(var(--chart-4))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--chart-4))', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.monthlyTrends}>
                        <defs>
                          <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity="0.6"/>
                            <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity="0.1"/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="newUsers" 
                          stroke="hsl(var(--chart-1))" 
                          fill="url(#userGrowthGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* User Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Daily Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.weeklyEngagement}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar 
                          dataKey="activeUsers" 
                          fill="hsl(var(--chart-1))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};