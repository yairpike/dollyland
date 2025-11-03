import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface DSDataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  animated?: boolean;
}

const DSDataCard = React.forwardRef<HTMLDivElement, DSDataCardProps>(
  ({ className, icon: Icon, label, value, change, changeType = "neutral", animated = true, ...props }, ref) => {
    const changeColors = {
      positive: "text-success",
      negative: "text-destructive",
      neutral: "text-muted-foreground",
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm p-6",
          "group hover:border-primary/50 transition-all duration-500 hover:shadow-glow",
          className
        )}
        {...props}
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative space-y-3">
          {/* Header with icon */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
            {Icon && (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Value */}
          <div className="flex items-baseline justify-between">
            <div
              className={cn(
                "text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent",
                animated && "transition-all duration-500"
              )}
            >
              {value}
            </div>
            
            {/* Change indicator */}
            {change && (
              <span className={cn("text-sm font-medium", changeColors[changeType])}>
                {change}
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  }
);
DSDataCard.displayName = "DSDataCard";

export { DSDataCard };
