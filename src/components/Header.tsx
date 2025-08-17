import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Menu, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-hero rounded-3xl flex items-center justify-center shadow-soft">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-medium">AgentHub</h1>
                <p className="text-xs text-muted-foreground">AI Agent Creation</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-medium">AgentHub</h1>
              </div>
            </Link>
            
            {/* Navigation - Hidden on mobile, replaced by mobile menu */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              <Link to="/marketplace" className="text-foreground hover:text-primary transition-colors">
                Marketplace
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                    My Agents
                  </Link>
                </>
              ) : (
                <>
                  <a href="#agents" className="text-foreground hover:text-primary transition-colors">Features</a>
                  <a href="#upload" className="text-foreground hover:text-primary transition-colors">Upload</a>
                </>
              )}
            </nav>
            
            {/* CTA Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                    <AvatarFallback className="text-xs">
                      {user.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Settings Button */}
                  <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="hidden sm:inline-flex">
                    <Settings className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Settings</span>
                  </Button>
                  
                  {/* Desktop Sign Out */}
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden lg:inline-flex">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                  
                  {/* Mobile Menu Button - with click handler */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden"
                    onClick={() => {
                      // For now, navigate to settings - you can implement a proper mobile menu later
                      navigate('/settings');
                    }}
                  >
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};