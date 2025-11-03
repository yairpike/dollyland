import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useHoverGlow } from "@/hooks/useHoverGlow";

export interface DSCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: string;
  iconColor?: string;
  icon?: LucideIcon;
  size?: "small" | "medium" | "large";
  showGlow?: boolean;
}

const DSCard = React.forwardRef<HTMLDivElement, DSCardProps>(
  ({ className, gradient, iconColor, icon: Icon, size = "medium", showGlow = true, children, ...props }, ref) => {
    const { isHovered, hoverProps } = useHoverGlow();

    const sizeClasses = {
      small: "p-6",
      medium: "p-8",
      large: "p-12",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm transition-all duration-700 hover:border-primary/50 cursor-pointer",
          sizeClasses[size],
          className
        )}
        style={{
          transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        }}
        {...hoverProps}
        {...props}
      >
        {/* Gradient mesh background */}
        {gradient && showGlow && (
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-all duration-700",
              gradient
            )} 
          />
        )}
        
        {/* Glow effect */}
        {gradient && showGlow && (
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-700",
              gradient
            )} 
          />
        )}
        
        <div className="relative h-full flex flex-col">
          {Icon && gradient && (
            <div className="mb-6">
              <div className={cn(
                "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg relative",
                gradient
              )}>
                <Icon className={cn("w-8 h-8", iconColor)} />
                {/* Pulse ring */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-50 group-hover:scale-150 transition-all duration-700 blur-md",
                  gradient
                )} />
              </div>
            </div>
          )}
          
          {children}
        </div>
        
        {/* Border glow on hover */}
        {isHovered && showGlow && (
          <div className="absolute inset-0 border-2 border-primary/30 rounded-lg pointer-events-none shadow-lg shadow-primary/10" />
        )}
      </div>
    );
  }
);
DSCard.displayName = "DSCard";

export { DSCard };
