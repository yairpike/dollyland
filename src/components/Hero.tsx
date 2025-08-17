import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Sparkles } from "lucide-react";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-background">
      {/* Organic blob shapes inspired by the mood indicators */}
      <div className="absolute top-20 left-16 w-24 h-20 bg-wellness-yellow/30 rounded-full animate-float blur-sm" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}></div>
      <div className="absolute bottom-32 right-20 w-32 h-28 bg-wellness-coral/25 rounded-full animate-float blur-sm" style={{ animationDelay: '2s', borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}></div>
      <div className="absolute top-1/3 right-16 w-20 h-24 bg-wellness-mint/35 rounded-full animate-float blur-sm" style={{ animationDelay: '4s', borderRadius: '70% 30% 50% 50% / 30% 60% 40% 70%' }}></div>
      <div className="absolute bottom-1/4 left-20 w-28 h-32 bg-wellness-purple/20 rounded-full animate-float blur-sm" style={{ animationDelay: '1s', borderRadius: '50% 50% 30% 70% / 50% 40% 60% 40%' }}></div>
      <div className="absolute top-2/3 left-1/3 w-16 h-20 bg-wellness-blue/30 rounded-full animate-float blur-sm" style={{ animationDelay: '3s', borderRadius: '60% 40% 50% 50% / 70% 30% 50% 50%' }}></div>
      
      {/* Small floating dots like in the progress visualization */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-wellness-green rounded-full animate-float opacity-60"></div>
      <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-wellness-coral rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-wellness-yellow rounded-full animate-float opacity-70" style={{ animationDelay: '4s' }}></div>
      
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