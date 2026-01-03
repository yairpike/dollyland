import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, ArrowRight, ChevronDown, Layers, Rocket } from "lucide-react";
import dollyLogo from "@/assets/dolly-logo-sheep.png";

// Logo imports
import andormanLogo from "@/assets/logos/andorman-logo.png";
import hopphausLogo from "@/assets/logos/hopphaus-logo.png";
import animalsLogo from "@/assets/logos/animals-logo.png";
import zeroLogo from "@/assets/logos/zero-logo.png";
import flashcardsLogo from "@/assets/logos/flashcards-logo.png";
import sageLogo from "@/assets/logos/sage-logo.png";
import stealthwealthLogo from "@/assets/logos/stealthwealth-logo.png";
import auracycleLogo from "@/assets/logos/auracycle-logo.png";
import aetherLogo from "@/assets/logos/aether-logo.png";
import linusLogo from "@/assets/logos/linus-logo.png";

const products = [
  {
    id: 9,
    name: "Dollyland Design System",
    tagline: "Build Like We Do",
    description: "A comprehensive design system with glassmorphic effects, gradient meshes, and 3D transforms. Everything you see here, packaged and ready to use.",
    icon: Layers,
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    iconColor: "text-indigo-300",
    compatibility: ["React", "TypeScript", "Tailwind"],
    url: "/design-system",
    featured: true,
    preview: "Reusable components with cutting-edge design"
  },
  {
    id: 10,
    name: "Aether",
    tagline: "Run Your Properties Without the Chaos",
    description: "One platform for payments, guest access, service bookings, and resident communication. Built for property developers and HOAs.",
    logoImage: aetherLogo,
    gradient: "from-sky-500 via-blue-600 to-indigo-700",
    compatibility: ["Web", "iOS", "Android"],
    url: "https://aether.dollyland.ai",
    size: "large"
  },
  {
    id: 11,
    name: "Linus",
    tagline: "Turn Your Lovable App into a Native App",
    description: "Skip the complexity of Xcode, Android Studio, and certificates. Publish to App Store and Google Play directly from your browser.",
    logoImage: linusLogo,
    gradient: "from-green-500 via-emerald-500 to-teal-600",
    compatibility: ["Web", "iOS", "Android"],
    url: "https://linus.dollyland.ai",
    size: "large"
  },
  {
    id: 1,
    name: "Andorman",
    tagline: "Enterprise Operations, Simplified",
    description: "A powerful ERP platform designed for modern enterprises. Streamline operations, manage resources, and scale your business with intelligent automation.",
    logoImage: andormanLogo,
    gradient: "from-slate-600 via-blue-700 to-indigo-800",
    compatibility: ["Web", "Enterprise"],
    url: "https://andorman.dollyland.ai",
    size: "large"
  },
  {
    id: 2,
    name: "hopp.haus",
    tagline: "All-in-One Property Development",
    description: "The complete platform for property developers. Manage projects, track investments, and streamline your real estate operations in one place.",
    logoImage: hopphausLogo,
    gradient: "from-amber-500 via-orange-500 to-red-600",
    compatibility: ["Web", "Mobile"],
    url: "https://hopphaus.lovable.app",
    size: "medium"
  },
  {
    id: 3,
    name: "ani🐨als",
    tagline: "AI-Powered Animation Studio",
    description: "Create stunning animations with AI. Professional-grade editor combining AI power with intuitive tools. Export to Lottie, MP4, SVG and more.",
    logoImage: animalsLogo,
    gradient: "from-fuchsia-500 via-purple-500 to-violet-600",
    compatibility: ["Web", "iPad", "Android Tablets"],
    url: "https://animals.dollyland.ai",
    size: "medium"
  },
  {
    id: 4,
    name: "ZERØ",
    tagline: "Global Wealth Optimizer",
    description: "Master your finances with intelligent tracking and multi-currency support. Build wealth globally with smart portfolio insights.",
    logoImage: zeroLogo,
    gradient: "from-yellow-500 via-amber-600 to-slate-700",
    compatibility: ["Web", "Mobile"],
    url: "https://zero.dollyland.ai",
    size: "medium"
  },
  {
    id: 5,
    name: "Flashcards",
    tagline: "Smart Flashcards with Spaced Repetition",
    description: "Master any subject faster with AI-powered flashcards and scientifically proven spaced repetition. Completely free, no limits.",
    logoImage: flashcardsLogo,
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    compatibility: ["Web", "iOS", "Android"],
    url: "https://flashcards.dollyland.ai",
    size: "medium"
  },
  {
    id: 6,
    name: "Sage",
    tagline: "Smart Recipe Management",
    description: "AI-powered recipe generation, smart meal planning, and intelligent pantry management. Transform your cooking journey.",
    logoImage: sageLogo,
    gradient: "from-orange-500 via-amber-500 to-yellow-600",
    compatibility: ["Web", "iOS", "Android"],
    url: "https://sage.dollyland.ai",
    size: "medium"
  },
  {
    id: 7,
    name: "StealthWealth",
    tagline: "Track Your Complete Net Worth, Privately",
    description: "Monitor all your assets in one place—stocks, crypto, real estate, and more. No account required. Your data stays on your device.",
    logoImage: stealthwealthLogo,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    compatibility: ["Web", "iOS"],
    url: "https://stealthwealth.dollyland.ai",
    size: "medium"
  },
  {
    id: 8,
    name: "AuraCycle",
    tagline: "A Private Space to Understand Your Cycle",
    description: "Your data is yours. Everything stays on your device, always. Works offline, no internet required.",
    logoImage: auracycleLogo,
    gradient: "from-pink-500 via-rose-500 to-red-600",
    compatibility: ["Web", "iOS", "Android"],
    url: "https://auracycle.dollyland.ai",
    size: "medium"
  }
];

