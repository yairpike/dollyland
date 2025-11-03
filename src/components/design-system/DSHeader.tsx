import * as React from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

export interface DSHeaderProps {
  logo?: string;
  brandName?: string;
  showThemeToggle?: boolean;
  className?: string;
}

export const DSHeader: React.FC<DSHeaderProps> = ({ 
  logo, 
  brandName = "Dollyland",
  showThemeToggle = true,
  className 
}) => {
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logo && <img src={logo} alt={brandName} className="h-8 w-auto" />}
          <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
            {brandName}
          </span>
        </div>
        {showThemeToggle && <ThemeToggle />}
      </div>
    </header>
  );
};
