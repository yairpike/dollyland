import { Bot, Users, BarChart3, Settings, Plus, Home, Store } from "lucide-react";
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
  { title: "Marketplace", url: "/marketplace", icon: Store },
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
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground";

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"}>
      <SidebarContent className="bg-card border-r">
        {/* Logo Section */}
        <div className="p-4 border-b">
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
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user.email?.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Good morning!</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 py-4">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mb-1">
                    <NavLink
                      to={item.url}
                      end
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${getNavCls(
                        isActive(item.url)
                      )}`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {state !== "collapsed" && <span className="text-sm">{item.title}</span>}
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