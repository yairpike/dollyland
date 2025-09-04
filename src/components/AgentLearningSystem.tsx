import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Users, 
  MessageSquare,
  Zap,
  Settings,
  RefreshCw,
  Lightbulb,
  BarChart3,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Star
} from "lucide-react";

interface AgentLearningData {
  id: string;
  agent_id: string;
  agent_name: string;
  performance_score: number;
  total_interactions: number;
  success_rate: number;
  user_satisfaction: number;
  learning_insights: LearningInsight[];
  optimization_suggestions: OptimizationSuggestion[];
  performance_trends: PerformanceTrend[];
  created_at: string;
  updated_at: string;
}

interface LearningInsight {
  id: string;
  type: 'pattern' | 'improvement' | 'issue' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  created_at: string;
}

interface OptimizationSuggestion {
  id: string;
  category: 'prompt' | 'behavior' | 'knowledge' | 'performance';
  suggestion: string;
  expected_improvement: number;
  implementation_effort: 'low' | 'medium' | 'high';
  status: 'pending' | 'applied' | 'dismissed';
}

interface PerformanceTrend {
  date: string;
  performance_score: number;
  user_satisfaction: number;
  success_rate: number;
  interaction_count: number;
}

interface AgentLearningSystemProps {
  agentId: string;
}

export const AgentLearningSystem = ({ agentId }: AgentLearningSystemProps) => {
  const { user } = useAuth();
  const [learningData, setLearningData] = useState<AgentLearningData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchLearningData();
  }, [agentId]);

  const fetchLearningData = async () => {
    if (!agentId || !user) return;
    
    setLoading(true);
    try {
      // For demo purposes, generate mock learning data
      const mockLearningData: AgentLearningData = {
        id: '1',
        agent_id: agentId,
        agent_name: 'Sample Agent',
        performance_score: 87.5,
        total_interactions: 1247,
        success_rate: 92.3,
        user_satisfaction: 4.2,
        learning_insights: [
          {
            id: '1',
            type: 'pattern',
            title: 'High Success Rate with Technical Queries',
            description: 'Agent performs exceptionally well with technical support queries, achieving 96% success rate.',
            confidence: 0.89,
            impact: 'high',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            type: 'improvement',
            title: 'Response Time Optimization',
            description: 'Average response time has improved by 23% over the last week through learned optimizations.',
            confidence: 0.95,
            impact: 'medium',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            type: 'issue',
            title: 'Lower Performance on Emotional Support',
            description: 'Agent struggles with emotionally charged conversations, showing 15% lower satisfaction.',
            confidence: 0.76,
            impact: 'high',
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            type: 'opportunity',
            title: 'Potential for Multilingual Expansion',
            description: 'Usage patterns suggest strong demand for Spanish language support.',
            confidence: 0.68,
            impact: 'medium',
            created_at: new Date().toISOString()
          }
        ],
        optimization_suggestions: [
          {
            id: '1',
            category: 'prompt',
            suggestion: 'Add empathy training phrases to improve emotional response handling',
            expected_improvement: 15,
            implementation_effort: 'low',
            status: 'pending'
          },
          {
            id: '2',
            category: 'knowledge',
            suggestion: 'Expand knowledge base with more recent technical documentation',
            expected_improvement: 8,
            implementation_effort: 'medium',
            status: 'pending'
          },
          {
            id: '3',
            category: 'behavior',
            suggestion: 'Implement context-aware response length adjustment',
            expected_improvement: 12,
            implementation_effort: 'high',
            status: 'applied'
          }
        ],
        performance_trends: generatePerformanceTrends(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setLearningData(mockLearningData);
    } catch (error) {
      console.error('Error fetching learning data:', error);
      toast.error('Failed to load learning data');
    } finally {
      setLoading(false);
    }
  };

  function generatePerformanceTrends(): PerformanceTrend[] {
    const trends = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        performance_score: 75 + Math.random() * 25,
        user_satisfaction: 3.5 + Math.random() * 1.5,
        success_rate: 85 + Math.random() * 15,
        interaction_count: Math.floor(20 + Math.random() * 60)
      });
    }
    
    return trends;
  }

  const applyOptimization = async (suggestionId: string) => {
    try {
      setLearningData(prev => prev ? {
        ...prev,
        optimization_suggestions: prev.optimization_suggestions.map(s =>
          s.id === suggestionId ? { ...s, status: 'applied' as const } : s
        )
      } : null);
      toast.success('Optimization applied successfully!');
    } catch (error) {
      console.error('Error applying optimization:', error);
      toast.error('Failed to apply optimization');
    }
  };

  const dismissOptimization = async (suggestionId: string) => {
    try {
      setLearningData(prev => prev ? {
        ...prev,
        optimization_suggestions: prev.optimization_suggestions.map(s =>
          s.id === suggestionId ? { ...s, status: 'dismissed' as const } : s
        )
      } : null);
      toast.success('Optimization dismissed');
    } catch (error) {
      console.error('Error dismissing optimization:', error);
      toast.error('Failed to dismiss optimization');
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'improvement': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'issue': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'opportunity': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      default: return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!learningData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Brain className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No learning data available</h3>
          <p className="text-sm text-muted-foreground text-center">
            Agent needs more interactions to generate learning insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agent Learning System</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered insights and continuous improvement for your agent
          </p>
        </div>
        <Button variant="outline" onClick={fetchLearningData} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Performance Score</p>
                <p className="text-2xl font-bold">{learningData.performance_score.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Interactions</p>
                <p className="text-2xl font-bold">{learningData.total_interactions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">{learningData.success_rate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">User Satisfaction</p>
                <p className="text-2xl font-bold">{learningData.user_satisfaction.toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Learning Insights</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Performance</span>
                      <span>{learningData.performance_score.toFixed(1)}%</span>
                    </div>
                    <Progress value={learningData.performance_score} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Success Rate</span>
                      <span>{learningData.success_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={learningData.success_rate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>User Satisfaction</span>
                      <span>{((learningData.user_satisfaction / 5) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(learningData.user_satisfaction / 5) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Learning Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Insights</span>
                    <Badge variant="secondary">{learningData.learning_insights.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Optimizations</span>
                    <Badge variant="secondary">
                      {learningData.optimization_suggestions.filter(s => s.status === 'pending').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Applied Optimizations</span>
                    <Badge variant="default">
                      {learningData.optimization_suggestions.filter(s => s.status === 'applied').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-3">
            {learningData.learning_insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getImpactColor(insight.impact)}`}
                        >
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <div className="space-y-3">
            {learningData.optimization_suggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {suggestion.category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getEffortColor(suggestion.implementation_effort)}`}
                        >
                          {suggestion.implementation_effort} effort
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          +{suggestion.expected_improvement}% improvement
                        </Badge>
                      </div>
                      <p className="text-sm">{suggestion.suggestion}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {suggestion.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyOptimization(suggestion.id)}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Apply
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissOptimization(suggestion.id)}
                          >
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            Dismiss
                          </Button>
                        </>
                      )}
                      {suggestion.status === 'applied' && (
                        <Badge className="bg-green-100 text-green-800">Applied</Badge>
                      )}
                      {suggestion.status === 'dismissed' && (
                        <Badge variant="outline">Dismissed</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Trends (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={learningData.performance_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="performance_score" 
                      stroke="#3b82f6" 
                      name="Performance Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="user_satisfaction" 
                      stroke="#10b981" 
                      name="User Satisfaction"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="success_rate" 
                      stroke="#f59e0b" 
                      name="Success Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};