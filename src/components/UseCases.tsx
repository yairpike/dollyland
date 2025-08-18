import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const useCases = [
  {
    title: "For Creators & Consultants",
    subtitle: "Monetize Your Knowledge",
    description: "Transform your expertise into revenue-generating AI agents. From business coaching to technical consulting, scale your impact.",
    features: ["Personal brand amplification", "Automated consulting", "Course content delivery", "Client onboarding"],
    revenue: "$5K-50K/month",
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  {
    title: "For Businesses & Teams",
    subtitle: "Automate & Scale Operations", 
    description: "Deploy AI agents for customer support, sales, training, and internal workflows. Reduce costs while improving service quality.",
    features: ["24/7 customer support", "Sales qualification", "Employee training", "Process automation"],
    revenue: "$10K-100K+/month",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    title: "For Developers & Agencies",
    subtitle: "Build AI Solutions for Clients",
    description: "Create custom AI agents for clients without complex infrastructure. White-label solutions with full API access.",
    features: ["White-label platform", "API-first architecture", "Custom integrations", "Client management"],
    revenue: "$20K-200K+/month", 
    gradient: "from-orange-500/20 to-red-500/20"
  }
];

export const UseCases = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-muted/20 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4">Use Cases</Badge>
          <h2 className="text-4xl md:text-6xl font-semibold mb-6">
            Built for Every
            <span className="block bg-gradient-primary bg-clip-text text-transparent">Business Model</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're a solo creator or enterprise team, our platform adapts to your needs and scales with your growth.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <Card 
              key={useCase.title}
              className={`p-8 bg-gradient-to-br ${useCase.gradient} border-0 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up relative overflow-hidden`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="relative z-10">
                <Badge variant="secondary" className="mb-4">{useCase.revenue}</Badge>
                <h3 className="text-2xl font-semibold mb-2">{useCase.title}</h3>
                <h4 className="text-lg text-primary mb-4 font-medium">{useCase.subtitle}</h4>
                <p className="text-muted-foreground mb-6 leading-relaxed">{useCase.description}</p>
                
                <div className="space-y-2 mb-8">
                  {useCase.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full group">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};