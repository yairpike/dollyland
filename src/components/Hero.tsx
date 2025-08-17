import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Sparkles } from "lucide-react";
import heroBrain from "@/assets/hero-brain.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background to-accent/30">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src={heroBrain} 
          alt="AI Neural Network" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-neural/20"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-neural/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-agent-primary/10 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-slide-up">
          Clone Your
          <br />
          <span className="bg-gradient-hero bg-clip-text text-transparent">
            Expertise
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Create AI agents from your knowledge. Scale yourself.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button variant="hero" size="lg">
            <Brain className="w-5 h-5" />
            Get Started
          </Button>
          <Button variant="agent" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};