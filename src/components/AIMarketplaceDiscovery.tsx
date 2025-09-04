import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Users, 
  Brain, 
  Sparkles, 
  Target, 
  Clock,
  MessageSquare,
  Bot,
  Wand2,
  Globe,
  Zap,
  Award,
  BookOpen,
  Lightbulb
} from "lucide-react";

interface SmartAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  user_count: number;
  avatar_url?: string;
  creator_name: string;
  is_featured: boolean;
  is_verified: boolean;
  performance_score: number;
  response_time_ms: number;
  success_rate: number;
  specialties: string[];
  pricing_model: 'free' | 'usage' | 'subscription';
  usage_cost_cents?: number;
  created_at: string;
  last_updated: string;
  compatibility_score?: number;
  recommendation_reason?: string;
}

interface SearchFilters {
  category: string;
  rating: number;
  pricing: string;
  performance: number;
  tags: string[];
  sort_by: 'relevance' | 'rating' | 'popularity' | 'performance' | 'newest';
}

interface RecommendationEngine {
  user_preferences: string[];
  interaction_history: string[];
  success_patterns: string[];
  personalized_agents: SmartAgent[];
}

const CATEGORIES = [
  'All Categories',
  'Customer Support',
  'Content Creation',
  'Data Analysis',
  'Education',
  'Healthcare',
  'Finance',
  'Marketing',
  'Development',
  'Research',
  'Design',
  'Sales'
];

const PRICING_FILTERS = [
  'All Pricing',
  'Free',
  'Usage-based',
  'Subscription'
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'performance', label: 'Best Performance' },
  { value: 'newest', label: 'Newest' }
];

