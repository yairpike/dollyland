import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingAnimation = ({ size = "md", className }: LoadingAnimationProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);

  const frames = [
    "/lovable-uploads/eb1dabfc-b5a4-4928-bf12-e80fd327c5e0.png",
    "/lovable-uploads/e92bc1e8-3bee-4e15-9029-5fd50d67f34e.png", 
    "/lovable-uploads/5b1351f1-eb08-42de-a159-a305361a0caa.png",
    "/lovable-uploads/a102e3bc-0839-46b1-9758-21d5ef8ae362.png"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 300); // Change frame every 300ms

    return () => clearInterval(interval);
  }, [frames.length]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img 
        src={frames[currentFrame]} 
        alt="Loading..." 
        className={cn(
          "animate-pulse transition-opacity duration-150",
          sizeClasses[size]
        )}
      />
    </div>
  );
};