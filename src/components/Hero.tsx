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
        <div className="inline-flex items-center gap-2 bg-gradient-agent border border-primary/20 rounded-full px-6 py-2 mb-8 animate-slide-up">
          <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
          <span className="text-sm font-medium text-primary">Revolutionary AI Knowledge Cloning</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Clone Your
          <br />
          <span className="bg-gradient-hero bg-clip-text text-transparent">
            Expertise
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.4s' }}>
          Create specialized AI agents from your knowledge. Build your UX designer, developer, marketer, and product manager. 
          <span className="text-primary font-semibold"> Multiply yourself to scale your business.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <Button variant="hero" size="lg" className="text-lg px-8 py-4">
            <Brain className="w-5 h-5" />
            Start Cloning Your Knowledge
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="agent" size="lg" className="text-lg px-8 py-4">
            See How It Works
          </Button>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow"></div>
            <span>Secure Knowledge Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-neural rounded-full animate-pulse-glow"></div>
            <span>Unlimited Agent Creation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-agent-primary rounded-full animate-pulse-glow"></div>
            <span>Enterprise Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};