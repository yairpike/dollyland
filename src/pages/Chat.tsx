import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, ArrowLeft, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface Agent {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  system_prompt: string | null;
}

interface Conversation {
  id: string;
  title: string | null;
  agent: Agent;
}

export const Chat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !agentId) return;
    fetchAgent();
    fetchConversations();
  }, [user, agentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchAgent = async () => {
    if (!agentId) return;
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (error) throw error;
      setAgent(data);
    } catch (error: any) {
      console.error('Error fetching agent:', error);
      toast.error("Failed to load agent");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    if (!agentId || !user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          agent:agents(id, name, description, avatar_url, system_prompt)
        `)
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type the messages properly from database
      const typedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        created_at: msg.created_at
      }));
      
      setMessages(typedMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast.error("Failed to load messages");
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    fetchMessages(conversation.id);
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !agent || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: 'temp-user',
      content: messageContent,
      role: 'user',
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Call the chat edge function
      const response = await supabase.functions.invoke('chat', {
        body: {
          message: messageContent,
          agentId: agent.id,
          conversationId: currentConversation?.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send message');
      }

      const { response: aiResponse, conversationId } = response.data;

      // If this was a new conversation, update the current conversation
      if (!currentConversation && conversationId) {
        await fetchConversations();
        // Find and select the new conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .select(`
            id,
            title,
            agent:agents(id, name, description, avatar_url, system_prompt)
          `)
          .eq('id', conversationId)
          .single();

        if (!convError && newConv) {
          setCurrentConversation(newConv);
        }
      }

      // Remove temp message and add both real messages
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== 'temp-user');
        return [
          ...withoutTemp,
          {
            id: `user-${Date.now()}`,
            content: messageContent,
            role: 'user' as const,
            created_at: new Date().toISOString()
          },
          {
            id: `ai-${Date.now()}`,
            content: aiResponse,
            role: 'assistant' as const,
            created_at: new Date().toISOString()
          }
        ];
      });

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || "Failed to send message");
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== 'temp-user'));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Agent not found</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex">
      {/* Sidebar - Conversations */}
      <div className="w-80 bg-card border-r border-border/50 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={agent.avatar_url || ''} />
              <AvatarFallback>
                {agent.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-semibold">{agent.name}</h2>
              <p className="text-sm text-muted-foreground">
                {agent.description || "AI Assistant"}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={startNewConversation}
          >
            New Conversation
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                currentConversation?.id === conversation.id ? 'bg-accent' : ''
              }`}
              onClick={() => selectConversation(conversation)}
            >
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">
                  {conversation.title || 'New Conversation'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-card border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={agent.avatar_url || ''} />
                <AvatarFallback>
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{agent.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  AI Assistant
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
              <p className="text-muted-foreground">
                Ask {agent.name} anything to get started!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src={agent.avatar_url || ''} />
                    <AvatarFallback>
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          
          {sending && (
            <div className="flex gap-3 justify-start">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback>
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-card border-t border-border/50 p-4">
          <div className="flex gap-2">
            <Input
              placeholder={`Message ${agent.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              size="icon"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};