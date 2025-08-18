import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Menu, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ThemeToggle } from "./ThemeToggle";
import { LoadingAnimation } from "./LoadingAnimation";
import dollyLogo from "/lovable-uploads/8dc3b4f9-4ebf-4b9b-90c7-c85727a0e166.png";

export const Header = () => {
  const { user, signOut, loading, initializing } = useAuth();
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
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 hover:scale-105 transition-transform">
              {loading || initializing ? (
                <LoadingAnimation size="md" />
              ) : (
                <img src={dollyLogo} alt="dolly" className="w-12 h-12 rounded-xl" />
              )}
              <div>
                <h1 className="text-xl font-semibold text-foreground">dolly</h1>
              </div>
            </Link>
            
            {/* Navigation - Hidden on mobile, replaced by mobile menu */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/marketplace" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-accent/50">
                Marketplace
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-accent/50">
                    My Agents
                  </Link>
                </>
              ) : (
                <>
                  <a href="#agents" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-accent/50">Features</a>
                  <a href="#upload" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-accent/50">Upload</a>
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
                  
                  {/* Theme Toggle */}
                  <ThemeToggle />
                  
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