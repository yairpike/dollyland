import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Sparkles, 
  Brain, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  ChefHat, 
  Shield,
  Globe,
  Zap,
  ArrowRight,
  ExternalLink
} from "lucide-react";

const products = [
  {
    id: "flashcards",
    name: "Flashcards",
    tagline: "Smart flashcards with spaced repetition",
    description: "An intelligent learning platform to help you memorize and retain information effectively.",
    icon: BookOpen,
    gradient: "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
    iconColor: "text-cyan-400",
    compatibility: ["Web"],
    url: "#"
  },
  {
    id: "aura-cycle",
    name: "Aura Cycle",
    tagline: "A private space to understand your cycle",
    description: "Your data is yours - everything stays on your device, always. Works offline.",
    icon: Calendar,
    gradient: "from-pink-500/20 via-purple-500/20 to-violet-500/20",
    iconColor: "text-pink-400",
    compatibility: ["Web", "Offline"],
    url: "#"
  },
  {
    id: "stealth-wealth",
    name: "Stealth Wealth",
    tagline: "Portfolio tracking with real-time stock prices",
    description: "Set up your portfolio with accurate financial data and track your investments privately.",
    icon: TrendingUp,
    gradient: "from-emerald-500/20 via-green-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
    compatibility: ["Web", "Local Storage"],
    url: "#"
  },
  {
    id: "sage",
    name: "Sage",
    tagline: "Smart recipe management with AI",
    description: "AI-powered recipe generation, meal planning, and intelligent pantry management. Your culinary journey starts here.",
    icon: ChefHat,
    gradient: "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
    iconColor: "text-orange-400",
    compatibility: ["Web", "AI", "Offline"],
    url: "#"
  },
  {
    id: "neura",
    name: "Neura",
    tagline: "AI-powered knowledge management",
    description: "Transform how you learn, research, and grow with intelligent insights, secure browsing, and knowledge evolution tracking.",
    icon: Brain,
    gradient: "from-indigo-500/20 via-blue-500/20 to-cyan-500/20",
    iconColor: "text-indigo-400",
    compatibility: ["Web", "AI", "Privacy"],
    url: "#"
  }
];

export default function Index() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />
      
      {/* Cursor glow effect */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.1), transparent 40%)`
        }}
      />

      {/* Header */}
      <header className="relative z-40 border-b border-border/40 backdrop-blur-xl bg-background/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Dollyland
              </h1>
              <p className="text-xs text-muted-foreground">Innovation Studio</p>
            </div>
          </div>
          <ThemeToggle iconOnly />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Building the Future of Digital Products</span>
          </div>

          {/* Main headline */}
          <h2 className="text-6xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              Where Ideas
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent animate-gradient">
              Become Reality
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We craft innovative digital experiences that empower users to learn, grow, and thrive in the modern world.
          </p>

          {/* CTA */}
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Globe className="w-4 h-4" />
              Our Mission
            </Button>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-1">
            <Sparkles className="w-3 h-3 mr-2" />
            Our Products
          </Badge>
          <h3 className="text-4xl font-bold mb-4">Innovation in Action</h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Each product is crafted with care, designed to solve real problems and enhance your digital life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {products.map((product) => {
            const Icon = product.icon;
            const isHovered = hoveredProduct === product.id;

            return (
              <Card
                key={product.id}
                className={`group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 ${
                  isHovered ? "scale-[1.02]" : ""
                }`}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="relative p-6 space-y-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${product.gradient} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon className={`w-7 h-7 ${product.iconColor}`} />
                  </div>

                  {/* Title */}
                  <div>
                    <h4 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {product.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>

                  {/* Compatibility badges */}
                  <div className="flex flex-wrap gap-2">
                    {product.compatibility.map((tech) => (
                      <Badge 
                        key={tech} 
                        variant="secondary" 
                        className="text-xs px-2 py-0.5"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-between group/btn hover:bg-primary/10"
                      onClick={() => window.open(product.url, '_blank')}
                    >
                      <span>Learn More</span>
                      <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 backdrop-blur-xl bg-background/50 mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Dollyland</h3>
                <p className="text-sm text-muted-foreground">Innovation Studio</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/40 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Dollyland. Building the future, one product at a time.
            </p>
          </div>
        </div>
      </footer>

      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
    </div>
  );
}
