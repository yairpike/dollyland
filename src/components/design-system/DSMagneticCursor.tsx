import * as React from "react";
import { useMousePosition } from "@/hooks/useMousePosition";

export interface DSMagneticCursorProps {
  size?: number;
  color?: string;
  opacity?: number;
}

export const DSMagneticCursor: React.FC<DSMagneticCursorProps> = ({ 
  size = 800, 
  color = 'hsl(var(--primary))',
  opacity = 0.15 
}) => {
  const mousePosition = useMousePosition();

  return (
    <div 
      className="fixed w-[800px] h-[800px] rounded-full pointer-events-none transition-all duration-500 blur-3xl mix-blend-screen"
      style={{
        background: `radial-gradient(circle, ${color} 0%, ${color.replace(')', ' / 0.5)')} 30%, transparent 70%)`,
        left: mousePosition.x - size / 2,
        top: mousePosition.y - size / 2,
        opacity,
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};
