import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const dsAlertVariants = cva(
  "relative w-full rounded-xl border p-4 backdrop-blur-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: [
          "bg-card/40 border-border/50 text-foreground",
          "hover:shadow-glow hover:border-primary/50",
        ],
        destructive: [
          "bg-destructive/10 border-destructive/50 text-destructive",
          "hover:shadow-[0_8px_32px_0_hsl(var(--destructive)_/_0.2)]",
          "[&>svg]:text-destructive",
        ],
        success: [
          "bg-success/10 border-success/50 text-success",
          "hover:shadow-[0_8px_32px_0_hsl(var(--success)_/_0.2)]",
          "[&>svg]:text-success",
        ],
        warning: [
          "bg-orange-500/10 border-orange-500/50 text-orange-600 dark:text-orange-400",
          "hover:shadow-[0_8px_32px_0_hsl(25_95%_53%_/_0.2)]",
          "[&>svg]:text-orange-600 dark:[&>svg]:text-orange-400",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface DSAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dsAlertVariants> {
  icon?: LucideIcon;
}

const DSAlert = React.forwardRef<HTMLDivElement, DSAlertProps>(
  ({ className, variant, icon: Icon, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(dsAlertVariants({ variant }), className)}
      {...props}
    >
      {Icon && (
        <div className="flex items-start gap-4">
          <div className="mt-0.5">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">{children}</div>
        </div>
      )}
      {!Icon && children}
    </div>
  )
);
DSAlert.displayName = "DSAlert";

const DSAlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DSAlertTitle.displayName = "DSAlertTitle";

const DSAlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
DSAlertDescription.displayName = "DSAlertDescription";

export { DSAlert, DSAlertTitle, DSAlertDescription, dsAlertVariants };
