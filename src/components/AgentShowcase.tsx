import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Code, 
  TrendingUp, 
  Target, 
  Briefcase, 
  MessageSquare,
  Plus,
  Zap
} from "lucide-react";
import agentAvatars from "@/assets/agent-avatars.jpg";

const agents = [
  {
    name: "UX Designer",
    icon: Palette,
    description: "Design interfaces and user experiences.",
    color: "text-agent-primary",
    bgColor: "bg-agent-primary/10"
  },
  {
    name: "Developer", 
    icon: Code,
    description: "Write code and solve technical problems.",
    color: "text-neural",
    bgColor: "bg-neural/10"
  },
  {
    name: "Marketer",
    icon: TrendingUp,
    description: "Create campaigns and grow your business.",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    name: "Product Manager",
    icon: Target,
    description: "Plan roadmaps and prioritize features.",
    color: "text-agent-secondary",
    bgColor: "bg-agent-secondary/10"
  },
];

export const AgentShowcase = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-background to-accent/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Your
            <span className="bg-gradient-hero bg-clip-text text-transparent"> AI Team</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Specialized agents trained on your expertise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {agents.map((agent, index) => (
            <Card 
              key={agent.name} 
              className="p-6 bg-gradient-card border-0 shadow-elegant hover:shadow-neural transition-all duration-500 hover:-translate-y-2 animate-slide-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 ${agent.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <agent.icon className={`w-8 h-8 ${agent.color}`} />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
              <p className="text-sm mb-6 leading-relaxed text-muted-foreground">{agent.description}</p>
              
              <Button variant="agent" size="sm" className="w-full">
                <MessageSquare className="w-4 h-4" />
                Chat
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="inline-block p-8 bg-gradient-agent border border-primary/20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Create Agent</h3>
              <p className="text-muted-foreground max-w-md">
                Upload your knowledge to create custom agents.
              </p>
              <Button variant="neural" className="mt-2">
                <Zap className="w-4 h-4" />
                Get Started
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};