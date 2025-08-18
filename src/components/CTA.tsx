import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, Check } from "lucide-react";

const benefits = [
  "No credit card required",
  "5 free agents included",
  "Full platform access",
  "24/7 support included"
];

export const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-primary/5 to-accent/10 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/20 rounded-full blur-2xl"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <Card className="p-12 bg-gradient-card border-0 shadow-xl">
          <div className="mb-8">
            <h2 className="text-4xl md:text-6xl font-semibold mb-6">
              Ready to Build Your
              <span className="block bg-gradient-primary bg-clip-text text-transparent">AI Empire?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join the AI revolution. Start creating, training, and monetizing your first AI agent today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="default" 
              size="lg" 
              onClick={() => navigate('/auth')} 
              className="shadow-lg text-lg px-8 py-6 h-auto"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Building for Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/marketplace')} 
              className="backdrop-blur-sm text-lg px-8 py-6 h-auto"
            >
              Explore Marketplace
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No spam, unsubscribe at any time. Join 10,000+ AI builders worldwide.
          </p>
        </Card>
      </div>
    </section>
  );
};