import { Bot, Users, BarChart3, Settings, Plus, Home, ShoppingBag } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import dollyLogo from "@/assets/dolly-logo-new.png";

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
    <Sidebar 
      className={`transition-all duration-300 ${state === "collapsed" ? "w-16" : "w-72"}`}
      collapsible="icon"
    >
      <SidebarContent className="bg-card border-none shadow-lg rounded-r-3xl pr-6">
        {/* Logo Section */}
        <div className={`p-6 border-none ${state === "collapsed" ? "px-2 py-4" : ""}`}>
          <div className="flex items-center gap-3 justify-center">
            <img src={dollyLogo} alt="dolly" className={`flex-shrink-0 ${state === "collapsed" ? "w-10 h-10" : "w-8 h-8"}`} />
            {state !== "collapsed" && (
              <h2 className="font-semibold text-lg text-foreground">dolly</h2>
            )}
          </div>
        </div>

        {/* User Info - Only show when expanded */}
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

        {/* Collapsed User Avatar */}
        {state === "collapsed" && user && (
          <div className="px-2 py-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-urbanist-lavender to-primary/20 flex items-center justify-center shadow-lg mx-auto">
              <span className="text-sm font-semibold text-urbanist-dark">
                {user.email?.slice(0, 1).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className={`space-y-2 ${state === "collapsed" ? "px-1 py-4" : "px-4 py-6"}`}>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-2">
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink
                      to={item.url}
                      end
                      className={`flex items-center transition-all duration-200 w-full ${
                        state === "collapsed" 
                          ? `justify-center px-1 py-4 rounded-xl ${getNavCls(isActive(item.url))}`
                          : `gap-4 px-4 py-3 ${getNavCls(isActive(item.url))}`
                      }`}
                      title={state === "collapsed" ? item.title : undefined}
                    >
                      <item.icon className={`flex-shrink-0 ${state === "collapsed" ? "h-7 w-7" : "h-6 w-6"}`} />
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