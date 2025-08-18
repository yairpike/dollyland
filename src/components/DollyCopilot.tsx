import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingAnimation } from "./LoadingAnimation";
import { Send, MessageCircle, X, Minimize2, Maximize2, Loader2, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DollyCopilotProps {
  context?: string;
}

export const DollyCopilot = ({ context = 'general' }: DollyCopilotProps) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey there! 👋 I'm Dolly, your comprehensive AI copilot. I'm here to help you with everything - from basic Dolly features to complex external setups!

🚀 **I can help you with:**

**Inside Dolly:**
• Creating & configuring agents step-by-step
• Setting up knowledge bases and file uploads
• Configuring AI providers (OpenAI, Anthropic, etc.)
• Setting up integrations & workflows
• Publishing to marketplace

**Outside Dolly (for non-technical users):**
• Getting API keys from OpenAI, GitHub, Linear, Vercel
• Setting up external accounts and services
• Configuring webhooks and domains
• Troubleshooting connection issues

Just ask me anything - I'll break it down into simple steps you can follow! 🎯`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getContextualGreeting = () => {
    switch (context) {
      case 'edit-agent':
        return "I see you're editing an agent! I can help with setup, integrations, API keys, and step-by-step configuration.";
      case 'dashboard':
        return "Welcome! I can guide you through creating agents, setting up integrations, or getting API keys from external services.";
      case 'marketplace':
        return "Browsing agents? I can help you find the right one or guide you through publishing your own to the marketplace!";
      case 'settings':
        return "Need help with settings? I can guide you through AI providers, integrations, and external service setup.";
      case 'create-agent':
        return "Creating a new agent? I'll help you with every step, from basic setup to advanced integrations!";
      default:
        return "I'm your complete guide for Dolly and all external setups! Ask me about anything - I'll break it down step by step.";
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are Dolly, a comprehensive AI copilot for an AI agent management platform. You specialize in helping both technical and non-technical users navigate every aspect of the platform, including external setup steps.

Current context: ${context}

You excel at providing step-by-step guidance for:

**DOLLY PLATFORM FEATURES:**
- Agent creation, configuration, and optimization
- Knowledge base setup and file upload
- AI provider configuration (OpenAI, Anthropic, DeepSeek)
- Integration setup (GitHub, Linear, Vercel, webhooks)
- Workflow and action creation
- Analytics and monitoring
- Publishing to marketplace
- User settings and preferences

**EXTERNAL SETUP FOR NON-TECHNICAL USERS:**
- Getting API keys from OpenAI, Anthropic, GitHub, Linear, Vercel
- Setting up GitHub repositories and access tokens
- Creating Linear workspaces and API keys
- Vercel account setup and deployment
- Webhook endpoint configuration
- Domain and SSL setup
- Third-party service account creation

**YOUR APPROACH:**
- Break complex tasks into simple, numbered steps
- Provide exact button names and UI elements to click
- Include screenshots when helpful (mention where they'd find things)
- Explain technical terms in simple language
- Offer alternatives for different skill levels
- Proactively suggest next steps
- Check user understanding before moving on

Always be encouraging, patient, and thorough. For external setups, provide actual URLs and specific instructions they can follow outside of Dolly.`
            },
            {
              role: 'user',
              content: userMessage.content
            }
          ]
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || "I'm here to help! Could you please rephrase your question?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again!",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const logoSrc = theme === 'light' ? '/lovable-uploads/c8c73254-3940-4a5b-b990-cb30d21dc890.png' : '/lovable-uploads/85abbc87-fafc-4307-86a1-f85ed74b639e.png';

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-16 rounded-xl shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 p-2"
          size="lg"
        >
          <img 
            src={logoSrc}
            alt="Dolly" 
            className="w-full h-full object-contain"
          />
        </Button>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="w-80 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src={logoSrc}
                  alt="Dolly" 
                  className="w-5 h-5"
                />
                <CardTitle className="text-sm">Dolly Copilot</CardTitle>
                <Badge variant="secondary" className="text-xs">Online</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(false)}
                  className="h-8 w-8 p-0"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-96 h-[600px] shadow-xl flex flex-col">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img 
                  src={logoSrc}
                  alt="Dolly" 
                  className="w-5 h-5 object-contain"
                />
                <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <CardTitle className="text-sm">Dolly Copilot</CardTitle>
              <Badge variant="secondary" className="text-xs">Online</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Dolly is thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Dolly anything..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {getContextualGreeting()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};