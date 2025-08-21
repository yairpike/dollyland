import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  iconOnly?: boolean;
}

export function ThemeToggle({ iconOnly = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size={iconOnly ? "icon" : "sm"}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="flex items-center gap-2 rounded-full shadow-sm"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-foreground" />
      ) : (
        <Sun className="h-4 w-4 text-foreground" />
      )}
      {!iconOnly && (
        <span className="text-sm font-medium">
          {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        </span>
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}