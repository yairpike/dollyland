import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Header } from "@/components/Header"
import { 
  Send, 
  ArrowLeft, 
  Star, 
  Users, 
  Clock,
  Zap,
  MessageCircle,
  Download,
  Share
} from "lucide-react"
import { toast } from "sonner"

interface TrialMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AgentProfile {
  id: string
  name: string
  description: string
  avatar_url: string | null
  category: string
  rating: number
  user_count: number
  creator_name: string
  tags: string[]
  sample_prompts: string[]
}

// Mock agent data - in production this would come from the marketplace API
const TRIAL_AGENT: AgentProfile = {
  id: '1',
  name: 'Design System Pro',
  description: 'Expert in creating and maintaining design systems. Specialized in component libraries, tokens, and design consistency.',
  avatar_url: null,
  category: 'ui-ux',
  rating: 4.9,
  user_count: 1247,
  creator_name: 'Sarah Chen',
  tags: ['Design Systems', 'Components', 'Figma', 'Tokens'],
  sample_prompts: [
    "Help me create a color token system for my design system",
    "What are best practices for component documentation?",
    "How do I ensure design-dev handoff consistency?",
    "Review my button component variants"
  ]
}

export const AgentTrial = () => {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const [agent, setAgent] = useState<AgentProfile | null>(null)
  const [messages, setMessages] = useState<TrialMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [trialTimeRemaining, setTrialTimeRemaining] = useState(300) // 5 minutes

  useEffect(() => {
    // In production, fetch agent details from API
    setAgent(TRIAL_AGENT)
    
    // Add welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hi! I'm ${TRIAL_AGENT.name}. I'm specialized in ${TRIAL_AGENT.description.toLowerCase()}. 

This is a 5-minute trial - feel free to ask me anything about design systems, component libraries, or design-development workflow. 

Try one of these sample questions or ask your own:`,
      timestamp: new Date()
    }])

    // Start trial timer
    const timer = setInterval(() => {
      setTrialTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          toast.info("Trial ended. Sign up to continue chatting!")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [agentId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || trialTimeRemaining <= 0) return

    const userMessage: TrialMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response - in production this would call the agent API
    setTimeout(() => {
      const assistantMessage: TrialMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `That's a great question about ${input.toLowerCase()}! In my experience working with design systems, I'd recommend considering the following approach:

1. Start with your core brand values and visual principles
2. Define your atomic-level tokens (colors, typography, spacing)
3. Build up to component-level patterns
4. Document everything with clear usage guidelines
5. Establish a review and governance process

This ensures consistency across your entire product ecosystem. Would you like me to dive deeper into any of these areas?`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleSamplePrompt = (prompt: string) => {
    setInput(prompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading agent...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      <Header />
      <div className="max-w-6xl mx-auto p-4 pt-20">
        {/* Trial Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/marketplace')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="font-mono text-orange-500">
                Trial: {formatTime(trialTimeRemaining)}
              </span>
            </div>
          </div>

          <Card className="p-6 bg-gradient-card border-primary/20">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-start gap-4 flex-1">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={agent.avatar_url || ''} />
                  <AvatarFallback className="text-lg">
                    {agent.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold mb-2">{agent.name}</h1>
                  <p className="text-muted-foreground mb-3">{agent.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{agent.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{agent.user_count.toLocaleString()} users</span>
                    </div>
                    <span>by {agent.creator_name}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 md:w-48">
                <Button className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Get Full Access
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sample Prompts Sidebar */}
          <div className="md:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Try These</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {agent.sample_prompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full text-left h-auto p-3 text-wrap"
                    onClick={() => handleSamplePrompt(prompt)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{prompt}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Chat with {agent.name}</CardTitle>
                  {trialTimeRemaining <= 0 && (
                    <Badge variant="destructive">Trial Ended</Badge>
                  )}
                </div>
              </CardHeader>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      trialTimeRemaining <= 0 
                        ? "Trial ended - sign up to continue" 
                        : "Ask me about design systems..."
                    }
                    disabled={isLoading || trialTimeRemaining <= 0}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading || trialTimeRemaining <= 0}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {trialTimeRemaining <= 60 && trialTimeRemaining > 0 && (
                  <p className="text-sm text-orange-500 mt-2">
                    ⚠️ Trial ending soon! Sign up to keep this conversation.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentTrial;