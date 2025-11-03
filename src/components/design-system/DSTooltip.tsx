import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const DSTooltipProvider = TooltipPrimitive.Provider;
const DSTooltip = TooltipPrimitive.Root;
const DSTooltipTrigger = TooltipPrimitive.Trigger;

const DSTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-lg border border-border/50 bg-card/90 backdrop-blur-md px-3 py-1.5 text-sm shadow-glow",
      "bg-gradient-to-r from-primary/5 to-primary-glow/5",
      "animate-in fade-in-0 zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2",
      "data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
DSTooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { DSTooltip, DSTooltipTrigger, DSTooltipContent, DSTooltipProvider };
