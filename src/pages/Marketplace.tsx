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
import { AIMarketplaceDiscovery } from "@/components/AIMarketplaceDiscovery";
import { MarketplaceDiscoveryTour } from "@/components/tours/MarketplaceDiscoveryTour";
import { useTourManager } from "@/components/OnboardingTour";

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

// Fallback demo data only when no real agents are available
const FALLBACK_AGENTS: PublicAgent[] = []

export const Marketplace = () => {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<PublicAgent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<PublicAgent[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { shouldShowTour } = useTourManager()
  const [showMarketplaceTour, setShowMarketplaceTour] = useState(false)

  useEffect(() => {
    fetchPublicAgents()
  }, [])

  useEffect(() => {
    if (shouldShowTour('marketplace-discovery')) {
      setShowMarketplaceTour(true)
    }
  }, [shouldShowTour])

  useEffect(() => {
    filterAgents()
  }, [selectedCategory, searchQuery, agents])

  const fetchPublicAgents = async () => {
    try {
      // Fetch real public agents from database
      const { data: publicAgents, error } = await supabase
        .from('agents')
        .select('id, name, description, avatar_url, category, rating, user_count, tags, is_featured')
        .eq('is_public', true)
        .order('rating', { ascending: false })

      if (error) {
        console.error('Error fetching marketplace agents:', error)
        setAgents([])
        return
      }

      if (publicAgents && publicAgents.length > 0) {
        // Transform the data to match our interface
        const transformedAgents = publicAgents.map(agent => {
          // Smart category assignment based on name/description if category is missing
          let category = agent.category
          if (!category || !AGENT_CATEGORIES.find(cat => cat.id === category)) {
            const name = (agent.name || '').toLowerCase()
            const desc = (agent.description || '').toLowerCase()
            
            if (name.includes('design') || desc.includes('design') || desc.includes('ui') || desc.includes('ux')) {
              category = 'design'
            } else if (name.includes('sales') || desc.includes('sales') || desc.includes('b2b')) {
              category = 'business'
            } else if (name.includes('success') || desc.includes('customer') || desc.includes('support')) {
              category = 'communication'
            } else if (name.includes('growth') || desc.includes('growth') || desc.includes('marketing')) {
              category = 'analytics'
            } else if (name.includes('api') || name.includes('dev') || desc.includes('developer') || desc.includes('code')) {
              category = 'development'
            } else if (name.includes('pm') || name.includes('product') || desc.includes('product management')) {
              category = 'business'
            } else if (name.includes('content') || desc.includes('content') || desc.includes('writing')) {
              category = 'content'
            } else {
              category = 'productivity' // Default fallback
            }
          }

          return {
            id: agent.id,
            name: agent.name || 'Unnamed Agent',
            description: agent.description || 'No description available',
            category,
            rating: agent.rating || 0,
            user_count: agent.user_count || 0,
            creator_name: 'Community Creator',
            tags: Array.isArray(agent.tags) ? agent.tags : (agent.tags ? [agent.tags] : ['AI Agent']),
            is_featured: agent.is_featured || false
          }
        })

        setAgents(transformedAgents)
      } else {
        // No agents found, set empty array
        setAgents([])
      }
    } catch (error) {
      console.error('Unexpected error fetching marketplace agents:', error)
      setAgents([])
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
      <div data-tour="marketplace-header">
        <h1 className="text-3xl font-semibold mb-4">Agent Marketplace</h1>
        <p className="text-sm text-muted-foreground">Discover and try AI agents built by expert designers and developers</p>
      </div>

      {/* AI Marketplace Discovery */}
      <div data-tour="ai-search">
        <AIMarketplaceDiscovery />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-4xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents, skills, or tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 h-9"
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
              <Card key={agent.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                      <CategoryIcon className="w-6 h-6 text-primary" />
                    </div>
                    {agent.is_featured && (
                      <Badge variant="secondary" className="text-xs font-semibold bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {agent.name}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-foreground">
                          {agent.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {agent.user_count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-5 pt-0">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                    <Avatar className="w-8 h-8 border-2 border-background shadow-sm">
                      <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                        {agent.creator_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {agent.creator_name}
                      </span>
                      <p className="text-xs text-muted-foreground">Creator</p>
                    </div>
                  </div>

                  <CardDescription className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {agent.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-2">
                    {agent.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs font-medium bg-background/80 border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-colors">
                        {tag}
                      </Badge>
                    ))}
                    {agent.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs font-medium bg-muted/50 border-border/50">
                        +{agent.tags.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <Button 
                    size="sm" 
                    onClick={() => handleTryAgent(agent.id)}
                    className="w-full gap-2 font-semibold shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-primary to-primary/90"
                  >
                    <Play className="w-4 h-4" />
                    Try Now
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Marketplace Discovery Tour */}
      <MarketplaceDiscoveryTour 
        isOpen={showMarketplaceTour}
        onClose={() => setShowMarketplaceTour(false)}
      />
    </div>
  )
}

export default Marketplace;
