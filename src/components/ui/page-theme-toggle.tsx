import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface PageThemeToggleProps {
  className?: string;
}

export function PageThemeToggle({ className }: PageThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={cn("flex justify-end px-4 py-2", className)}>
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? (
          <>
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </>
        )}
      </button>
    </div>
  );
}
