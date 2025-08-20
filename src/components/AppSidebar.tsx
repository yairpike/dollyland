import { Bot, Users, BarChart3, Settings, Plus, Home, ShoppingBag } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AppSidebarProps {
  onNavigate?: () => void;
}

const mainItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const currentPath = location.pathname;
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

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath === "/";
    }
    return currentPath === path;
  };

  return (
    <div className="w-72 h-screen bg-card border-r flex flex-col">
      {/* Logo Section */}
      <div className="p-4 sm:p-6 border-b">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={logoSrc} alt="dollyland.ai" className="h-12 sm:h-16 w-auto object-contain flex-shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            {user && userProfile?.first_name && (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                  {userProfile.first_name}'s
                </p>
                <span className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full tracking-wide flex-shrink-0">
                  ALPHA
                </span>
              </div>
            )}
            {!user || !userProfile?.first_name ? (
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <h2 className="font-semibold text-sm sm:text-lg text-foreground">dollyland.ai</h2>
                <span className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full tracking-wide flex-shrink-0">
                  ALPHA
                </span>
              </div>
            ) : (
              <h2 className="font-semibold text-sm sm:text-lg text-foreground">dollyland.ai</h2>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {mainItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                end
                onClick={onNavigate}
                className={({ isActive: navIsActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.url) 
                      ? "bg-primary text-[hsl(var(--button-primary-text))] font-medium" 
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}