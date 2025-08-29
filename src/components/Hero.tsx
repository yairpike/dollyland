import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Building2, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";

export const Hero = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const logoSrc = theme === 'dark' ? '/lovable-uploads/c8c73254-3940-4a5b-b990-cb30d21dc890.png' : '/lovable-uploads/85abbc87-fafc-4307-86a1-f85ed74b639e.png';
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="absolute inset-0 bg-gradient-card opacity-30"></div>
      
      {/* Floating logos and clouds */}
      <div className="absolute top-20 left-16 w-16 h-16 animate-float blur-sm" style={{ animationDelay: '0s' }}>
        <img src={logoSrc} alt="dollyland.ai" className="w-full h-full object-contain opacity-60" />
      </div>
      <div className="absolute bottom-32 right-20 w-14 h-14 animate-float blur-sm" style={{ animationDelay: '2s' }}>
        <img src={logoSrc} alt="dollyland.ai" className="w-full h-full object-contain opacity-60" />
      </div>
      <div className="absolute top-1/3 right-16 w-12 h-12 animate-float blur-sm" style={{ animationDelay: '4s' }}>
        <img src={logoSrc} alt="dollyland.ai" className="w-full h-full object-contain opacity-60" />
      </div>
      <div className="absolute bottom-1/4 left-20 w-14 h-14 animate-float blur-sm" style={{ animationDelay: '1s' }}>
        <img src={logoSrc} alt="dollyland.ai" className="w-full h-full object-contain opacity-60" />
      </div>
      <div className="absolute top-2/3 left-1/3 w-12 h-12 animate-float blur-sm" style={{ animationDelay: '3s' }}>
        <img src={logoSrc} alt="dollyland.ai" className="w-full h-full object-contain opacity-60" />
      </div>
      
      {/* Floating clouds */}
      <div className="absolute top-16 right-1/3 w-20 h-12 animate-float blur-sm" style={{ animationDelay: '1.5s' }}>
        <svg viewBox="0 0 100 60" className="w-full h-full text-teal-400 opacity-70">
          <path d="M20,40 Q20,20 40,20 Q50,10 70,20 Q90,20 90,40 Q90,50 70,50 L30,50 Q20,50 20,40 Z" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute bottom-20 left-1/4 w-16 h-10 animate-float blur-sm" style={{ animationDelay: '3.5s' }}>
        <svg viewBox="0 0 100 60" className="w-full h-full text-teal-400 opacity-70">
          <path d="M15,45 Q15,25 35,25 Q45,15 65,25 Q85,25 85,45 Q85,55 65,55 L25,55 Q15,55 15,45 Z" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute top-1/2 left-12 w-14 h-8 animate-float blur-sm" style={{ animationDelay: '2.5s' }}>
        <svg viewBox="0 0 100 60" className="w-full h-full text-teal-400 opacity-70">
          <path d="M25,45 Q25,30 40,30 Q50,20 70,30 Q85,30 85,45 Q85,50 70,50 L35,50 Q25,50 25,45 Z" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute top-10 left-1/2 w-18 h-11 animate-float blur-sm" style={{ animationDelay: '4.5s' }}>
        <svg viewBox="0 0 100 60" className="w-full h-full text-teal-400 opacity-70">
          <path d="M10,40 Q10,20 30,20 Q40,10 60,20 Q80,15 85,35 Q90,40 85,45 L25,45 Q10,45 10,40 Z" fill="currentColor" />
        </svg>
      </div>
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src={logoSrc} alt="dollyland.ai" className="h-20 w-auto object-contain" />
            <span className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-sm font-bold px-3 py-2 rounded-full tracking-wide">
              ALPHA
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold mb-8 leading-tight">
            <span className="text-foreground">The AI Agent</span>
            <span className="block bg-gradient-primary bg-clip-text text-transparent mt-2">Marketplace</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed font-medium">
            Create, train, and monetize AI agents with your expertise. Join the marketplace and start earning today.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-12 animate-slide-up hidden" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-5 h-5 text-primary" />
            <span>10,000+ Active Users</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="w-5 h-5 text-primary" />
            <span>500+ Enterprise Clients</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>$2M+ Agent Revenue</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button variant="default" size="lg" onClick={() => navigate('/auth')} className="shadow-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            Start Building Agents
          </Button>
          <Button variant="outline" size="lg" onClick={() => {
            const marketplaceSection = document.getElementById('marketplace');
            marketplaceSection?.scrollIntoView({ behavior: 'smooth' });
          }} className="backdrop-blur-sm">
            Browse Marketplace
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};