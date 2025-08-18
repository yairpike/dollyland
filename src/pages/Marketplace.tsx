import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, Filter, Users, Play, Briefcase, Code, Palette, BarChart, MessageSquare, FileText, Brain, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PublicAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  user_count: number;
  creator_name: string;
  tags: string[];
  is_featured: boolean;
}

const AGENT_CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: Filter },
  { id: 'business', name: 'Business', icon: Briefcase },
  { id: 'development', name: 'Development', icon: Code },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'analytics', name: 'Analytics', icon: BarChart },
  { id: 'communication', name: 'Communication', icon: MessageSquare },
  { id: 'content', name: 'Content', icon: FileText },
  { id: 'ai', name: 'AI & ML', icon: Brain },
  { id: 'productivity', name: 'Productivity', icon: Zap }
];

// Mock data for demonstration
const FEATURED_AGENTS: PublicAgent[] = [
  {
    id: '1',
    name: 'Design System Pro',
    description: 'Expert in creating and maintaining design systems. Specialized in component libraries, design tokens, and design consistency.',
    category: 'design',
    rating: 4.8,
    user_count: 1420,
    creator_name: 'Sarah Chen',
    tags: ['Design Systems', 'Components', 'Figma', 'CSS'],
    is_featured: true
  },
  {
    id: '2', 
    name: 'Code Review Assistant',
    description: 'Advanced code reviewer with expertise in security, performance, and best practices across multiple programming languages.',
    category: 'development',
    rating: 4.9,
    user_count: 2100,
    creator_name: 'Alex Rodriguez',
    tags: ['Code Review', 'Security', 'Best Practices', 'Multiple Languages'],
    is_featured: true
  },
  {
    id: '3',
    name: 'Content Strategy Expert',
    description: 'AI agent specialized in content planning, SEO optimization, and social media strategy for businesses of all sizes.',
    category: 'content',
    rating: 4.7,
    user_count: 890,
    creator_name: 'Emma Thompson',
    tags: ['Content Strategy', 'SEO', 'Social Media', 'Marketing'],
    is_featured: false
  },
  {
    id: '4',
    name: 'Data Analytics Wizard',
    description: 'Transform your data into actionable insights with advanced analytics, visualization, and predictive modeling capabilities.',
    category: 'analytics',
    rating: 4.6,
    user_count: 650,
    creator_name: 'Michael Park',
    tags: ['Data Analysis', 'Visualization', 'Machine Learning', 'Python'],
    is_featured: false
  },
  {
    id: '5',
    name: 'Business Process Optimizer',
    description: 'Streamline your operations with AI-powered process analysis, workflow optimization, and efficiency recommendations.',
    category: 'business',
    rating: 4.5,
    user_count: 420,
    creator_name: 'Lisa Wang',
    tags: ['Process Optimization', 'Workflow', 'Efficiency', 'Automation'],
    is_featured: false
  },
  {
    id: '6',
    name: 'React Performance Expert',
    description: 'Specialized in React optimization, bundle analysis, and modern development practices for high-performance applications.',
    category: 'development',
    rating: 4.8,
    user_count: 1100,
    creator_name: 'David Kim',
    tags: ['React', 'Performance', 'Optimization', 'Web Vitals'],
    is_featured: false
  }
]

export const Marketplace = () => {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<PublicAgent[]>(FEATURED_AGENTS)
  const [filteredAgents, setFilteredAgents] = useState<PublicAgent[]>(FEATURED_AGENTS)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPublicAgents()
  }, [])

  useEffect(() => {
    filterAgents()
  }, [selectedCategory, searchQuery, agents])

  const fetchPublicAgents = async () => {
    try {
      const { data: publicAgents, error } = await supabase
        .from('agents')
        .select('id, name, description, category, tags, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching public agents:', error)
        setAgents(FEATURED_AGENTS)
        return
      }

      if (publicAgents && publicAgents.length > 0) {
        // Transform the data to match our interface
        const transformedAgents = publicAgents.map(agent => ({
          id: agent.id,
          name: agent.name || 'Unnamed Agent',
          description: agent.description || 'No description available',
          category: agent.category || 'general',
          rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5
          user_count: Math.floor(Math.random() * 1000) + 100,
          creator_name: 'Dolly Expert',
          tags: Array.isArray(agent.tags) ? agent.tags : (agent.tags ? [agent.tags] : ['AI Agent']),
          is_featured: Math.random() > 0.7
        }))

        setAgents(transformedAgents)
      } else {
        // Fallback to mock data if no agents found
        setAgents(FEATURED_AGENTS)
      }
    } catch (error) {
      console.error('Unexpected error fetching agents:', error)
      setAgents(FEATURED_AGENTS)
    }
  }

  const filterAgents = () => {
    let filtered = agents

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(agent => agent.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.tags.some(tag => tag.toLowerCase().includes(query)) ||
        agent.creator_name.toLowerCase().includes(query)
      )
    }

    setFilteredAgents(filtered)
  }

  const handleTryAgent = async (agentId: string) => {
    toast.success("Starting trial conversation...")
    navigate(`/trial/${agentId}`)
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = AGENT_CATEGORIES.find(cat => cat.id === categoryId)
    return category?.icon || Filter
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-semibold mb-4">Agent Marketplace</h1>
        <p className="text-xl text-muted-foreground">Discover and try AI agents built by expert designers and developers</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-4xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents, skills, or tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-50">
            {AGENT_CATEGORIES.map((category) => {
              const IconComponent = category.icon
              return (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    {category.name}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div>
        <p className="text-muted-foreground">
          Showing {filteredAgents.length} of {agents.length} agents
          {selectedCategory !== 'all' && (
            <span> in {AGENT_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}</span>
          )}
        </p>
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            >
              Clear filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            const CategoryIcon = getCategoryIcon(agent.category)
            return (
              <Card key={agent.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CategoryIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {agent.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-muted-foreground ml-1">
                              {agent.rating}
                            </span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span className="text-sm ml-1">
                              {agent.user_count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {agent.is_featured && (
                      <Badge variant="secondary" className="text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {agent.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-1">
                    {agent.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {agent.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {agent.creator_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {agent.creator_name}
                      </span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={() => handleTryAgent(agent.id)}
                      className="gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Try Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Marketplace;
