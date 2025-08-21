import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onCreateAgent?: () => void;
}

export function DashboardLayout({ children, onCreateAgent }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<{ first_name?: string } | null>(null);

  const logoSrc = theme === 'dark' ? '/lovable-uploads/c8c73254-3940-4a5b-b990-cb30d21dc890.png' : '/lovable-uploads/85abbc87-fafc-4307-86a1-f85ed74b639e.png';

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
  
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar - Always visible on lg+ */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen z-10">
        <AppSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
        {/* Header */}
        <header className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 lg:hidden">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu - visible on all screen sizes */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            
            {/* Logo and App Name */}
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt="dollyland.ai" className="h-8 lg:h-10 w-auto object-contain" />
              <div className="flex flex-col min-w-0">
                {user && userProfile?.first_name && (
                  <p className="text-xs font-medium text-foreground truncate">
                    {userProfile.first_name}'s
                  </p>
                )}
                <h1 className="text-lg lg:text-xl font-semibold">dollyland.ai</h1>
                <span className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-[8px] font-bold px-1 py-0.5 rounded-full tracking-wide self-start">
                  ALPHA
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}