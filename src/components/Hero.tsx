import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Sparkles } from "lucide-react";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-background">
      {/* Organic floating elements - very subtle */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-wellness-yellow/20 rounded-full animate-float"></div>
      <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-wellness-coral/15 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-wellness-purple/25 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-2/3 left-1/3 w-5 h-5 bg-wellness-mint/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-light mb-8 animate-slide-up text-foreground leading-tight">
          Clone Your
          <br />
          <span className="font-medium text-wellness-blue">
            Expertise
          </span>
        </h1>
        
        <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed animate-slide-up font-light" style={{ animationDelay: '0.2s' }}>
          Create AI agents from your knowledge. Scale yourself with gentle intelligence.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button variant="soft" size="lg" onClick={() => navigate('/auth')}>
            <Zap className="w-4 h-4" />
            Get Started
          </Button>
          <Button variant="calm" size="lg" onClick={() => navigate('/auth')}>
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};