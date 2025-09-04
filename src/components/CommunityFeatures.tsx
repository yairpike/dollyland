import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  GitFork, 
  Star, 
  Award, 
  TrendingUp,
  Users,
  ThumbsUp,
  Clock,
  VerifiedIcon
} from "lucide-react";

interface Discussion {
  id: string;
  author: string;
  avatar: string;
  content: string;
  replies: number;
  likes: number;
  timestamp: string;
  tags: string[];
}

interface AgentFork {
  id: string;
  originalAgent: string;
  forkedBy: string;
  improvements: string[];
  performance: number;
  timestamp: string;
}

interface CertificationBadge {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  earned: boolean;
  icon: string;
}

export const CommunityFeatures: React.FC = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [agentForks, setAgentForks] = useState<AgentFork[]>([]);
  const [certifications, setCertifications] = useState<CertificationBadge[]>([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    setLoading(true);
    // Simulate API calls - replace with real Supabase queries
    setTimeout(() => {
      setDiscussions([
        {
          id: '1',
          author: 'Sarah Chen',
          avatar: 'SC',
          content: 'Has anyone successfully integrated their sales agent with Salesforce? Looking for best practices.',
          replies: 12,
          likes: 24,
          timestamp: '2 hours ago',
          tags: ['salesforce', 'integration', 'sales']
        },
        {
          id: '2',
          author: 'Mike Rodriguez',
          avatar: 'MR',
          content: 'Just forked the customer service agent and improved response time by 40%! Here\'s how...',
          replies: 8,
          likes: 31,
          timestamp: '5 hours ago',
          tags: ['optimization', 'customer-service', 'performance']
        }
      ]);

      setAgentForks([
        {
          id: '1',
          originalAgent: 'Customer Support Pro',
          forkedBy: 'Alex Thompson',
          improvements: ['Added sentiment analysis', 'Improved response time', 'Enhanced multilingual support'],
          performance: 92,
          timestamp: '1 day ago'
        },
        {
          id: '2',
          originalAgent: 'Sales Assistant',
          forkedBy: 'Emma Davis',
          improvements: ['CRM integration', 'Lead scoring', 'Follow-up automation'],
          performance: 88,
          timestamp: '3 days ago'
        }
      ]);

      setCertifications([
        {
          id: '1',
          name: 'AI Expert',
          description: 'Demonstrated advanced AI agent development skills',
          criteria: ['Created 10+ agents', 'Average rating 4.5+', 'Community contributions'],
          earned: true,
          icon: '🎓'
        },
        {
          id: '2',
          name: 'Community Leader',
          description: 'Active contributor to the Dolly AI community',
          criteria: ['50+ helpful discussions', '100+ likes received', 'Mentored newcomers'],
          earned: false,
          icon: '👑'
        },
        {
          id: '3',
          name: 'Innovation Pioneer',
          description: 'Created breakthrough agent capabilities',
          criteria: ['Novel agent features', 'High community adoption', 'Technical innovation'],
          earned: true,
          icon: '🚀'
        }
      ]);

      setLoading(false);
    }, 1000);
  };

  const handlePostDiscussion = () => {
    if (!newDiscussion.trim()) {
      toast({
        title: "Error",
        description: "Please enter a discussion topic",
        variant: "destructive"
      });
      return;
    }

    const discussion: Discussion = {
      id: Date.now().toString(),
      author: 'You',
      avatar: 'YU',
      content: newDiscussion,
      replies: 0,
      likes: 0,
      timestamp: 'Just now',
      tags: []
    };

    setDiscussions([discussion, ...discussions]);
    setNewDiscussion('');
    
    toast({
      title: "Discussion Posted",
      description: "Your discussion has been shared with the community"
    });
  };

  const handleForkAgent = (agentId: string) => {
    toast({
      title: "Agent Forked",
      description: "You can now customize this agent in your workspace"
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading community features...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Users className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Community Hub</h2>
      </div>

      <Tabs defaultValue="discussions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="forks">Agent Forks</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Start a Discussion</span>
              </CardTitle>
              <CardDescription>
                Share your thoughts, ask questions, or help others in the community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="What would you like to discuss about AI agents?"
                value={newDiscussion}
                onChange={(e) => setNewDiscussion(e.target.value)}
                className="min-h-20"
              />
              <Button onClick={handlePostDiscussion}>Post Discussion</Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={discussion.avatar} />
                      <AvatarFallback>{discussion.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{discussion.author}</span>
                        <Badge variant="outline">{discussion.timestamp}</Badge>
                      </div>
                      <p className="text-muted-foreground">{discussion.content}</p>
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{discussion.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{discussion.replies} replies</span>
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {discussion.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitFork className="h-5 w-5" />
                <span>Recent Agent Forks</span>
              </CardTitle>
              <CardDescription>
                See how community members are improving and customizing agents
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {agentForks.map((fork) => (
              <Card key={fork.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <GitFork className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{fork.originalAgent}</span>
                        <span className="text-muted-foreground">forked by</span>
                        <span className="font-medium">{fork.forkedBy}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-medium">Improvements:</span>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {fork.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-primary rounded-full" />
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>Performance: {fork.performance}%</span>
                        </Badge>
                        <Badge variant="outline">{fork.timestamp}</Badge>
                      </div>
                    </div>
                    <Button onClick={() => handleForkAgent(fork.id)} size="sm">
                      Fork Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Achievement Certifications</span>
              </CardTitle>
              <CardDescription>
                Earn badges and certifications for your contributions to the community
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {certifications.map((cert) => (
              <Card key={cert.id} className={`relative ${cert.earned ? 'border-primary' : 'border-dashed'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{cert.icon}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{cert.name}</span>
                        {cert.earned && <VerifiedIcon className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{cert.description}</p>
                      <div className="space-y-1">
                        <span className="text-xs font-medium">Criteria:</span>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {cert.criteria.map((criterion, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                              <span>{criterion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  {cert.earned && (
                    <Badge className="absolute top-2 right-2" variant="default">
                      Earned
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};