import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Sparkles } from "lucide-react";
import dollyLogo from "@/assets/dolly-logo.png";
import hero3dBrain from "@/assets/hero-3d-brain.png";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-dashboard-lavender/10 to-dashboard-mint/10">
      <div className="absolute inset-0 bg-gradient-card opacity-30"></div>
      
      {/* 3D Brain Illustration */}
      <div className="absolute top-20 right-20 hidden lg:block animate-float">
        <img src={hero3dBrain} alt="3D Brain AI" className="w-48 h-36 opacity-60" />
      </div>
      
      {/* Modern floating elements */}
      <div className="absolute top-20 left-16 w-24 h-20 bg-dashboard-purple/20 rounded-3xl animate-float blur-sm"></div>
      <div className="absolute bottom-32 right-20 w-32 h-28 bg-dashboard-pink/25 rounded-3xl animate-float blur-sm" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-16 w-20 h-24 bg-dashboard-mint/35 rounded-3xl animate-float blur-sm" style={{ animationDelay: '4s' }}></div>
      <div className="absolute bottom-1/4 left-20 w-28 h-32 bg-dashboard-blue/20 rounded-3xl animate-float blur-sm" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-2/3 left-1/3 w-16 h-20 bg-dashboard-lavender/30 rounded-3xl animate-float blur-sm" style={{ animationDelay: '3s' }}></div>
      
      {/* Small floating dots */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-dashboard-purple rounded-full animate-float opacity-60"></div>
      <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-dashboard-pink rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-dashboard-mint rounded-full animate-float opacity-70" style={{ animationDelay: '4s' }}></div>
      
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <div className="mb-12 animate-slide-up">
          <img src={dollyLogo} alt="dolly" className="w-32 h-32 mx-auto mb-8 animate-float rounded-3xl shadow-xl bg-card backdrop-blur-glass p-4" />
          <h1 className="text-6xl md:text-7xl font-semibold mb-8 leading-tight">
            <span className="text-foreground">Build & Deploy</span>
            <span className="block text-foreground mt-2">AI Agents</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            Create intelligent AI agents, train them with your knowledge, and deploy them to solve real-world problems in the most beautiful way possible.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button variant="default" size="lg" onClick={() => navigate('/auth')} className="bg-gradient-primary hover:opacity-90 shadow-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            Get Started
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/auth')} className="backdrop-blur-sm">
            Learn More
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};