import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DSBreadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & { separator?: React.ReactNode }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
DSBreadcrumb.displayName = "DSBreadcrumb";

const DSBreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-2 break-words text-sm text-muted-foreground",
      className
    )}
    {...props}
  />
));
DSBreadcrumbList.displayName = "DSBreadcrumbList";

const DSBreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-2", className)}
    {...props}
  />
));
DSBreadcrumbItem.displayName = "DSBreadcrumbItem";

const DSBreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { asChild?: boolean }
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "transition-all duration-300 hover:text-foreground",
      "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0",
      "after:bg-gradient-to-r after:from-primary after:to-primary-glow",
      "after:transition-all after:duration-300 hover:after:w-full",
      className
    )}
    {...props}
  />
));
DSBreadcrumbLink.displayName = "DSBreadcrumbLink";

const DSBreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-medium text-foreground", className)}
    {...props}
  />
));
DSBreadcrumbPage.displayName = "DSBreadcrumbPage";

const DSBreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    {children ?? (
      <ChevronRight className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent" />
    )}
  </li>
);
DSBreadcrumbSeparator.displayName = "DSBreadcrumbSeparator";

export {
  DSBreadcrumb,
  DSBreadcrumbList,
  DSBreadcrumbItem,
  DSBreadcrumbLink,
  DSBreadcrumbPage,
  DSBreadcrumbSeparator,
};
