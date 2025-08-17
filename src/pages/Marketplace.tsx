import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/DashboardLayout"
import { supabase } from "@/integrations/supabase/client"
import { 
  Search, 
  Palette, 
  Code, 
  Layout, 
  Layers, 
  MessageCircle, 
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

export const Marketplace = () => {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<PublicAgent[]>(FEATURED_AGENTS)
  const [filteredAgents, setFilteredAgents] = useState<PublicAgent[]>(FEATURED_AGENTS)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load real public agents from database
    fetchPublicAgents()
  }, [])

  const fetchPublicAgents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('agents')
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
        .eq('is_public', true)
        .order('user_count', { ascending: false })

      if (error) throw error

      // Transform data to match our interface
      const transformedAgents = data?.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        avatar_url: agent.avatar_url,
        category: agent.category || 'ui-ux',
        rating: agent.rating || 4.5,
        user_count: agent.user_count || Math.floor(Math.random() * 1000) + 100,
        creator_name: 'Expert Creator', // We'll add proper creator names later
        tags: agent.tags || ['AI Agent'],
        is_featured: agent.is_featured || false
      })) || []

      // Mix real agents with demo data if we don't have enough
      const allAgents = transformedAgents.length > 0 
        ? [...transformedAgents, ...FEATURED_AGENTS.slice(transformedAgents.length)] 
        : FEATURED_AGENTS

      setAgents(allAgents)
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast.error('Failed to load agents')
      setAgents(FEATURED_AGENTS) // Fallback to demo data
    } finally {
      setLoading(false)
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
    // In production, this would create a trial conversation or demo
    toast.success("Starting trial conversation...")
    navigate(`/trial/${agentId}`)
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = AGENT_CATEGORIES.find(cat => cat.id === categoryId)
    return category?.icon || Filter
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Agent Marketplace</h1>
            <p className="text-muted-foreground">Discover and try AI agents built by expert designers and developers</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents, skills, or tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
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
            <DropdownMenuContent align="end">
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

        {/* Featured Section */}
        {selectedCategory === 'all' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Featured Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.filter(agent => agent.is_featured).map((agent) => {
                const CategoryIcon = getCategoryIcon(agent.category)
                return (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow duration-200">
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
                      <Badge variant="secondary">Featured</Badge>
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

                    <div className="flex gap-2">
                      <Button 
                        variant="secondary"
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleTryAgent(agent.id)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Try Now
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => navigate(`/agent/${agent.id}`)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* All Agents */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">
            {selectedCategory === 'all' ? 'All Agents' : AGENT_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
          </h2>
          
          {filteredAgents.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No agents found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => {
                const CategoryIcon = getCategoryIcon(agent.category)
                return (
                  <Card key={agent.id} className="hover:shadow-lg transition-shadow duration-200">
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

                      <div className="flex gap-2">
                        <Button 
                          variant="secondary"
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleTryAgent(agent.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Try Now
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={() => navigate(`/agent/${agent.id}`)}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Marketplace;