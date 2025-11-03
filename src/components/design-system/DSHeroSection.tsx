import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface DSHeroSectionProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  scrollY?: number;
  showScrollIndicator?: boolean;
  className?: string;
}

export const DSHeroSection: React.FC<DSHeroSectionProps> = ({ 
  badge,
  title, 
  subtitle,
  scrollY = 0,
  showScrollIndicator = true,
  className 
}) => {
  return (
    <section className={cn("container mx-auto px-6 py-32 text-center relative", className)}>
      {badge && <div className="mb-8">{badge}</div>}
      
      <h1 className="text-7xl md:text-9xl font-bold mb-8 tracking-tight leading-none">
        {typeof title === 'string' ? (
          <span className="block bg-gradient-to-r from-primary via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            {title}
          </span>
        ) : title}
      </h1>
      
      {subtitle && (
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-16 leading-relaxed font-light">
          {subtitle}
        </p>
      )}
      
      {showScrollIndicator && (
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50 mt-20">
          <span className="text-xs uppercase tracking-wider">Explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      )}
    </section>
  );
};
