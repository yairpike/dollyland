import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Building2, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";

export const Hero = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const logoSrc = theme === 'dark' ? '/lovable-uploads/c8c73254-3940-4a5b-b990-cb30d21dc890.png' : '/lovable-uploads/85abbc87-fafc-4307-86a1-f85ed74b639e.png';
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-blue-500/20"></div>
      
      {/* Fun floating elements */}
      <div className="absolute top-20 left-16 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-float shadow-2xl flex items-center justify-center text-2xl">
        🚀
      </div>
      <div className="absolute bottom-32 right-20 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl animate-float shadow-2xl flex items-center justify-center text-2xl rotate-12" style={{ animationDelay: '2s' }}>
        🤖
      </div>
      <div className="absolute top-1/3 right-16 w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-float shadow-2xl flex items-center justify-center text-xl" style={{ animationDelay: '4s' }}>
        ⭐
      </div>
      <div className="absolute bottom-1/4 left-20 w-18 h-18 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl animate-float shadow-2xl flex items-center justify-center text-xl -rotate-12" style={{ animationDelay: '1s' }}>
        💡
      </div>
      <div className="absolute top-2/3 left-1/3 w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full animate-float shadow-2xl flex items-center justify-center text-lg" style={{ animationDelay: '3s' }}>
        🎯
      </div>
      <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full animate-float shadow-xl flex items-center justify-center text-sm" style={{ animationDelay: '5s' }}>
        ✨
      </div>
      <div className="absolute bottom-1/3 right-1/3 w-22 h-22 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl animate-float shadow-2xl flex items-center justify-center text-xl rotate-45" style={{ animationDelay: '0.5s' }}>
        🔥
      </div>
      <div className="absolute top-1/2 left-12 w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full animate-float shadow-lg flex items-center justify-center text-sm" style={{ animationDelay: '2.5s' }}>
        💎
      </div>
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src={logoSrc} alt="dollyland.ai" className="h-20 w-auto object-contain" />
            <span className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-sm font-bold px-3 py-2 rounded-full tracking-wide">
              CLOSED ALPHA
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="text-white drop-shadow-lg">The AI Agent</span>
            <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mt-2 drop-shadow-lg">Marketplace</span>
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-md">
            Create, train, and monetize AI agents with your expertise. Currently in closed alpha - invite only.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 text-white/80 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <Users className="w-5 h-5 text-yellow-400" />
            <span className="font-medium">10,000+ Active Users</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span className="font-medium">500+ Enterprise Clients</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <TrendingUp className="w-5 h-5 text-pink-400" />
            <span className="font-medium">$2M+ Agent Revenue</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button variant="default" size="lg" onClick={() => navigate('/auth')} className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold shadow-2xl transform hover:scale-105 transition-all duration-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Start Building Agents
          </Button>
          <Button variant="outline" size="lg" onClick={() => {
            const marketplaceSection = document.getElementById('marketplace');
            marketplaceSection?.scrollIntoView({ behavior: 'smooth' });
          }} className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 shadow-xl">
            Browse Marketplace
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};