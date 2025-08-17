import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Send, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

interface Agent {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  instructions: string
}

export const Chat = () => {
  const { agentId } = useParams()
  const { user } = useAuth()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (agentId && user) {
      fetchAgent()
      createOrFetchConversation()
    }
  }, [agentId, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchAgent = async () => {
    if (!agentId) return

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single()

      if (error) throw error
      setAgent(data)
    } catch (error: any) {
      toast.error('Failed to load agent')
    }
  }

  const createOrFetchConversation = async () => {
    if (!agentId || !user) return

    try {
      // Check for existing conversation
      let { data: existingConversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (existingConversation) {
        setConversationId(existingConversation.id)
        fetchMessages(existingConversation.id)
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert([
            {
              agent_id: agentId,
              user_id: user.id,
              title: `Chat with ${agent?.name || 'Agent'}`
            }
          ])
          .select()
          .single()

        if (createError) throw createError
        setConversationId(newConversation.id)
      }
    } catch (error: any) {
      toast.error('Failed to create conversation')
    }
  }

  const fetchMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error: any) {
      toast.error('Failed to load messages')
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId || loading) return

    const userMessage = newMessage.trim()
    setNewMessage("")
    setLoading(true)

    try {
      // Add user message
      const { data: userMsgData, error: userMsgError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            role: 'user',
            content: userMessage
          }
        ])
        .select()
        .single()

      if (userMsgError) throw userMsgError

      setMessages(prev => [...prev, userMsgData])

      // Simulate AI response (in real app, this would call your AI service)
      const aiResponse = `I understand you said: "${userMessage}". As ${agent?.name}, I'm here to help based on my instructions: ${agent?.instructions?.slice(0, 100)}...`

      const { data: aiMsgData, error: aiMsgError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            role: 'assistant',
            content: aiResponse
          }
        ])
        .select()
        .single()

      if (aiMsgError) throw aiMsgError

      setMessages(prev => [...prev, aiMsgData])
    } catch (error: any) {
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Avatar>
            <AvatarImage src={agent.avatar_url || ''} />
            <AvatarFallback>
              {agent.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold">{agent.name}</h1>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={agent.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {agent.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <Card
                className={`max-w-[70%] p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </Card>
              {message.role === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {user?.email?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="w-8 h-8">
                <AvatarImage src={agent.avatar_url || ''} />
                <AvatarFallback className="text-xs">
                  {agent.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Card className="bg-card p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${agent.name}...`}
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !newMessage.trim()} variant="hero">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}