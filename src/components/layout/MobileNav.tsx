"use client";

/**
 * Mobile-only nav drawer. Triggered by hamburger button in Header.
 * Uses shadcn Sheet (Base UI under the hood).
 *
 * Reference: TASKS.md T-042
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/store/auth";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/cars", label: "Araçlar" },
  { href: "/brands", label: "Markalar" },
];

export function MobileNav() {
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const role = useAuth((s) => s.role);
  const clear = useAuth((s) => s.clear);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    } finally {
      clear();
      setOpen(false);
      window.location.href = "/";
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t.nav.openMenu}
        className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 bg-background/50 text-muted-foreground backdrop-blur transition-colors hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
      >
        <Menu className="size-4" aria-hidden />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full max-w-sm border-l border-border bg-background p-0 sm:max-w-sm"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-5">
          <Logo />
          <SheetClose
            aria-label={t.nav.closeMenu}
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </SheetClose>
        </SheetHeader>

        <SheetTitle className="sr-only">{t.nav.openMenu}</SheetTitle>
        <SheetDescription className="sr-only">
          {t.common.appName}
        </SheetDescription>

        <div className="flex h-[calc(100%-72px)] flex-col">
          {/* Primary nav — staggered entry */}
          <nav className="flex-1 px-6 py-6">
            <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              Keşfet
            </p>
            <ul className="flex flex-col">
              {NAV_LINKS.map((link, i) => {
                const active = pathname.startsWith(link.href);
                return (
                  <li
                    key={link.href}
                    className="-translate-x-2 animate-[mobileNavReveal_280ms_ease-out_forwards] opacity-0"
                    style={{ animationDelay: `${80 + i * 60}ms` }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group/mlink flex items-center justify-between border-b border-border/50 py-4 text-2xl font-semibold tracking-tight transition-colors",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span>{link.label}</span>
                      <span
                        className={cn(
                          "ml-3 inline-block size-1.5 rounded-full transition-all",
                          active
                            ? "bg-accent shadow-[0_0_12px_var(--color-accent)]"
                            : "bg-transparent group-hover/mlink:bg-muted-foreground/30",
                        )}
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {user && (
              <>
                <p className="mb-4 mt-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {t.nav.account}
                </p>
                <ul className="flex flex-col">
                  {[
                    { href: "/account", label: t.nav.profile },
                    { href: "/account/rentals", label: t.nav.rentals },
                    { href: "/account/payments", label: t.nav.payments },
                    { href: "/account/settings", label: t.nav.settings },
                    ...(role === "ADMIN"
                      ? [{ href: "/admin", label: t.nav.admin }]
                      : []),
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between border-b border-border/50 py-3 text-base text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </nav>

          {/* Footer of drawer — auth CTAs + theme toggle */}
          <div className="border-t border-border bg-surface/40 px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                Tema
              </span>
              <ThemeToggle />
            </div>
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
              >
                {t.nav.logout}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-border px-4 py-3 text-center text-sm font-medium transition-colors hover:bg-muted"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground transition-all hover:brightness-110"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
