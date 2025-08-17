import { Bot, Users, BarChart3, Settings, Plus, Home, ShoppingBag } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import dollyLogo from "@/assets/dolly-logo.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Agents", url: "/dashboard", icon: Bot },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath === "/";
    }
    return currentPath === path;
  };

  const getNavCls = (active: boolean) =>
    active 
      ? "bg-urbanist-lavender text-urbanist-dark font-medium rounded-xl" 
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-xl";

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-72"}>
      <SidebarContent className="bg-card border-none shadow-lg rounded-r-3xl">
        {/* Logo Section */}
        <div className="p-6 border-none">
          <div className="flex items-center gap-3">
            <img src={dollyLogo} alt="dolly" className="w-8 h-8" />
            {state !== "collapsed" && (
              <div>
                <h2 className="font-semibold text-lg">dolly</h2>
                <p className="text-xs text-muted-foreground">AI Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {state !== "collapsed" && user && (
          <div className="px-6 py-4 border-none bg-gradient-to-r from-urbanist-lavender/30 to-transparent rounded-2xl mx-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-urbanist-lavender to-primary/20 flex items-center justify-center shadow-lg">
                <span className="text-sm font-semibold text-urbanist-dark">
                  {user.email?.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-urbanist-dark">Good morning!</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="px-4 py-6 space-y-2">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-2">
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink
                      to={item.url}
                      end
                      className={`flex items-center gap-4 px-4 py-3 transition-all duration-200 w-full ${getNavCls(
                        isActive(item.url)
                      )}`}
                    >
                      <item.icon className="h-6 w-6 flex-shrink-0" />
                      {state !== "collapsed" && <span className="text-sm font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}