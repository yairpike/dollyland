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
    name: "UX Designer Clone",
    role: "Creative Design Expert",
    icon: Palette,
    description: "Creates user interfaces, conducts research, and designs experiences based on your design philosophy and methodology.",
    skills: ["User Research", "Prototyping", "Design Systems", "A/B Testing"],
    color: "text-agent-primary",
    bgColor: "bg-agent-primary/10"
  },
  {
    name: "Developer Clone", 
    role: "Technical Implementation",
    icon: Code,
    description: "Writes code, reviews architecture, and solves technical problems using your coding style and best practices.",
    skills: ["Full-Stack Development", "Code Review", "Architecture", "Debugging"],
    color: "text-neural",
    bgColor: "bg-neural/10"
  },
  {
    name: "Marketing Clone",
    role: "Growth & Strategy",
    icon: TrendingUp,
    description: "Develops campaigns, analyzes metrics, and creates content that reflects your marketing expertise and voice.",
    skills: ["Content Strategy", "Analytics", "Campaigns", "Brand Voice"],
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    name: "Product Clone",
    role: "Strategy & Roadmap",
    icon: Target,
    description: "Makes product decisions, prioritizes features, and plans roadmaps based on your product management experience.",
    skills: ["Roadmap Planning", "Feature Prioritization", "User Stories", "Metrics"],
    color: "text-agent-secondary",
    bgColor: "bg-agent-secondary/10"
  },
];

export const AgentShowcase = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-background to-accent/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20">
            <Briefcase className="w-4 h-4 mr-2" />
            Your AI Workforce
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Meet Your
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Cloned Team</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Each agent inherits your expertise, decision-making patterns, and domain knowledge. 
            They work 24/7 to scale your capabilities across every aspect of your business.
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
              <p className="text-sm text-muted-foreground mb-4">{agent.role}</p>
              <p className="text-sm mb-4 leading-relaxed">{agent.description}</p>
              
              <div className="space-y-2 mb-4">
                {agent.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs mr-2 mb-1">
                    {skill}
                  </Badge>
                ))}
              </div>
              
              <Button variant="agent" size="sm" className="w-full group-hover:bg-primary group-hover:text-white">
                <MessageSquare className="w-4 h-4" />
                Chat with Clone
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="inline-block p-8 bg-gradient-agent border border-primary/20 shadow-glow">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Create Custom Agent</h3>
              <p className="text-muted-foreground max-w-md">
                Upload your knowledge and create specialized agents for any role or expertise you need.
              </p>
              <Button variant="neural" className="mt-2">
                <Zap className="w-4 h-4" />
                Build Your Agent
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};