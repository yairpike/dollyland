import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  DollarSign, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  GitBranch,
  MessageSquare,
  FileText,
  Palette
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Agent Builder",
    description: "Create specialized AI agents with drag-and-drop simplicity. Train them on your expertise and knowledge base.",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    icon: DollarSign,
    title: "Monetize Your Expertise", 
    description: "Turn your knowledge into revenue. Set pricing, manage subscriptions, and earn from every interaction.",
    color: "text-green-600",
    bgColor: "bg-green-600/10"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share agents with your team, manage permissions, and collaborate in real-time on agent development.",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track usage, revenue, user engagement, and performance metrics. Make data-driven decisions.",
    color: "text-purple-600",
    bgColor: "bg-purple-600/10"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security, SOC2 compliance, and data encryption. Your knowledge stays protected.",
    color: "text-red-600",
    bgColor: "bg-red-600/10"
  },
  {
    icon: GitBranch,
    title: "API & Integrations",
    description: "Connect to 1000+ tools. Slack, GitHub, Linear, Vercel, and custom webhook integrations.",
    color: "text-orange-600",
    bgColor: "bg-orange-600/10"
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24 px-6 bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4">Platform Features</Badge>
          <h2 className="text-4xl md:text-6xl font-semibold mb-6">
            Everything You Need to
            <span className="block bg-gradient-primary bg-clip-text text-transparent">Build & Scale</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From idea to enterprise-scale AI agents. Our platform handles the complexity so you can focus on what matters.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="p-8 bg-gradient-card border-0 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};