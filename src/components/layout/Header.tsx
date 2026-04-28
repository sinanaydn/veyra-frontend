"use client";

/**
 * Top navigation for marketing + customer surfaces.
 *
 * Behavior:
 *  - Sticky, transparent at scroll=0; glass effect (blur + 80% surface)
 *    once user scrolls past 8px.
 *  - Active route gets accent dot indicator (Linear-style).
 *  - Right slot: theme toggle + auth CTAs (or UserMenu when logged in).
 *  - Mobile: hamburger opens MobileNav drawer.
 *
 * Reference: TASKS.md T-040, BRANDING.md §10
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";
import { useScrolled } from "@/hooks/useScrolled";
import { useAuth } from "@/store/auth";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

const NAV_LINKS: ReadonlyArray<NavLink> = [
  { href: "/cars", label: "Araçlar" },
  { href: "/brands", label: "Markalar" },
];

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolled(8);
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Brand + primary nav */}
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group/nlink relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{link.label}</span>
                  <span
                    className={cn(
                      "size-1 rounded-full transition-all",
                      active
                        ? "bg-accent shadow-[0_0_8px_var(--color-accent)]"
                        : "bg-transparent group-hover/nlink:bg-muted-foreground/40",
                    )}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right slot */}
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle className="hidden md:inline-flex" />

          {/* Show auth state only after hydration to avoid hydration mismatch flash */}
          {hydrated &&
            (user ? (
              <UserMenu />
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/login"
                  className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="group/cta relative inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110 active:translate-y-px"
                >
                  {t.nav.register}
                </Link>
              </div>
            ))}

          <MobileNav />
        </div>
      </div>
    </header>
  );
}

/** Pairs with Header — pushes content below the fixed header (h-16). */
export function HeaderSpacer() {
  return <div aria-hidden className="h-16" />;
}
