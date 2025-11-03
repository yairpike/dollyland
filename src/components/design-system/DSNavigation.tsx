import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface DSNavigationProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
  blur?: boolean;
}

const DSNavigation = React.forwardRef<HTMLElement, DSNavigationProps>(
  ({ className, sticky = true, blur = true, children, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          "w-full z-50 border-b border-border/50",
          sticky && "sticky top-0",
          blur && "bg-background/80 backdrop-blur-md",
          "shadow-sm transition-all duration-300",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-6">
          {children}
        </div>
      </nav>
    );
  }
);
DSNavigation.displayName = "DSNavigation";

export interface DSNavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: LucideIcon;
  isActive?: boolean;
}

const DSNavItem = React.forwardRef<HTMLAnchorElement, DSNavItemProps>(
  ({ className, icon: Icon, isActive, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
          "hover:bg-accent/50 hover:text-accent-foreground hover:shadow-glow",
          isActive && [
            "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground",
            "shadow-glow font-semibold",
          ],
          className
        )}
        {...props}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </a>
    );
  }
);
DSNavItem.displayName = "DSNavItem";

const DSNavList = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        {...props}
      />
    );
  }
);
DSNavList.displayName = "DSNavList";

export { DSNavigation, DSNavItem, DSNavList };
