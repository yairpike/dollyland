import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { AudioRecorder, encodeAudioForAPI, playAudioData } from '@/utils/RealtimeAudio';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

interface RealtimeChatProps {
  agentId: string;
  agentName: string;
}

export const RealtimeChat: React.FC<RealtimeChatProps> = ({ agentId, agentName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentTranscriptRef = useRef<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'assistant', content: string, isAudio = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isAudio
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const connectToRealtime = async () => {
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      // Initialize audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      // Connect to WebSocket
      const wsUrl = `wss://fzdetwatsinsftunljir.functions.supabase.co/functions/v1/realtime-chat?agentId=${agentId}`;
      console.log('Connecting to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        toast.success(`Connected to ${agentName}`);
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.type);

        switch (data.type) {
          case 'response.audio.delta':
            if (audioEnabled && audioContextRef.current) {
              // Convert base64 to Uint8Array
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              await playAudioData(audioContextRef.current, bytes);
              setIsSpeaking(true);
            }
            break;

          case 'response.audio.done':
            setIsSpeaking(false);
            break;

          case 'response.audio_transcript.delta':
            currentTranscriptRef.current += data.delta;
            break;

          case 'response.audio_transcript.done':
            if (currentTranscriptRef.current.trim()) {
              addMessage('assistant', currentTranscriptRef.current.trim(), true);
              currentTranscriptRef.current = '';
            }
            break;

          case 'conversation.item.input_audio_transcription.completed':
            if (data.transcript.trim()) {
              addMessage('user', data.transcript.trim(), true);
            }
            break;

          case 'error':
            console.error('OpenAI error:', data);
            toast.error('AI response error');
            break;
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsConnecting(false);
        setIsRecording(false);
        setIsSpeaking(false);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        toast.error('Connection failed');
      };

    } catch (error) {
      console.error('Error connecting:', error);
      setIsConnecting(false);
      toast.error('Failed to connect');
    }
  };

  const disconnect = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
  };

  const startRecording = async () => {
    if (!isConnected || isRecording) return;

    try {
      audioRecorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });

      await audioRecorderRef.current.start();
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    setIsRecording(false);
    console.log('Recording stopped');
  };

  const sendTextMessage = () => {
    if (!isConnected || !inputValue.trim()) return;

    const message = inputValue.trim();
    
    // Input validation
    if (message.length > 4000) {
      toast.error('Message too long (max 4000 characters)');
      return;
    }
    
    // Basic content filtering
    if (message.match(/(ignore.*(previous|above|system)|forget.*(instructions|prompt)|you.*(are|must).*(now|instead)|override|jailbreak)/i)) {
      toast.error('Message contains prohibited content');
      return;
    }
    
    addMessage('user', message);
    
    // Send to OpenAI
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: message
            }
          ]
        }
      }));
      
      wsRef.current.send(JSON.stringify({
        type: 'response.create'
      }));
    }
    
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  <Bot className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{agentName}</CardTitle>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline">Disconnected</Badge>
                  )}
                  {isSpeaking && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Volume2 className="w-3 h-3 mr-1" />
                      Speaking
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              
              {!isConnected ? (
                <Button 
                  onClick={connectToRealtime}
                  disabled={isConnecting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </Button>
              ) : (
                <Button variant="outline" onClick={disconnect}>
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with {agentName}</p>
                  <p className="text-sm mt-1">Connect and speak or type your message</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'assistant' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.isAudio && (
                      <div className="flex items-center gap-1 mt-1 opacity-70">
                        <Volume2 className="w-3 h-3" />
                        <span className="text-xs">Audio</span>
                      </div>
                    )}
                  </div>
                  
                  {message.type === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Type a message (max 4000 chars)..." : "Connect to start chatting"}
                disabled={!isConnected}
                maxLength={4000}
              />
              <Button
                onClick={sendTextMessage}
                disabled={!isConnected || !inputValue.trim()}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={!isConnected}
              className="px-3"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
          
          {isConnected && (
            <p className="text-xs text-muted-foreground mt-2">
              Hold the mic button to speak, or type your message
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};