import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Menu, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ThemeToggle } from "./ThemeToggle";
import { UserRole } from "@/components/UserRole";
import { LoadingAnimation } from "./LoadingAnimation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
export const Header = () => {
  const {
    user,
    signOut,
    loading,
    initializing
  } = useAuth();
  const {
    theme
  } = useTheme();
  const navigate = useNavigate();
  const logoSrc = theme === 'dark' ? '/lovable-uploads/c8c73254-3940-4a5b-b990-cb30d21dc890.png' : '/lovable-uploads/85abbc87-fafc-4307-86a1-f85ed74b639e.png';
  const [userProfile, setUserProfile] = useState<{ first_name?: string } | null>(null);

  // Fetch user profile to get first name
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUserProfile(data);
        }
      };
      fetchProfile();
    }
  }, [user]);
  const handleSignOut = async () => {
    try {
      console.log('Header: Starting sign out process');
      const {
        error
      } = await signOut();
      if (error) {
        console.error('Header: Sign out error:', error);
        // Even if there's an error, try to clear state and redirect
        localStorage.clear();
        navigate("/auth", {
          replace: true
        });
        toast.error("Sign out completed with issues - you have been logged out");
      } else {
        console.log('Header: Sign out successful');
        toast.success("Signed out successfully");
        localStorage.clear();
        navigate("/auth", {
          replace: true
        });
      }
    } catch (err) {
      console.error('Header: Unexpected sign out error:', err);
      // Force sign out by clearing everything
      localStorage.clear();
      navigate("/auth", {
        replace: true
      });
      toast.info("Signed out (forced)");
    }
  };
  return <>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 hover:scale-105 transition-transform">
              {loading || initializing ? <LoadingAnimation size="md" /> : <img src={logoSrc} alt="dollyland.ai" className="h-8 sm:h-12 w-auto object-contain" />}
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                {user && userProfile?.first_name && (
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {userProfile.first_name}'s
                  </p>
                )}
                <h1 className="text-sm sm:text-xl font-semibold text-foreground">dollyland.ai</h1>
                <span className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded-full tracking-wide flex-shrink-0">
                  ALPHA
                </span>
              </div>
            </Link>
            
            {/* Navigation - Hidden on mobile, replaced by mobile menu */}
            <nav className="hidden lg:flex items-center gap-8">
              {user ? <>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-accent/50 hover:scale-105 transform">
                    My Agents
                  </Link>
                </> : <>
                  <a href="#features" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-accent/50 hover:scale-105 transform story-link">Features</a>
                  <a href="#use-cases" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-accent/50 hover:scale-105 transform story-link">Use Cases</a>
                  <a href="#upload" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-accent/50 hover:scale-105 transform story-link">Upload</a>
                  <a href="#marketplace" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-accent/50 hover:scale-105 transform story-link">Marketplace</a>
                </>}
            </nav>
            
            {/* CTA Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? <>
                  <UserRole className="hidden sm:flex" />
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
                  <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => {
                // For now, navigate to settings - you can implement a proper mobile menu later
                navigate('/settings');
              }}>
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </> : <>
                  {/* Theme Toggle for logged-out users */}
                  <ThemeToggle iconOnly />
                  
                  <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                  </Button>
                </>}
            </div>
          </div>
        </div>
      </header>
    </>;
};