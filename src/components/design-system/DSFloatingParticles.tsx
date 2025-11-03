import * as React from "react";

export interface DSFloatingParticlesProps {
  count?: number;
  color?: string;
  minDuration?: number;
  maxDuration?: number;
}

export const DSFloatingParticles: React.FC<DSFloatingParticlesProps> = ({ 
  count = 20, 
  color = 'bg-primary/20',
  minDuration = 10,
  maxDuration = 20
}) => {
  const particles = React.useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${minDuration + Math.random() * (maxDuration - minDuration)}s`,
    })),
    [count, minDuration, maxDuration]
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute w-1 h-1 ${color} rounded-full animate-float`}
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  );
};
