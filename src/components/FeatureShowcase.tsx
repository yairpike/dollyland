import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  Workflow, 
  Users, 
  Zap, 
  TrendingUp, 
  Network,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Play
} from "lucide-react";

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: "available" | "beta" | "coming-soon";
  route?: string;
  action: string;
  color: string;
}

const features: FeatureCard[] = [
  {
    id: "orchestration",
    title: "Agent Orchestration",
    description: "Coordinate multiple AI agents working together on complex tasks with smart handoffs and parallel processing.",
    icon: Brain,
    status: "available",
    route: "/features",
    action: "Configure Multi-Agent Workflows",
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: "learning",
    title: "Continuous Learning",
    description: "Agents that automatically improve from every interaction using feedback loops and performance analytics.",
    icon: TrendingUp,
    status: "available", 
    route: "/features",
    action: "Enable Auto-Learning",
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "workflows",
    title: "Advanced Workflows",
    description: "Visual workflow builder with drag-and-drop components for sophisticated automation pipelines.",
    icon: Workflow,
    status: "available",
    route: "/features", 
    action: "Build Custom Workflows",
    color: "from-purple-500 to-violet-600"
  },
  {
    id: "discovery",
    title: "AI-Powered Discovery",
    description: "Semantic search and intelligent recommendations to find the perfect agents for your needs.",
    icon: Sparkles,
    status: "available",
    route: "/marketplace",
    action: "Discover Agents",
    color: "from-orange-500 to-red-600"
  },
  {
    id: "community",
    title: "Community Ecosystem",
    description: "Fork, customize, and share agents with a thriving community of AI practitioners and developers.",
    icon: Users,
    status: "beta",
    route: "/features",
    action: "Join Community",
    color: "from-teal-500 to-cyan-600"
  },
  {
    id: "integrations",
    title: "Enterprise Integrations",
    description: "Connect with 150+ platforms including CRMs, project management tools, and custom APIs.",
    icon: Network,
    status: "available",
    route: "/features",
    action: "Setup Integrations",
    color: "from-pink-500 to-rose-600"
  }
];

export const FeatureShowcase = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>;
      case "beta":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Beta</Badge>;
      case "coming-soon":
        return <Badge variant="outline">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Advanced Agent Capabilities</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore cutting-edge AI agent features designed for enterprise-scale automation and intelligence
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          const isHovered = hoveredFeature === feature.id;
          
          return (
            <Card 
              key={feature.id}
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
              onClick={() => feature.route && navigate(feature.route)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  {getStatusBadge(feature.status)}
                </div>
                
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative">
                <Button 
                  variant={isHovered ? "default" : "ghost"}
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                  disabled={feature.status === "coming-soon"}
                >
                  {feature.status === "coming-soon" ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Coming Soon
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {feature.action}
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="text-center pt-8">
        <Button 
          onClick={() => navigate('/create-agent')}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90"
        >
          <Zap className="w-5 h-5 mr-2" />
          Start Building Advanced Agents
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};