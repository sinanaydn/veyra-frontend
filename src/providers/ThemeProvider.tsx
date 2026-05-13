"use client";

/**
 * Theme provider — manages dark/light/system preference, persisted in
 * localStorage('veyra-theme').
 *
 * No-flash strategy: see `ThemeScript` (rendered in <head>) which sets
 * the `class="dark"` on <html> BEFORE React hydrates, so first paint
 * uses the correct palette.
 *
 * Reference: TASKS.md T-031, BRANDING.md §3
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "veyra-theme";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPreference(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  // Mirror to data-theme for selector overrides if needed.
  root.dataset.theme = resolved;
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Lazy initializers run once per render lifecycle:
  //  - On the server: `typeof window === "undefined"` → returns "dark"
  //    (matches the SSR default the markup is laid out for).
  //  - On the client: reads localStorage during the first render, so the
  //    React state agrees with the DOM class set pre-hydration by
  //    `ThemeScript`. No setState-in-effect cascade.
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const stored = readStoredTheme();
    return stored === "system" ? getSystemPreference() : stored;
  });

  // React to OS-level theme changes when in `system` mode.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved = mq.matches ? "dark" : "light";
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem(STORAGE_KEY, t);
    const resolved = t === "system" ? getSystemPreference() : t;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    // Toggle between explicit light/dark; if currently "system", toggle to
    // the opposite of the resolved value so the user sees an immediate change.
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return ctx;
}

/**
 * Inline script — runs before paint, sets `class="dark"` on <html> based
 * on stored/system preference. Eliminates theme flash on cold loads.
 *
 * Implementation: Next.js `<Script strategy="beforeInteractive">` is the
 * supported way in Next 16 / React 19. Plain `<script>` JSX triggers a
 * dev-mode warning ("scripts inside React components are never executed
 * when rendering on the client") and is brittle.
 *
 * Self-contained: no React, no module imports. Reads localStorage and
 * `prefers-color-scheme` synchronously.
 */
import Script from "next/script";

const THEME_BOOT_CODE = `(function(){try{
var k='${STORAGE_KEY}';
var s=localStorage.getItem(k);
var resolved=s==='light'?'light':s==='dark'?'dark':
  (window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
var root=document.documentElement;
if(resolved==='dark')root.classList.add('dark');else root.classList.remove('dark');
root.dataset.theme=resolved;
}catch(e){}})();`;

export function ThemeScript() {
  return (
    <Script
      id="veyra-theme-boot"
      strategy="beforeInteractive"
    >
      {THEME_BOOT_CODE}
    </Script>
  );
}
