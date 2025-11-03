import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const dsButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--button-primary-bg))] text-[hsl(var(--button-primary-text))] hover:bg-[hsl(var(--button-primary-bg))]/90 shadow-sm",
        gradient: "text-white border-0 hover:scale-105 shadow-lg transition-transform duration-300",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface DSButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof dsButtonVariants> {
  asChild?: boolean;
  gradient?: string;
}

const DSButton = React.forwardRef<HTMLButtonElement, DSButtonProps>(
  ({ className, variant, size, asChild = false, gradient, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const buttonClassName = cn(
      dsButtonVariants({ variant, size }),
      variant === "gradient" && gradient && `bg-gradient-to-r ${gradient}`,
      variant === "gradient" && "shadow-primary/25",
      className
    );

    return (
      <Comp
        className={buttonClassName}
        ref={ref}
        {...props}
      />
    );
  }
);
DSButton.displayName = "DSButton";

export { DSButton, dsButtonVariants };
