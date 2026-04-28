"use client";

/**
 * Sun/moon toggle — pure CSS rotate transition, no JS animation.
 * Reference: TASKS.md T-043, BRANDING.md §7
 */

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t.nav.themeToggle}
      title={t.nav.themeToggle}
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-full",
        "border border-border/60 bg-background/50 text-muted-foreground backdrop-blur",
        "transition-colors hover:border-border hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute size-4 transition-all duration-300",
          isDark
            ? "scale-0 -rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100",
        )}
        aria-hidden
      />
      <Moon
        className={cn(
          "absolute size-4 transition-all duration-300",
          isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 rotate-90 opacity-0",
        )}
        aria-hidden
      />
    </button>
  );
}
