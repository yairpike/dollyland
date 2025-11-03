import * as React from "react";
import { cn } from "@/lib/utils";

export interface DSGradientMeshProps {
  opacity?: number;
  colors?: string[];
  animate?: boolean;
}

export const DSGradientMesh: React.FC<DSGradientMeshProps> = ({ 
  opacity = 0.3, 
  colors = ['bg-primary/30', 'bg-purple-500/30', 'bg-indigo-500/30'],
  animate = true 
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ opacity }}>
      <div className={cn(
        "absolute top-0 left-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl",
        colors[0],
        animate && "animate-float"
      )} />
      <div 
        className={cn(
          "absolute top-1/3 right-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl",
          colors[1],
          animate && "animate-float"
        )}
        style={{ animationDelay: '2s' }}
      />
      <div 
        className={cn(
          "absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl",
          colors[2],
          animate && "animate-float"
        )}
        style={{ animationDelay: '4s' }}
      />
    </div>
  );
};
