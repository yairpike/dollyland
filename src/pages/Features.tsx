import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  Workflow, 
  Users, 
  Zap, 
  TrendingUp, 
  Code, 
  Globe, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Database,
  Settings,
  BarChart3,
  Network,
  Shield
} from "lucide-react";

export const Features = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orchestration");

  const features = {
    orchestration: {
      title: "Agent Orchestration",
      description: "Coordinate multiple AI agents to work together on complex tasks",
      icon: Brain,
      color: "from-blue-500 to-indigo-600",
      benefits: [
        "Multi-agent workflows with smart handoffs",
        "Parallel processing capabilities",
        "Conditional routing based on context",
        "Real-time collaboration monitoring"
      ],
      useCases: [
        "Complex customer support escalation",
        "Multi-step data analysis pipelines", 
        "Collaborative content creation",
        "Automated business process orchestration"
      ]
    },
    learning: {
      title: "Continuous Learning",
      description: "Agents that improve automatically from every interaction",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      benefits: [
        "Automatic prompt optimization",
        "User feedback integration",
        "Performance analytics tracking",
        "Context-aware improvements"
      ],
      useCases: [
        "Customer service quality optimization",
        "Sales conversation refinement",
        "Technical support knowledge expansion",
        "Product recommendation enhancement"
      ]
    },
    workflows: {
      title: "Advanced Workflows",
      description: "Visual workflow builder with sophisticated automation",
      icon: Workflow,
      color: "from-purple-500 to-violet-600",
      benefits: [
        "Drag-and-drop visual editor",
        "Pre-built workflow templates",
        "Real-time execution monitoring",
        "Integration with external systems"
      ],
      useCases: [
        "Lead qualification automation",
        "Content approval workflows",
        "Data processing pipelines",
        "Multi-channel campaign orchestration"
      ]
    },
    discovery: {
      title: "AI-Powered Discovery",
      description: "Intelligent agent discovery using semantic search",
      icon: Sparkles,
      color: "from-orange-500 to-red-600",
      benefits: [
        "Natural language search",
        "Personalized recommendations",
        "Performance-based ranking",
        "Community-driven insights"
      ],
      useCases: [
        "Finding specialized expertise",
        "Discovering automation opportunities",
        "Matching agents to business needs",
        "Exploring market solutions"
      ]
    },
    community: {
      title: "Community Features",
      description: "Collaborative platform for agent sharing and improvement",
      icon: Users,
      color: "from-teal-500 to-cyan-600",
      benefits: [
        "Agent forking and customization",
        "Community discussions and feedback",
        "Collaborative improvement cycles",
        "Marketplace ecosystem"
      ],
      useCases: [
        "Open-source agent development",
        "Industry-specific templates",
        "Best practice sharing",
        "Community-driven innovation"
      ]
    },
    integrations: {
      title: "Enterprise Integrations",
      description: "Connect with your existing tools and platforms",
      icon: Network,
      color: "from-pink-500 to-rose-600",
      benefits: [
        "150+ pre-built integrations",
        "Custom API connections",
        "Webhook automation",
        "Real-time data synchronization"
      ],
      useCases: [
        "CRM automation",
        "Project management integration",
        "Data pipeline automation",
        "Multi-platform workflows"
      ]
    }
  };

  const activeFeature = features[activeTab as keyof typeof features];
  const ActiveIcon = activeFeature.icon;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Advanced AI Agent Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the most sophisticated AI agent capabilities designed for enterprise-scale automation and intelligence
          </p>
        </div>

        {/* Feature Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted/50">
            {Object.entries(features).map(([key, feature]) => {
              const IconComponent = feature.icon;
              return (
                <TabsTrigger 
                  key={key}
                  value={key}
                  className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs font-medium hidden sm:block">{feature.title.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Feature Content */}
          <div className="mt-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="text-center pb-8">
                <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${activeFeature.color} flex items-center justify-center mb-6`}>
                  <ActiveIcon className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold mb-3">{activeFeature.title}</CardTitle>
                <CardDescription className="text-lg max-w-2xl mx-auto">
                  {activeFeature.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-12">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Benefits */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Key Benefits
                    </h3>
                    <div className="space-y-3">
                      {activeFeature.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Use Cases
                    </h3>
                    <div className="space-y-3">
                      {activeFeature.useCases.map((useCase, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0" />
                          <span className="text-sm">{useCase}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                  <Button 
                    onClick={() => navigate('/create-agent')}
                    className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Create Agent
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/marketplace')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Explore Marketplace
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs>

        {/* Feature Grid Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(features).map(([key, feature]) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={key}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-card to-muted/20"
                onClick={() => setActiveTab(key)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};