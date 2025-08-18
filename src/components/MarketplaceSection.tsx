import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { supabase } from "@/integrations/supabase/client"
import { 
  Search, 
  Palette, 
  Code, 
  Layout, 
  Layers, 
  Play,
  Star,
  Users,
  Filter,
  ChevronDown
} from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PublicAgent {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  category: string
  rating: number
  user_count: number
  creator_name: string
  tags: string[]
  is_featured: boolean
}

const AGENT_CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: Filter },
  { id: 'ui-ux', name: 'UI/UX Design', icon: Palette },
  { id: 'product', name: 'Product Design', icon: Layout },
  { id: 'frontend', name: 'Frontend Dev', icon: Code },
  { id: 'fullstack', name: 'Fullstack Builder', icon: Layers },
]

// Mock data for demo - in production this would come from database
const FEATURED_AGENTS: PublicAgent[] = [
  {
    id: '1',
    name: 'Design System Pro',
    description: 'Expert in creating and maintaining design systems. Specialized in component libraries, tokens, and design consistency.',
    avatar_url: null,
    category: 'ui-ux',
    rating: 4.9,
    user_count: 1247,
    creator_name: 'Sarah Chen',
    tags: ['Design Systems', 'Components', 'Figma', 'Tokens'],
    is_featured: true
  },
  {
    id: '2', 
    name: 'Fullstack Architect',
    description: 'End-to-end product builder. From user research to deployment. Combines design thinking with technical execution.',
    avatar_url: null,
    category: 'fullstack',
    rating: 4.8,
    user_count: 892,
    creator_name: 'Alex Rivera',
    tags: ['React', 'Node.js', 'User Research', 'MVP'],
    is_featured: true
  },
  {
    id: '3',
    name: 'UX Research Assistant',
    description: 'Helps conduct user interviews, analyze feedback, and create actionable insights for product decisions.',
    avatar_url: null,
    category: 'product',
    rating: 4.7,
    user_count: 634,
    creator_name: 'Maya Patel',
    tags: ['User Research', 'Analytics', 'Insights', 'Strategy'],
    is_featured: true
  },
  {
    id: '4',
    name: 'Frontend Performance Expert',
    description: 'Optimizes React applications for performance. Specializes in Core Web Vitals, bundle optimization, and user experience.',
    avatar_url: null,
    category: 'frontend',
    rating: 4.9,
    user_count: 756,
    creator_name: 'David Kim',
    tags: ['React', 'Performance', 'Optimization', 'Web Vitals'],
    is_featured: false
  }
]

export const MarketplaceSection = () => {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<PublicAgent[]>(FEATURED_AGENTS)
  const [filteredAgents, setFilteredAgents] = useState<PublicAgent[]>(FEATURED_AGENTS)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Load real public agents from database
    fetchPublicAgents()
  }, [])

  const fetchPublicAgents = async () => {
    try {
      // Use the new security-hardened marketplace view for authenticated users
      const { data, error } = await supabase
        .from('marketplace_agents_authenticated')
        .select(`
          id,
          name,
          description,
          avatar_url,
          category,
          tags,
          rating,
          user_count,
          is_featured
        `)
        .order('user_count', { ascending: false })

      if (error) {
        console.error('Error fetching marketplace agents:', error)
        
        // Fallback to public preview if authentication fails
        try {
          const { data: previewData, error: previewError } = await supabase
            .from('marketplace_agents_preview')
            .select('*')
            .order('created_month', { ascending: false })
          
          if (previewError) throw previewError
          
          const transformedPreview = previewData?.map(agent => ({
            id: agent.id,
            name: agent.name,
            description: agent.description,
            avatar_url: agent.avatar_url,
            category: agent.category || 'ui-ux',
            rating: agent.rating || 4.5,
            user_count: 500, // Use placeholder for preview
            creator_name: 'Dolly Expert',
            tags: agent.tags || ['AI Agent'],
            is_featured: agent.is_featured || false
          })) || []
          
          setAgents(transformedPreview.length > 0 ? transformedPreview : FEATURED_AGENTS)
          return
        } catch (fallbackError) {
          setAgents(FEATURED_AGENTS)
          return
        }
      }

      // Transform authenticated data to match our interface
      const transformedAgents = data?.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        avatar_url: agent.avatar_url,
        category: agent.category || 'ui-ux',
        rating: agent.rating || 4.5,
        user_count: agent.user_count || 500,
        creator_name: 'Dolly Expert',
        tags: agent.tags || ['AI Agent'],
        is_featured: agent.is_featured || false
      })) || []

      // Mix real agents with demo data if we don't have enough
      const allAgents = transformedAgents.length > 0 
        ? [...transformedAgents, ...FEATURED_AGENTS.slice(transformedAgents.length)] 
        : FEATURED_AGENTS

      setAgents(allAgents)
    } catch (error) {
      console.error('Unexpected error fetching marketplace agents:', error)
      setAgents(FEATURED_AGENTS) // Fallback to demo data
    }
  }

  useEffect(() => {
    filterAgents()
  }, [selectedCategory, searchQuery, agents])

  const filterAgents = () => {
    let filtered = agents

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(agent => agent.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(query) ||
        agent.description?.toLowerCase().includes(query) ||
        agent.tags.some(tag => tag.toLowerCase().includes(query))
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
    <section id="marketplace" className="py-24 px-6 bg-gradient-to-br from-muted/10 to-accent/5">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-4">Marketplace</Badge>
          <h2 className="text-4xl md:text-5xl font-semibold mb-4">
            Explore AI
            <span className="block bg-gradient-primary bg-clip-text text-transparent">Agents</span>
          </h2>
          <p className="text-xl text-muted-foreground">Discover and try AI agents built by expert designers and developers</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents, skills, or tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="sm:w-auto">
                <Filter className="w-4 h-4 mr-2" />
                {AGENT_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card backdrop-blur-md border border-border z-50">
              {AGENT_CATEGORIES.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Agent Grid */}
        <div className="space-y-8">
          {filteredAgents.length === 0 ? (
            <Card className="text-center py-16 bg-gradient-card border-0">
              <CardContent>
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No agents found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAgents.map((agent, index) => {
                const CategoryIcon = getCategoryIcon(agent.category)
                return (
                  <Card key={agent.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <CategoryIcon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">by {agent.creator_name}</p>
                          </div>
                        </div>
                        {agent.is_featured && <Badge variant="secondary">Featured</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {agent.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {agent.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {agent.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{agent.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{agent.user_count.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                        <Button 
                          variant="default"
                          size="sm" 
                          className="w-full shadow-lg"
                          onClick={() => handleTryAgent(agent.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Try Now
                        </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => navigate('/marketplace')}>
            View Full Marketplace
          </Button>
        </div>
      </div>
    </section>
  );
};