import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Mic, 
  Image, 
  FileText, 
  MessageSquare, 
  Wand2,
  Plus,
  Settings
} from "lucide-react";

interface MultimodalCapability {
  id: string;
  type: 'audio' | 'image' | 'document' | 'video';
  name: string;
  description: string;
  enabled: boolean;
  config: any;
}

interface AgentMultimodalProps {
  agentId: string;
}

const CAPABILITY_TYPES = [
  {
    id: 'audio',
    name: 'Audio Processing',
    icon: Mic,
    description: 'Voice conversations and audio analysis',
    features: ['Voice chat', 'Audio transcription', 'Voice synthesis', 'Audio analysis']
  },
  {
    id: 'image',
    name: 'Image Generation & Analysis',
    icon: Image,
    description: 'Generate and analyze images',
    features: ['Image generation', 'Image analysis', 'Visual Q&A', 'Image editing']
  },
  {
    id: 'document',
    name: 'Document Processing',
    icon: FileText,
    description: 'Process various document formats',
    features: ['PDF processing', 'Word documents', 'Excel analysis', 'Text extraction']
  },
  {
    id: 'video',
    name: 'Video Processing',
    icon: MessageSquare,
    description: 'Video analysis and generation',
    features: ['Video analysis', 'Scene understanding', 'Video summarization', 'Motion detection']
  }
];

export const AgentMultimodal = ({ agentId }: AgentMultimodalProps) => {
  const { user } = useAuth();
  const [capabilities, setCapabilities] = useState<MultimodalCapability[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCapabilities();
  }, [agentId]);

  const fetchCapabilities = async () => {
    // Demo capabilities - in production, fetch from database
    const demoCapabilities: MultimodalCapability[] = [
      {
        id: '1',
        type: 'audio',
        name: 'Voice Chat',
        description: 'Enable voice conversations with the agent',
        enabled: true,
        config: { language: 'en', voice: 'nova' }
      },
      {
        id: '2',
        type: 'image',
        name: 'Image Generation',
        description: 'Generate images based on text descriptions',
        enabled: false,
        config: { model: 'dall-e-3', style: 'natural' }
      },
      {
        id: '3',
        type: 'document',
        name: 'PDF Analysis',
        description: 'Analyze and extract information from PDF documents',
        enabled: true,
        config: { maxSize: '10MB', languages: ['en', 'es'] }
      }
    ];
    setCapabilities(demoCapabilities);
  };

  const toggleCapability = async (capabilityId: string, enabled: boolean) => {
    setCapabilities(prev => prev.map(cap => 
      cap.id === capabilityId ? { ...cap, enabled } : cap
    ));
    toast.success(enabled ? 'Capability enabled' : 'Capability disabled');
  };

  const addCapability = async (type: string) => {
    const newCapability: MultimodalCapability = {
      id: Date.now().toString(),
      type: type as any,
      name: `New ${type} capability`,
      description: `Custom ${type} processing capability`,
      enabled: false,
      config: {}
    };
    
    setCapabilities(prev => [...prev, newCapability]);
    toast.success('Capability added');
  };

  const getCapabilityIcon = (type: string) => {
    const capType = CAPABILITY_TYPES.find(ct => ct.id === type);
    return capType?.icon || Wand2;
  };

  const enabledCapabilities = capabilities.filter(cap => cap.enabled);
  const audioEnabled = enabledCapabilities.some(cap => cap.type === 'audio');
  const imageEnabled = enabledCapabilities.some(cap => cap.type === 'image');
  const documentEnabled = enabledCapabilities.some(cap => cap.type === 'document');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Multimodal Capabilities</h3>
          <p className="text-sm text-muted-foreground">
            Enable your agent to process audio, images, documents, and more
          </p>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Advanced Settings
        </Button>
      </div>

      {/* Capability Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mic className={`w-4 h-4 ${audioEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm font-medium">Audio</p>
                <p className="text-xs text-muted-foreground">
                  {audioEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Image className={`w-4 h-4 ${imageEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm font-medium">Images</p>
                <p className="text-xs text-muted-foreground">
                  {imageEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className={`w-4 h-4 ${documentEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm font-medium">Documents</p>
                <p className="text-xs text-muted-foreground">
                  {documentEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-xl font-bold">{enabledCapabilities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAPABILITY_TYPES.map((capType) => {
              const IconComponent = capType.icon;
              const isEnabled = capabilities.some(cap => cap.type === capType.id && cap.enabled);
              
              return (
                <Card key={capType.id} className={`transition-all ${isEnabled ? 'border-primary' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                          <IconComponent className={`w-4 h-4 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{capType.name}</CardTitle>
                          <CardDescription>{capType.description}</CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addCapability(capType.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {capType.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audio Processing</CardTitle>
              <CardDescription>
                Configure voice and audio capabilities for your agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Voice Model</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].map((voice) => (
                    <Button key={voice} variant="outline" className="capitalize">
                      {voice}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="speech-speed">Speech Speed</Label>
                <Input
                  id="speech-speed"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  defaultValue="1.0"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Audio Features</Label>
                <div className="space-y-2">
                  {['Real-time voice chat', 'Audio transcription', 'Voice synthesis', 'Audio analysis'].map((feature) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm">{feature}</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visual Processing</CardTitle>
              <CardDescription>
                Configure image generation and analysis capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Image Generation Model</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">DALL-E 3</Button>
                  <Button variant="outline">Midjourney</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image-style">Default Style</Label>
                <select id="image-style" className="w-full p-2 border rounded">
                  <option>Natural</option>
                  <option>Vivid</option>
                  <option>Artistic</option>
                  <option>Photographic</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Visual Features</Label>
                <div className="space-y-2">
                  {['Image generation', 'Image analysis', 'Visual Q&A', 'OCR text extraction'].map((feature) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm">{feature}</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Processing</CardTitle>
              <CardDescription>
                Configure document analysis and processing capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Supported Formats</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['PDF', 'Word', 'Excel', 'PowerPoint', 'Text', 'Markdown'].map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <input type="checkbox" id={format} className="rounded" defaultChecked />
                      <Label htmlFor={format} className="text-sm">{format}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
                <Input
                  id="max-file-size"
                  type="number"
                  defaultValue="25"
                  min="1"
                  max="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Processing Features</Label>
                <div className="space-y-2">
                  {['Text extraction', 'Table analysis', 'Image extraction', 'Metadata analysis'].map((feature) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm">{feature}</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Active Capabilities */}
      {capabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Capabilities</CardTitle>
            <CardDescription>
              Manage your currently configured multimodal capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {capabilities.map((capability) => {
                const IconComponent = getCapabilityIcon(capability.type);
                return (
                  <div key={capability.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{capability.name}</h4>
                        <p className="text-sm text-muted-foreground">{capability.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={capability.enabled ? "default" : "secondary"}>
                        {capability.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCapability(capability.id, !capability.enabled)}
                      >
                        {capability.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};