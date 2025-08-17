import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Sparkles } from "lucide-react";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-wellness-mint/5 to-wellness-blue/5">
      {/* Subtle floating elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-wellness-green/30 rounded-full animate-float"></div>
      <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-wellness-coral/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-wellness-purple/40 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-light mb-6 animate-slide-up text-foreground">
          Clone Your
          <br />
          <span className="font-medium text-wellness-green">
            Expertise
          </span>
        </h1>
        
        <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Create AI agents from your knowledge. Scale yourself effortlessly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
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