import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const dsBadgeVariants = cva(
  "inline-flex items-center rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground px-2.5 py-0.5",
        outline: "border-primary/30 bg-primary/5 backdrop-blur-sm px-6 py-2",
        gradient: "text-white border-0 px-4 py-1.5",
        secondary: "bg-secondary text-secondary-foreground px-4 py-1.5",
        glassmorphic: "bg-background/80 backdrop-blur-sm border border-border/50 px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface DSBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dsBadgeVariants> {
  icon?: LucideIcon;
  gradient?: string;
  animate?: boolean;
}

function DSBadge({ className, variant, icon: Icon, gradient, animate, children, ...props }: DSBadgeProps) {
  const badgeClassName = cn(
    dsBadgeVariants({ variant }),
    variant === "gradient" && gradient && `bg-gradient-to-r ${gradient}`,
    animate && "animate-pulse-glow",
    className
  );

  return (
    <div className={badgeClassName} {...props}>
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </div>
  );
}

export { DSBadge, dsBadgeVariants };