export const AIMarketplaceDiscovery = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [smartAgents, setSmartAgents] = useState<SmartAgent[]>([]);
  const [recommendedAgents, setRecommendedAgents] = useState<SmartAgent[]>([]);
  const [trendingAgents, setTrendingAgents] = useState<SmartAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'All Categories',
    rating: 0,
    pricing: 'All Pricing',
    performance: 0,
    tags: [],
    sort_by: 'relevance'
  });
  const [activeTab, setActiveTab] = useState('discovery');

  useEffect(() => {
    fetchAgents();
    fetchRecommendations();
    fetchTrendingAgents();
  }, [user, filters]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      // Generate mock smart agents with AI discovery features
      const mockAgents: SmartAgent[] = [
        {
          id: '1',
          name: 'CustomerCare Pro',
          description: 'Advanced AI agent specialized in customer support with emotional intelligence and multilingual capabilities',
          category: 'Customer Support',
          tags: ['support', 'multilingual', 'emotional-ai', 'escalation'],
          rating: 4.8,
          user_count: 2547,
          creator_name: 'SupportTech Inc',
          is_featured: true,
          is_verified: true,
          performance_score: 94.2,
          response_time_ms: 847,
          success_rate: 96.3,
          specialties: ['Technical Support', 'Billing Inquiries', 'Product Questions'],
          pricing_model: 'usage',
          usage_cost_cents: 15,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          compatibility_score: searchQuery ? Math.random() * 100 : undefined,
          recommendation_reason: 'Matches your customer service needs'
        },
        {
          id: '2',
          name: 'ContentGenius',
          description: 'Creative AI agent that generates high-quality content across multiple formats and industries',
          category: 'Content Creation',
          tags: ['writing', 'creative', 'marketing', 'seo'],
          rating: 4.6,
          user_count: 1823,
          creator_name: 'CreativeAI Labs',
          is_featured: true,
          is_verified: true,
          performance_score: 91.7,
          response_time_ms: 1245,
          success_rate: 89.4,
          specialties: ['Blog Posts', 'Social Media', 'Product Descriptions'],
          pricing_model: 'subscription',
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          compatibility_score: searchQuery ? Math.random() * 100 : undefined,
          recommendation_reason: 'Perfect for content marketing teams'
        },
        {
          id: '3',
          name: 'DataInsight Analyzer',
          description: 'Powerful data analysis agent that transforms raw data into actionable business insights',
          category: 'Data Analysis',
          tags: ['analytics', 'business-intelligence', 'reporting', 'visualization'],
          rating: 4.9,
          user_count: 967,
          creator_name: 'DataPro Solutions',
          is_featured: false,
          is_verified: true,
          performance_score: 97.1,
          response_time_ms: 2156,
          success_rate: 94.8,
          specialties: ['Statistical Analysis', 'Predictive Modeling', 'Data Visualization'],
          pricing_model: 'usage',
          usage_cost_cents: 25,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          compatibility_score: searchQuery ? Math.random() * 100 : undefined,
          recommendation_reason: 'Ideal for data-driven decision making'
        },
        {
          id: '4',
          name: 'EduMentor',
          description: 'Interactive educational agent that adapts to different learning styles and provides personalized tutoring',
          category: 'Education',
          tags: ['education', 'tutoring', 'adaptive-learning', 'assessment'],
          rating: 4.7,
          user_count: 3421,
          creator_name: 'EduTech Innovators',
          is_featured: true,
          is_verified: true,
          performance_score: 92.8,
          response_time_ms: 1034,
          success_rate: 91.2,
          specialties: ['Math Tutoring', 'Language Learning', 'Test Preparation'],
          pricing_model: 'free',
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          compatibility_score: searchQuery ? Math.random() * 100 : undefined,
          recommendation_reason: 'Great for educational institutions'
        },
        {
          id: '5',
          name: 'HealthAssist AI',
          description: 'Medical information agent providing preliminary health guidance and appointment scheduling',
          category: 'Healthcare',
          tags: ['medical', 'health', 'appointments', 'triage'],
          rating: 4.5,
          user_count: 1654,
          creator_name: 'MedTech Solutions',
          is_featured: false,
          is_verified: true,
          performance_score: 88.9,
          response_time_ms: 987,
          success_rate: 87.6,
          specialties: ['Symptom Assessment', 'Appointment Booking', 'Health Education'],
          pricing_model: 'subscription',
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          compatibility_score: searchQuery ? Math.random() * 100 : undefined,
          recommendation_reason: 'Compliant with healthcare standards'
        }
      ];

      // Apply filters
      let filteredAgents = mockAgents;

      if (filters.category !== 'All Categories') {
        filteredAgents = filteredAgents.filter(agent => agent.category === filters.category);
      }

      if (filters.rating > 0) {
        filteredAgents = filteredAgents.filter(agent => agent.rating >= filters.rating);
      }

      if (filters.pricing !== 'All Pricing') {
        const pricingMap: Record<string, string> = {
          'Free': 'free',
          'Usage-based': 'usage',
          'Subscription': 'subscription'
        };
        filteredAgents = filteredAgents.filter(agent => agent.pricing_model === pricingMap[filters.pricing]);
      }

      if (filters.performance > 0) {
        filteredAgents = filteredAgents.filter(agent => agent.performance_score >= filters.performance);
      }

      // Apply search query with AI-powered semantic matching
      if (searchQuery.trim()) {
        filteredAgents = filteredAgents.map(agent => ({
          ...agent,
          compatibility_score: calculateCompatibilityScore(agent, searchQuery),
          recommendation_reason: generateRecommendationReason(agent, searchQuery)
        })).filter(agent => (agent.compatibility_score || 0) > 30);
      }

      // Sort agents
      filteredAgents.sort((a, b) => {
        switch (filters.sort_by) {
          case 'rating':
            return b.rating - a.rating;
          case 'popularity':
            return b.user_count - a.user_count;
          case 'performance':
            return b.performance_score - a.performance_score;
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'relevance':
          default:
            return (b.compatibility_score || 0) - (a.compatibility_score || 0);
        }
      });

      setSmartAgents(filteredAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    
    try {
      // Generate personalized recommendations based on user behavior
      const mockRecommended = smartAgents.slice(0, 3).map(agent => ({
        ...agent,
        recommendation_reason: `Based on your previous ${agent.category.toLowerCase()} usage`
      }));
      setRecommendedAgents(mockRecommended);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchTrendingAgents = async () => {
    try {
      // Get trending agents based on recent activity
      const mockTrending = smartAgents
        .sort((a, b) => b.user_count - a.user_count)
        .slice(0, 4);
      setTrendingAgents(mockTrending);
    } catch (error) {
      console.error('Error fetching trending agents:', error);
    }
  };

  const calculateCompatibilityScore = (agent: SmartAgent, query: string): number => {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Name matching
    if (agent.name.toLowerCase().includes(queryLower)) score += 40;
    
    // Description matching
    if (agent.description.toLowerCase().includes(queryLower)) score += 30;
    
    // Category matching
    if (agent.category.toLowerCase().includes(queryLower)) score += 25;
    
    // Tags matching
    const matchingTags = agent.tags.filter(tag => 
      tag.toLowerCase().includes(queryLower) || queryLower.includes(tag.toLowerCase())
    );
    score += matchingTags.length * 15;
    
    // Specialties matching
    const matchingSpecialties = agent.specialties.filter(specialty =>
      specialty.toLowerCase().includes(queryLower) || queryLower.includes(specialty.toLowerCase())
    );
    score += matchingSpecialties.length * 10;
    
    // Boost for high-performing agents
    if (agent.performance_score > 90) score += 10;
    if (agent.rating > 4.5) score += 10;
    if (agent.is_verified) score += 5;

    return Math.min(score, 100);
  };

  const generateRecommendationReason = (agent: SmartAgent, query: string): string => {
    const reasons = [];
    
    if (agent.performance_score > 90) {
      reasons.push('high performance');
    }
    if (agent.rating > 4.5) {
      reasons.push('excellent ratings');
    }
    if (agent.user_count > 2000) {
      reasons.push('popular choice');
    }
    if (agent.is_verified) {
      reasons.push('verified creator');
    }
    
    const baseReason = `Perfect match for "${query}"`;
    if (reasons.length > 0) {
      return `${baseReason} • ${reasons.join(', ')}`;
    }
    return baseReason;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearFilters = () => {
    setFilters({
      category: 'All Categories',
      rating: 0,
      pricing: 'All Pricing',
      performance: 0,
      tags: [],
      sort_by: 'relevance'
    });
    setSearchQuery('');
  };

  const getPricingDisplay = (agent: SmartAgent) => {
    switch (agent.pricing_model) {
      case 'free':
        return <Badge className="bg-green-100 text-green-800">Free</Badge>;
      case 'usage':
        return <Badge variant="outline">${(agent.usage_cost_cents || 0) / 100} per use</Badge>;
      case 'subscription':
        return <Badge variant="outline">Subscription</Badge>;
      default:
        return <Badge variant="outline">Contact</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI-Powered Marketplace Discovery</h3>
          <p className="text-sm text-muted-foreground">
            Find the perfect AI agents with intelligent search and personalized recommendations
          </p>
        </div>
      </div>

      {/* AI Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Describe what you need... e.g., 'customer support agent with emotional intelligence'"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4"
            />
            {searchQuery && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Smart Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Smart Filters
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Min Rating</label>
              <Select
                value={filters.rating.toString()}
                onValueChange={(value) => setFilters(prev => ({ ...prev, rating: parseFloat(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.8">4.8+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pricing</label>
              <Select
                value={filters.pricing}
                onValueChange={(value) => setFilters(prev => ({ ...prev, pricing: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICING_FILTERS.map(pricing => (
                    <SelectItem key={pricing} value={pricing}>
                      {pricing}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Performance</label>
              <Select
                value={filters.performance.toString()}
                onValueChange={(value) => setFilters(prev => ({ ...prev, performance: parseFloat(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Performance</SelectItem>
                  <SelectItem value="80">80%+ Performance</SelectItem>
                  <SelectItem value="90">90%+ Performance</SelectItem>
                  <SelectItem value="95">95%+ Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={filters.sort_by}
                onValueChange={(value) => setFilters(prev => ({ ...prev, sort_by: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="discovery">Smart Discovery</TabsTrigger>
          <TabsTrigger value="recommended">For You</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="discovery" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {smartAgents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {agent.name}
                            {agent.is_verified && (
                              <Award className="w-4 h-4 text-blue-500" />
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            by {agent.creator_name}
                          </p>
                        </div>
                      </div>
                      {agent.is_featured && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {agent.description}
                    </p>

                    {agent.compatibility_score && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Compatibility Match</span>
                          <span className="font-medium">{agent.compatibility_score.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" 
                            style={{ width: `${agent.compatibility_score}%` }}
                          ></div>
                        </div>
                        {agent.recommendation_reason && (
                          <p className="text-xs text-muted-foreground">
                            {agent.recommendation_reason}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{agent.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{agent.user_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span>{agent.performance_score.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{agent.category}</Badge>
                      {getPricingDisplay(agent)}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {agent.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {agent.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{agent.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button className="w-full">
                        Try Agent
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <Badge variant="outline" className="text-xs">
                      Recommended for you
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          by {agent.creator_name}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {agent.description}
                  </p>
                  
                  {agent.recommendation_reason && (
                    <div className="p-2 bg-blue-50 rounded text-xs text-blue-700">
                      💡 {agent.recommendation_reason}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{agent.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{agent.user_count.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button className="w-full">
                    Try Recommended Agent
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingAgents.map((agent, index) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <Badge variant="outline" className="text-xs">
                      #{index + 1} Trending
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {agent.user_count.toLocaleString()} users
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium text-sm">{agent.rating}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {agent.category}
                  </Badge>
                  <Button size="sm" className="w-full">
                    Try Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};