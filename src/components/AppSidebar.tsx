import { Bot, Users, BarChart3, Settings, Plus, Home, ShoppingBag } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";

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

  const logoSrc = theme === 'dark' ? '/lovable-uploads/cloud-brain-dark.png' : '/lovable-uploads/85abbc87-fafc-4307-86a1-f85ed74b639e.png';

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath === "/";
    }
    return currentPath === path;
  };

  return (
    <div className="w-72 h-screen bg-card border-r flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="dolly" className="flex-shrink-0 w-16 h-16 object-contain" />
          <div className="flex flex-col">
            <h2 className="font-semibold text-lg text-foreground">dolly</h2>
            {user && (
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
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