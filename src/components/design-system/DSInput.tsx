import * as React from "react";
import { cn } from "@/lib/utils";

export interface DSInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const DSInput = React.forwardRef<HTMLInputElement, DSInputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-xl border border-border/50 bg-input/50 backdrop-blur-sm px-4 py-3 text-sm",
            "ring-offset-background transition-all duration-300",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0",
            "focus-visible:border-primary focus-visible:shadow-glow",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            label && "pt-6",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
          }}
          onChange={(e) => setHasValue(!!e.target.value)}
          {...props}
        />
        {label && (
          <label
            className={cn(
              "absolute left-4 transition-all duration-300 pointer-events-none",
              "text-muted-foreground",
              (isFocused || hasValue) && [
                "top-2 text-xs font-medium",
                "bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent",
              ],
              !isFocused && !hasValue && "top-1/2 -translate-y-1/2 text-sm"
            )}
          >
            {label}
          </label>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
DSInput.displayName = "DSInput";

export { DSInput };
