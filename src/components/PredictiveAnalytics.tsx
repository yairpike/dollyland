import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Zap,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity
} from "lucide-react";

interface PredictionData {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

interface AgentPerformance {
  id: string;
  name: string;
  currentRating: number;
  predictedRating: number;
  userGrowth: number;
  revenueProjection: number;
  riskFactors: string[];
  opportunities: string[];
}

interface MarketInsight {
  category: string;
  demand: number;
  competition: number;
  opportunity: number;
  forecast: string;
}

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export const PredictiveAnalytics: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [revenueProjection, setRevenueProjection] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictiveData();
  }, []);

  const fetchPredictiveData = async () => {
    setLoading(true);
    // Simulate AI-powered analytics - replace with real ML models
    setTimeout(() => {
      setPredictions([
        {
          metric: 'Agent Performance',
          current: 78,
          predicted: 85,
          confidence: 92,
          trend: 'up',
          period: 'Next 30 days'
        },
        {
          metric: 'User Engagement',
          current: 65,
          predicted: 72,
          confidence: 88,
          trend: 'up',
          period: 'Next 30 days'
        },
        {
          metric: 'Revenue Growth',
          current: 12500,
          predicted: 15800,
          confidence: 85,
          trend: 'up',
          period: 'Next 30 days'
        },
        {
          metric: 'Market Share',
          current: 8.2,
          predicted: 7.8,
          confidence: 75,
          trend: 'down',
          period: 'Next 30 days'
        }
      ]);

      setAgentPerformance([
        {
          id: '1',
          name: 'Sales Assistant Pro',
          currentRating: 4.2,
          predictedRating: 4.6,
          userGrowth: 23,
          revenueProjection: 8500,
          riskFactors: ['Increasing competition', 'Feature gaps'],
          opportunities: ['New integrations', 'Enterprise expansion']
        },
        {
          id: '2',
          name: 'Customer Support AI',
          currentRating: 4.7,
          predictedRating: 4.8,
          userGrowth: 15,
          revenueProjection: 12200,
          riskFactors: ['Resource constraints'],
          opportunities: ['Multilingual support', 'Advanced analytics']
        }
      ]);

      setMarketInsights([
        { category: 'Sales', demand: 85, competition: 72, opportunity: 78, forecast: 'High growth potential' },
        { category: 'Support', demand: 92, competition: 68, opportunity: 88, forecast: 'Market leader position' },
        { category: 'Marketing', demand: 76, competition: 85, opportunity: 65, forecast: 'Saturated market' },
        { category: 'HR', demand: 68, competition: 45, opportunity: 82, forecast: 'Emerging opportunity' }
      ]);

      setPerformanceData([
        { month: 'Jan', actual: 78, predicted: 75, users: 1200 },
        { month: 'Feb', actual: 82, predicted: 80, users: 1450 },
        { month: 'Mar', actual: 85, predicted: 83, users: 1680 },
        { month: 'Apr', actual: 79, predicted: 85, users: 1520 },
        { month: 'May', actual: 88, predicted: 87, users: 1890 },
        { month: 'Jun', actual: 92, predicted: 90, users: 2100 },
        { month: 'Jul', actual: null, predicted: 94, users: 2350 },
        { month: 'Aug', actual: null, predicted: 96, users: 2580 }
      ]);

      setRevenueProjection([
        { month: 'Jan', revenue: 12500, projection: 12200 },
        { month: 'Feb', revenue: 14200, projection: 13800 },
        { month: 'Mar', revenue: 15800, projection: 15200 },
        { month: 'Apr', revenue: 13900, projection: 16800 },
        { month: 'May', revenue: 18600, projection: 18200 },
        { month: 'Jun', revenue: 21400, projection: 20500 },
        { month: 'Jul', revenue: null, projection: 23200 },
        { month: 'Aug', revenue: null, projection: 25800 }
      ]);

      setLoading(false);
    }, 1500);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Analyzing data with AI models...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Predictive Analytics</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Predictions</TabsTrigger>
          <TabsTrigger value="market">Market Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{prediction.metric}</CardTitle>
                  {getTrendIcon(prediction.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {prediction.metric.includes('Revenue') 
                      ? `$${prediction.predicted.toLocaleString()}`
                      : `${prediction.predicted}${prediction.metric.includes('Share') ? '%' : ''}`
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Current: {prediction.metric.includes('Revenue') 
                      ? `$${prediction.current.toLocaleString()}`
                      : `${prediction.current}${prediction.metric.includes('Share') ? '%' : ''}`
                    }
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Confidence</span>
                      <span className={getConfidenceColor(prediction.confidence)}>
                        {prediction.confidence}%
                      </span>
                    </div>
                    <Progress value={prediction.confidence} className="mt-1" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {prediction.period}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Prediction vs Reality</CardTitle>
                <CardDescription>AI-predicted performance compared to actual results</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual" strokeWidth={2} />
                    <Line type="monotone" dataKey="predicted" stroke="#82ca9d" name="Predicted" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Projection</CardTitle>
                <CardDescription>Revenue forecasting with confidence intervals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueProjection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" name="Actual Revenue" />
                    <Area type="monotone" dataKey="projection" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="Projected Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="space-y-4">
            {agentPerformance.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>{agent.name}</span>
                    </CardTitle>
                    <Badge variant="outline">
                      Growth: +{agent.userGrowth}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current Rating</span>
                        <span className="text-lg font-bold">{agent.currentRating}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Predicted Rating</span>
                        <span className="text-lg font-bold text-green-600">{agent.predictedRating}</span>
                      </div>
                      <Progress value={(agent.predictedRating / 5) * 100} className="mt-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm font-medium">Revenue Projection</span>
                      </div>
                      <div className="text-2xl font-bold">${agent.revenueProjection.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Next 30 days</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">User Growth</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">+{agent.userGrowth}%</div>
                      <p className="text-xs text-muted-foreground">Projected growth</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Risk Factors</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {agent.riskFactors.map((risk, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Opportunities</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {agent.opportunities.map((opportunity, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full" />
                            <span>{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Market Opportunity Analysis</span>
              </CardTitle>
              <CardDescription>
                AI-powered analysis of market demand, competition, and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketInsights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{insight.category}</h4>
                      <Badge variant="outline">{insight.forecast}</Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Demand</span>
                          <span className="font-medium">{insight.demand}%</span>
                        </div>
                        <Progress value={insight.demand} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Competition</span>
                          <span className="font-medium">{insight.competition}%</span>
                        </div>
                        <Progress value={insight.competition} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Opportunity</span>
                          <span className="font-medium">{insight.opportunity}%</span>
                        </div>
                        <Progress value={insight.opportunity} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span>Immediate Actions</span>
                </CardTitle>
                <CardDescription>High-impact recommendations for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Optimize Sales Assistant prompts</p>
                    <p className="text-sm text-muted-foreground">Predicted 15% performance improvement</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Launch customer support in Spanish</p>
                    <p className="text-sm text-muted-foreground">Target 200+ new users this month</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Implement dynamic pricing model</p>
                    <p className="text-sm text-muted-foreground">Estimated 12% revenue increase</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <span>Strategic Initiatives</span>
                </CardTitle>
                <CardDescription>Long-term opportunities for maximum impact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Develop HR agent templates</p>
                    <p className="text-sm text-muted-foreground">Untapped market with 82% opportunity score</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Enterprise partnership program</p>
                    <p className="text-sm text-muted-foreground">Projected 300% revenue growth potential</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">API marketplace expansion</p>
                    <p className="text-sm text-muted-foreground">Enable 3rd-party developers ecosystem</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};