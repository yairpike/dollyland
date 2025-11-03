import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface DSMetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  value: string | number;
  label: string;
  gradient?: string;
}

const DSMetricCard = React.forwardRef<HTMLDivElement, DSMetricCardProps>(
  ({ className, icon: Icon, value, label, gradient = "from-primary to-purple-500", ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm p-8 text-center group hover:border-primary/50 transition-all duration-500",
          className
        )}
        {...props}
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative">
          <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
          <div className={cn(
            "text-5xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent",
            gradient
          )}>
            {value}
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider">
            {label}
          </div>
        </div>
      </Card>
    );
  }
);
DSMetricCard.displayName = "DSMetricCard";

export { DSMetricCard };