export default function Index() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuredProduct = products.find(p => p.featured);
  const bentoProducts = products.filter(p => !p.featured);

  const handleProductClick = (url: string) => {
    if (url.startsWith('/')) {
      navigate(url);
    } else {
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Animated grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb),0.02)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]" 
        style={{ transform: `translateY(${scrollY * 0.1}px)` }} 
      />
      
      {/* Magnetic cursor glow */}
      <div 
        className="fixed w-[800px] h-[800px] rounded-full pointer-events-none transition-all duration-500 blur-3xl opacity-15 mix-blend-screen"
        style={{
          background: `radial-gradient(circle, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.5) 30%, transparent 70%)`,
          left: mousePosition.x - 400,
          top: mousePosition.y - 400,
        }}
      />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <Navigation currentPage="home" />

      <main className="relative z-10">
        {/* Hero Section */}
        <section ref={heroRef} className="container mx-auto px-6 py-32 text-center relative">
          <Badge variant="outline" className="mb-8 px-6 py-2 text-sm font-medium border-primary/30 bg-primary/5 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2 inline animate-pulse" />
            Innovation Studio
          </Badge>
          
          <h1 className="text-7xl md:text-9xl font-bold mb-8 tracking-tight leading-none">
            <span className="block" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
              Building the
            </span>
            <span className="block bg-gradient-to-r from-primary via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Future of AI
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-16 leading-relaxed font-light">
            We craft intelligent products that push the boundaries of what's possible with artificial intelligence.
          </p>

          {/* Scroll indicator */}
          <div className="flex flex-col items-center gap-2 text-muted-foreground/50 mt-20">
            <span className="text-xs uppercase tracking-wider">Explore</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </section>

        {/* Featured Product Spotlight */}
        {featuredProduct && (
          <section className="relative py-32 overflow-hidden">
            {/* Diagonal background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background transform -skew-y-2 scale-110" />
            
            <div className="container mx-auto px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
                {/* Left: Content */}
                <div className="space-y-8" style={{ transform: `translateX(${scrollY * 0.05}px)` }}>
                  <Badge className={`bg-gradient-to-r ${featuredProduct.gradient} text-white border-0 px-4 py-1.5`}>
                    <Rocket className="w-3 h-3 mr-2" />
                    Featured Product
                  </Badge>
                  
                  <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                    {featuredProduct.name}
                  </h2>
                  
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {featuredProduct.description}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {featuredProduct.compatibility.map((platform) => (
                      <Badge key={platform} variant="secondary" className="px-4 py-1.5">
                        {platform}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      size="lg"
                      className={`bg-gradient-to-r ${featuredProduct.gradient} text-white border-0 hover:scale-105 transition-transform shadow-lg shadow-primary/25`}
                      onClick={() => handleProductClick(featuredProduct.url)}
                    >
                      {featuredProduct.url.startsWith('/') ? 'Explore System' : 'Launch App'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Right: Visual Preview */}
                <div className="relative" style={{ transform: `translateX(${-scrollY * 0.05}px)` }}>
                  <div className={`relative aspect-square rounded-3xl bg-gradient-to-br ${featuredProduct.gradient} p-1 shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500 hover:scale-105 group`}>
                    <div className="w-full h-full rounded-3xl bg-background/95 backdrop-blur-xl flex items-center justify-center relative overflow-hidden">
                      <featuredProduct.icon className={`w-32 h-32 ${featuredProduct.iconColor} opacity-20 group-hover:opacity-40 transition-opacity group-hover:scale-110 duration-500`} />
                      
                      {/* Floating orb effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${featuredProduct.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                    </div>
                  </div>

                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 bg-background border border-border rounded-full p-4 shadow-lg animate-float">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Bento Grid - Remaining Products */}
        <section className="container mx-auto px-6 py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Our Ecosystem
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each product designed to solve real problems with AI-powered innovation
            </p>
          </div>

          {/* Asymmetric Bento Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {bentoProducts.map((product, index) => {
              const isHovered = hoveredProduct === product.id;
              const isLarge = product.size === 'large';
              
              return (
                <Card
                  key={product.id}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className={`group relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm transition-all duration-700 hover:border-primary/50 cursor-pointer ${
                    isLarge ? 'md:col-span-2 md:row-span-2' : 'lg:col-span-2'
                  }`}
                  style={{
                    animationDelay: `${index * 150}ms`,
                    transform: isHovered ? `translateY(-8px) scale(1.02)` : 'translateY(0) scale(1)',
                  }}
                  onClick={() => handleProductClick(product.url)}
                >
                  {/* Gradient mesh background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-5 transition-all duration-700`} />
                  
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-700`} />
                  
                  <div className={`relative ${isLarge ? 'p-12' : 'p-8'} h-full flex flex-col`}>
                    {/* Logo image or icon */}
                    <div className={`${isLarge ? 'w-20 h-20 mb-8' : 'w-16 h-16 mb-6'} rounded-2xl overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg relative`}>
                      {'logoImage' in product ? (
                        <img 
                          src={product.logoImage} 
                          alt={`${product.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      ) : 'icon' in product ? (
                        <div className={`w-full h-full bg-gradient-to-br ${product.gradient} flex items-center justify-center`}>
                          <product.icon className="w-10 h-10 text-white" />
                        </div>
                      ) : null}
                      
                      {/* Pulse ring */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-50 group-hover:scale-150 transition-all duration-700 blur-md`} />
                    </div>

                    <div className="flex-1">
                      <h3 className={`${isLarge ? 'text-4xl mb-3' : 'text-2xl mb-2'} font-bold group-hover:text-primary transition-colors duration-300`}>
                        {product.name}
                      </h3>
                      
                      <p className={`${isLarge ? 'text-base' : 'text-sm'} text-primary/70 mb-4 font-medium`}>
                        {product.tagline}
                      </p>
                      
                      <p className={`${isLarge ? 'text-base' : 'text-sm'} text-muted-foreground/80 mb-6 ${isLarge ? 'line-clamp-3' : 'line-clamp-2'}`}>
                        {product.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {product.compatibility.map((platform) => (
                        <Badge 
                          key={platform} 
                          variant="secondary" 
                          className="text-xs bg-background/80 backdrop-blur-sm group-hover:bg-primary/10 transition-colors"
                        >
                          {platform}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center text-sm font-medium text-primary/70 group-hover:text-primary transition-colors">
                      Explore <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Border glow */}
                  {isHovered && (
                    <div className={`absolute inset-0 border-2 border-primary/30 rounded-lg pointer-events-none shadow-lg shadow-primary/10`} />
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* Innovation Metrics */}
        <section className="container mx-auto px-6 py-32">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm p-8 text-center group hover:border-primary/50 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <Layers className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    10
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Products Launched</div>
                </div>
              </Card>

              <Card className="relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm p-8 text-center group hover:border-primary/50 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                  <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    AI
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Powered Innovation</div>
                </div>
              </Card>

              <Card className="relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm p-8 text-center group hover:border-primary/50 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <Rocket className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
                  <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                    ∞
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Possibilities</div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="container mx-auto px-6 py-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              "Innovation isn't about predicting the future.{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                It's about building it."
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              At Dollyland, we believe in creating products that don't just use AI—they reimagine what's possible.
            </p>
          </div>
        </section>

        {/* Minimalist Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-border/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 opacity-70">
              <img src={dollyLogo} alt="Dollyland" className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Dollyland Innovation Studio
              </span>
            </div>
            
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="mailto:help@hypertimestudio.com" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
