import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Brain, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { toast } from "sonner";

export const Header = () => {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-glow">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AgentHub</h1>
                <p className="text-xs text-muted-foreground">AI Agent Creation</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {user ? (
                <>
                  <a href="/dashboard" className="text-foreground hover:text-primary transition-colors">Dashboard</a>
                  <a href="#agents" className="text-foreground hover:text-primary transition-colors">Agents</a>
                </>
              ) : (
                <>
                  <a href="#agents" className="text-foreground hover:text-primary transition-colors">Agents</a>
                  <a href="#upload" className="text-foreground hover:text-primary transition-colors">Upload</a>
                </>
              )}
            </nav>
            
            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {user.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => setAuthModalOpen(true)}>
                    Sign In
                  </Button>
                  <Button variant="hero" onClick={() => setAuthModalOpen(true)}>
                    Get Started
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
};