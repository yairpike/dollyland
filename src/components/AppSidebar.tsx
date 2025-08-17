import { Bot, Users, BarChart3, Settings, Plus, Home, ShoppingBag } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AppSidebarProps {
  onNavigate?: () => void;
}

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

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
        <div className="flex items-start gap-3">
          <img src="/lovable-uploads/8dc3b4f9-4ebf-4b9b-90c7-c85727a0e166.png" alt="dolly" className="flex-shrink-0 w-16 h-16" />
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
                      ? "bg-primary text-primary-foreground font-medium" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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