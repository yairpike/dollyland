import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Brain, MessageSquare, Lightbulb, Trash2, Clock, Users, Star } from "lucide-react";

interface MemoryEntry {
  id: string;
  type: 'conversation' | 'learning' | 'preference';
  content: string;
  importance: number;
  context: any;
  created_at: string;
  last_accessed: string;
  access_count: number;
}

interface AgentMemorySettings {
  enabled: boolean;
  max_entries: number;
  retention_days: number;
  learning_enabled: boolean;
  context_aware: boolean;
}

interface AgentMemoryProps {
  agentId: string;
}

export const AgentMemory = ({ agentId }: AgentMemoryProps) => {
  const { user } = useAuth();
  const [memoryEntries, setMemoryEntries] = useState<MemoryEntry[]>([]);
  const [settings, setSettings] = useState<AgentMemorySettings>({
    enabled: true,
    max_entries: 1000,
    retention_days: 30,
    learning_enabled: true,
    context_aware: true
  });
  const [loading, setLoading] = useState(false);
  const [newMemory, setNewMemory] = useState({
    type: 'learning' as 'conversation' | 'learning' | 'preference',
    content: '',
    importance: 5
  });

  useEffect(() => {
    fetchMemoryData();
    fetchSettings();
  }, [agentId]);

  const fetchMemoryData = async () => {
    if (!agentId) return;
    
    setLoading(true);
    try {
      // Use existing conversation data for memory demo
      const { data, error } = await supabase
        .from('conversations')
        .select('*, messages(*)')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Convert conversations to memory entries
      const memoryData = data?.flatMap(conv => 
        conv.messages?.map(msg => ({
          id: msg.id,
          type: 'conversation' as const,
          content: msg.content.substring(0, 200) + '...',
          importance: 5,
          context: { conversation_id: conv.id },
          created_at: msg.created_at,
          last_accessed: msg.created_at,
          access_count: 1
        })) || []
      ) || [];
      
      setMemoryEntries(memoryData);
    } catch (error) {
      console.error('Error fetching memory:', error);
      toast.error('Failed to load agent memory');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    if (!agentId) return;
    
    try {
      // Use agent settings for demo
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        // Use agent data as memory settings base
        setSettings(prev => ({ ...prev, enabled: true }));
      }
    } catch (error) {
      console.error('Error fetching memory settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AgentMemorySettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      // For demo, just store settings locally
      toast.success('Memory settings updated (demo mode)');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const addMemoryEntry = async () => {
    if (!user || !newMemory.content.trim()) return;

    try {
      // For demo, add to local state
      const newEntry = {
        id: crypto.randomUUID(),
        type: newMemory.type,
        content: newMemory.content,
        importance: newMemory.importance,
        context: {},
        created_at: new Date().toISOString(),
        last_accessed: new Date().toISOString(),
        access_count: 0
      };
      
      setMemoryEntries(prev => [newEntry, ...prev]);
      toast.success('Memory entry added (demo mode)');
      setNewMemory({ type: 'learning', content: '', importance: 5 });
    } catch (error) {
      console.error('Error adding memory:', error);
      toast.error('Failed to add memory entry');
    }
  };

  const deleteMemoryEntry = async (entryId: string) => {
    try {
      setMemoryEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success('Memory entry deleted (demo mode)');
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast.error('Failed to delete memory entry');
    }
  };

  const clearAllMemory = async () => {
    try {
      setMemoryEntries([]);
      toast.success('All memory cleared (demo mode)');
    } catch (error) {
      console.error('Error clearing memory:', error);
      toast.error('Failed to clear memory');
    }
  };

  const getMemoryTypeIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return MessageSquare;
      case 'learning':
        return Lightbulb;
      case 'preference':
        return Star;
      default:
        return Brain;
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'bg-red-100 text-red-800';
    if (importance >= 6) return 'bg-yellow-100 text-yellow-800';
    if (importance >= 4) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const memoryStats = {
    total: memoryEntries.length,
    conversations: memoryEntries.filter(e => e.type === 'conversation').length,
    learnings: memoryEntries.filter(e => e.type === 'learning').length,
    preferences: memoryEntries.filter(e => e.type === 'preference').length,
    avgImportance: memoryEntries.length > 0 
      ? (memoryEntries.reduce((sum, e) => sum + e.importance, 0) / memoryEntries.length).toFixed(1)
      : '0.0'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agent Memory</h3>
          <p className="text-sm text-muted-foreground">
            Configure how your agent learns and remembers from conversations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="memory-enabled">Enable Memory</Label>
          <Switch
            id="memory-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => updateSettings({ enabled })}
          />
        </div>
      </div>

      {/* Memory Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Memories</p>
                <p className="text-2xl font-bold">{memoryStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Conversations</p>
                <p className="text-2xl font-bold">{memoryStats.conversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Learnings</p>
                <p className="text-2xl font-bold">{memoryStats.learnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Avg Importance</p>
                <p className="text-2xl font-bold">{memoryStats.avgImportance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="entries" className="w-full">
        <TabsList>
          <TabsTrigger value="entries">Memory Entries</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="add">Add Memory</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          {memoryEntries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Brain className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No memories yet</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Your agent will start building memory as it has conversations and learns
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {memoryEntries.map((entry) => {
                const IconComponent = getMemoryTypeIcon(entry.type);
                return (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10 mt-1">
                            <IconComponent className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="capitalize">
                                {entry.type}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={getImportanceColor(entry.importance)}
                              >
                                Importance: {entry.importance}/10
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {new Date(entry.created_at).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="w-3 h-3" />
                                Used {entry.access_count} times
                              </div>
                            </div>
                            <p className="text-sm">{entry.content}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMemoryEntry(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Configuration</CardTitle>
              <CardDescription>
                Configure how your agent handles memory and learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="max-entries">Maximum Memory Entries</Label>
                  <Input
                    id="max-entries"
                    type="number"
                    value={settings.max_entries}
                    onChange={(e) => updateSettings({ max_entries: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Older memories will be removed when this limit is reached
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retention-days">Retention Period (Days)</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    value={settings.retention_days}
                    onChange={(e) => updateSettings({ retention_days: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Memories older than this will be automatically deleted
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="learning-enabled">Enable Learning</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow agent to learn from conversations and improve responses
                    </p>
                  </div>
                  <Switch
                    id="learning-enabled"
                    checked={settings.learning_enabled}
                    onCheckedChange={(learning_enabled) => updateSettings({ learning_enabled })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="context-aware">Context Awareness</Label>
                    <p className="text-sm text-muted-foreground">
                      Use conversation context to enhance memory relevance
                    </p>
                  </div>
                  <Switch
                    id="context-aware"
                    checked={settings.context_aware}
                    onCheckedChange={(context_aware) => updateSettings({ context_aware })}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={clearAllMemory}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Memory
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  This action cannot be undone
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Memory Entry</CardTitle>
              <CardDescription>
                Manually add important information for your agent to remember
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Memory Type</Label>
                <div className="flex gap-2">
                  {['learning', 'preference', 'conversation'].map((type) => (
                    <Button
                      key={type}
                      variant={newMemory.type === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewMemory(prev => ({ ...prev, type: type as any }))}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="memory-content">Memory Content</Label>
                <Textarea
                  id="memory-content"
                  value={newMemory.content}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter what you want the agent to remember..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="importance">Importance (1-10)</Label>
                <Input
                  id="importance"
                  type="number"
                  min="1"
                  max="10"
                  value={newMemory.importance}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, importance: parseInt(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">
                  Higher importance memories are prioritized and retained longer
                </p>
              </div>
              
              <Button
                onClick={addMemoryEntry}
                disabled={!newMemory.content.trim()}
                className="w-full"
              >
                Add Memory Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};