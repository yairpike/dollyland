import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp, Users, MessageSquare, Bot, Activity, Eye, Clock, Star } from "lucide-react";

// Mock data for analytics
const monthlyData = [
  { month: 'Jan', conversations: 245, newUsers: 89, activeAgents: 12, satisfaction: 4.2 },
  { month: 'Feb', conversations: 312, newUsers: 127, activeAgents: 15, satisfaction: 4.3 },
  { month: 'Mar', conversations: 428, newUsers: 156, activeAgents: 18, satisfaction: 4.5 },
  { month: 'Apr', conversations: 534, newUsers: 203, activeAgents: 22, satisfaction: 4.4 },
  { month: 'May', conversations: 672, newUsers: 267, activeAgents: 28, satisfaction: 4.6 },
  { month: 'Jun', conversations: 789, newUsers: 312, activeAgents: 34, satisfaction: 4.7 },
];

const weeklyEngagement = [
  { day: 'Mon', messages: 124, activeUsers: 67 },
  { day: 'Tue', messages: 156, activeUsers: 89 },
  { day: 'Wed', messages: 189, activeUsers: 102 },
  { day: 'Thu', messages: 167, activeUsers: 94 },
  { day: 'Fri', messages: 201, activeUsers: 118 },
  { day: 'Sat', messages: 145, activeUsers: 78 },
  { day: 'Sun', messages: 132, activeUsers: 72 },
];

const agentPerformance = [
  { name: 'Design Assistant', usage: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Code Helper', usage: 28, color: 'hsl(var(--chart-2))' },
  { name: 'Content Writer', usage: 22, color: 'hsl(var(--chart-3))' },
  { name: 'Data Analyst', usage: 15, color: 'hsl(var(--chart-4))' },
];

const responseTimeData = [
  { hour: '00:00', avgResponse: 2.1 },
  { hour: '04:00', avgResponse: 1.8 },
  { hour: '08:00', avgResponse: 3.2 },
  { hour: '12:00', avgResponse: 4.1 },
  { hour: '16:00', avgResponse: 3.8 },
  { hour: '20:00', avgResponse: 2.9 },
];

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const statsCards = [
    {
      title: "Total Conversations",
      value: "2,847",
      change: "+12.5%",
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      title: "Active Users",
      value: "1,234",
      change: "+8.2%",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Agent Sessions",
      value: "5,621",
      change: "+15.7%",
      icon: Bot,
      color: "text-purple-600"
    },
    {
      title: "Avg Response Time",
      value: "2.8s",
      change: "-5.1%",
      icon: Clock,
      color: "text-orange-600"
    }
  ];

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
                    <AreaChart data={monthlyData.slice(-7)}>
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
                      <LineChart data={monthlyData}>
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
                      <BarChart data={weeklyEngagement}>
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
                    <AreaChart data={responseTimeData}>
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
                          data={agentPerformance}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="usage"
                        >
                          {agentPerformance.map((entry, index) => (
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
                      <LineChart data={monthlyData}>
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
                      <AreaChart data={monthlyData}>
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
                      <BarChart data={weeklyEngagement}>
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