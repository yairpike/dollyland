import { Button } from "@/components/ui/button";
import { Brain, Menu } from "lucide-react";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CloneAI</h1>
              <p className="text-xs text-muted-foreground">Knowledge Multiplication</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#agents" className="text-foreground hover:text-primary transition-colors">Agents</a>
            <a href="#upload" className="text-foreground hover:text-primary transition-colors">Upload</a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
            <a href="#docs" className="text-foreground hover:text-primary transition-colors">Docs</a>
          </nav>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button variant="hero">
              Get Started
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};