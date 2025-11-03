import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const DSSidebarGroupContent = SidebarGroupContent;
const DSSidebarMenu = SidebarMenu;

export interface DSSidebarProps extends React.ComponentPropsWithoutRef<typeof Sidebar> {
  showMagneticEffect?: boolean;
}

const DSSidebar = React.forwardRef<
  React.ElementRef<typeof Sidebar>,
  DSSidebarProps
>(({ className, showMagneticEffect = true, ...props }, ref) => {
  return (
    <Sidebar
      ref={ref}
      className={cn(
        "bg-card/40 backdrop-blur-md border-r border-border/50",
        "shadow-glass",
        className
      )}
      {...props}
    />
  );
});
DSSidebar.displayName = "DSSidebar";

const DSSidebarContent = React.forwardRef<
  React.ElementRef<typeof SidebarContent>,
  React.ComponentPropsWithoutRef<typeof SidebarContent>
>(({ className, ...props }, ref) => (
  <SidebarContent
    ref={ref}
    className={cn("p-4", className)}
    {...props}
  />
));
DSSidebarContent.displayName = "DSSidebarContent";

const DSSidebarGroup = React.forwardRef<
  React.ElementRef<typeof SidebarGroup>,
  React.ComponentPropsWithoutRef<typeof SidebarGroup>
>(({ className, ...props }, ref) => (
  <SidebarGroup
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
DSSidebarGroup.displayName = "DSSidebarGroup";

const DSSidebarGroupLabel = React.forwardRef<
  React.ElementRef<typeof SidebarGroupLabel>,
  React.ComponentPropsWithoutRef<typeof SidebarGroupLabel>
>(({ className, ...props }, ref) => (
  <SidebarGroupLabel
    ref={ref}
    className={cn(
      "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2",
      className
    )}
    {...props}
  />
));
DSSidebarGroupLabel.displayName = "DSSidebarGroupLabel";

const DSSidebarMenuItem = React.forwardRef<
  React.ElementRef<typeof SidebarMenuItem>,
  React.ComponentPropsWithoutRef<typeof SidebarMenuItem>
>(({ className, ...props }, ref) => (
  <SidebarMenuItem
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
DSSidebarMenuItem.displayName = "DSSidebarMenuItem";

const DSSidebarMenuButton = React.forwardRef<
  React.ElementRef<typeof SidebarMenuButton>,
  React.ComponentPropsWithoutRef<typeof SidebarMenuButton> & { isActive?: boolean }
>(({ className, isActive, ...props }, ref) => (
  <SidebarMenuButton
    ref={ref}
    className={cn(
      "relative rounded-lg transition-all duration-300",
      "hover:bg-accent/50 hover:text-accent-foreground",
      "hover:shadow-glow hover:scale-[1.02]",
      isActive && [
        "bg-gradient-to-r from-primary to-primary-glow",
        "text-primary-foreground font-medium shadow-glow",
        "before:absolute before:inset-0 before:rounded-lg before:bg-primary/10 before:blur-sm",
      ],
      className
    )}
    {...props}
  />
));
DSSidebarMenuButton.displayName = "DSSidebarMenuButton";

export {
  DSSidebar,
  DSSidebarContent,
  DSSidebarGroup,
  DSSidebarGroupLabel,
  DSSidebarGroupContent,
  DSSidebarMenu,
  DSSidebarMenuItem,
  DSSidebarMenuButton,
  useSidebar,
};
