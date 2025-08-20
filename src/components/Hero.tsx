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
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-16 w-24 h-20 bg-primary/20 rounded-3xl animate-float blur-sm"></div>
      <div className="absolute bottom-32 right-20 w-32 h-28 bg-accent/40 rounded-3xl animate-float blur-sm" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-16 w-20 h-24 bg-muted/50 rounded-3xl animate-float blur-sm" style={{ animationDelay: '4s' }}></div>
      <div className="absolute bottom-1/4 left-20 w-28 h-32 bg-primary/15 rounded-3xl animate-float blur-sm" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-2/3 left-1/3 w-16 h-20 bg-accent/30 rounded-3xl animate-float blur-sm" style={{ animationDelay: '3s' }}></div>
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src={logoSrc} alt="dollyland.ai" className="h-20 w-auto object-contain" />
            <span className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-sm font-bold px-3 py-2 rounded-full tracking-wide">
              CLOSED ALPHA
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold mb-8 leading-tight">
            <span className="text-foreground">The AI Agent</span>
            <span className="block bg-gradient-primary bg-clip-text text-transparent mt-2">Marketplace</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed font-medium">
            Create, train, and monetize AI agents with your expertise. Currently in closed alpha - invite only.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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