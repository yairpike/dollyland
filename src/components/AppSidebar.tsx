import { Bot, Users, BarChart3, Settings, Plus, Home, ShoppingBag } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
// Using uploaded logo directly

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
      className="w-72 hidden lg:flex"
      collapsible="none"
    >
      <SidebarContent className="bg-card border-none rounded-r-3xl">
        {/* Logo Section */}
        <div className="p-6 border-none">
          <div className="flex items-center gap-3">
            <img src="/lovable-uploads/8dc3b4f9-4ebf-4b9b-90c7-c85727a0e166.png" alt="dolly" className="flex-shrink-0 w-[72px] h-[72px]" />
            <h2 className="font-semibold text-lg text-foreground">dolly</h2>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 py-4 border-none bg-muted/30 rounded-2xl mx-4 mb-4">
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
            <SidebarMenu className="space-y-2 px-4 py-6">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-2">
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink
                      to={item.url}
                      end
                      className={`flex items-center transition-all duration-200 w-full gap-4 px-4 py-3 ${getNavCls(isActive(item.url))}`}
                      title={item.title}
                    >
                      <item.icon className="flex-shrink-0 h-6 w-6" />
                      <span className="text-sm font-medium">{item.title}</span>
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