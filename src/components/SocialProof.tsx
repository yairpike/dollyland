import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "UX Design Consultant",
    company: "Independent",
    avatar: "SC",
    content: "I've generated over $30K in revenue in just 3 months by creating design-focused AI agents. The platform made it incredibly easy to monetize my UX expertise.",
    rating: 5,
    revenue: "$30K+ revenue"
  },
  {
    name: "Marcus Rodriguez", 
    role: "CTO",
    company: "TechFlow Inc",
    avatar: "MR",
    content: "Our customer support costs dropped by 70% after deploying AI agents. The ROI was immediate and the quality of responses actually improved.",
    rating: 5,
    revenue: "70% cost reduction"
  },
  {
    name: "Emily Watson",
    role: "Marketing Agency Owner",
    company: "GrowthLab",
    avatar: "EW", 
    content: "We now offer AI agent services to all our clients. It's become our fastest-growing revenue stream, adding $50K+ monthly recurring revenue.",
    rating: 5,
    revenue: "$50K+ MRR"
  },
  {
    name: "David Kim",
    role: "Software Developer",
    company: "CodeCraft",
    avatar: "DK",
    content: "The API integration was seamless. We built custom AI agents for 10+ clients in our first quarter. Game-changing for our development business.",
    rating: 5,
    revenue: "10+ clients"
  },
  {
    name: "Lisa Thompson",
    role: "Business Coach", 
    company: "ThompsonCoaching",
    avatar: "LT",
    content: "My AI coaching agent works 24/7, helping clients even when I'm sleeping. It's like having a virtual clone of my expertise available worldwide.",
    rating: 5,
    revenue: "Global reach"
  },
  {
    name: "Alex Morrison",
    role: "Head of Operations",
    company: "ScaleUp Ventures",
    avatar: "AM",
    content: "The analytics dashboard gives us incredible insights into user behavior. We've optimized our agents based on real data and doubled engagement.",
    rating: 5,
    revenue: "2x engagement"
  }
];

export const SocialProof = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-background to-accent/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4">Customer Success</Badge>
          <h2 className="text-4xl md:text-6xl font-semibold mb-6">
            Real Results from
            <span className="block bg-gradient-primary bg-clip-text text-transparent">Real Users</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of professionals who've transformed their expertise into profitable AI agents.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              className="p-6 bg-gradient-card border-0 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
              
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role} • {testimonial.company}</div>
                </div>
                <Badge variant="secondary" className="text-xs font-medium">
                  {testimonial.revenue}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};