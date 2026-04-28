"use client";

/**
 * Admin console shell — collapsible sidebar + top bar.
 * Reference: TASKS.md T-045, SPECIFICATION.md §7
 *
 * Layout:
 *  - Top bar: brand mark, role badge, user email, logout
 *  - Sidebar: 9 sections grouped (Overview / Catalog / Operations)
 *  - Active: 3px left accent rail + accent text + surface-2 bg
 *  - Desktop only — mobile shows a top scroll-snap strip (per spec
 *    §2.3: "Admin console: Desktop-first (tables)")
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Car,
  CarFront,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/store/auth";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavGroup {
  heading: string;
  items: ReadonlyArray<NavItem>;
}

const NAV_GROUPS: ReadonlyArray<NavGroup> = [
  {
    heading: "Genel",
    items: [
      {
        href: "/admin",
        label: t.nav.dashboard,
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    heading: "Katalog",
    items: [
      { href: "/admin/brands", label: t.admin.sectionBrands, icon: Building2 },
      { href: "/admin/models", label: t.admin.sectionModels, icon: Car },
      { href: "/admin/cars", label: t.admin.sectionCars, icon: CarFront },
      {
        href: "/admin/images",
        label: t.admin.sectionImages,
        icon: ImageIcon,
      },
    ],
  },
  {
    heading: "Operasyon",
    items: [
      { href: "/admin/rentals", label: t.admin.sectionRentals, icon: Ticket },
      {
        href: "/admin/payments",
        label: t.admin.sectionPayments,
        icon: CreditCard,
      },
      { href: "/admin/users", label: t.admin.sectionUsers, icon: Users },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const clear = useAuth((s) => s.clear);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    } finally {
      clear();
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-svh bg-background">
      {/* Sidebar (desktop) */}
      <aside
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-border bg-surface/40 transition-[width] duration-200 lg:flex",
          collapsed ? "w-16" : "w-60",
        )}
        aria-label="Admin navigation"
      >
        {/* Brand row */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-border px-4",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <Logo iconOnly={collapsed} href="/admin" />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading} className="mb-6 last:mb-0">
              {!collapsed && (
                <p className="mb-2 px-2 font-mono text-[0.6rem] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
                  {group.heading}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group/aitem relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                          collapsed && "justify-center px-0",
                          active
                            ? "bg-surface-2 text-foreground"
                            : "text-muted-foreground hover:bg-surface hover:text-foreground",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "pointer-events-none absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent transition-opacity",
                            active ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            active
                              ? "text-accent"
                              : "text-muted-foreground/80",
                          )}
                          aria-hidden
                        />
                        {!collapsed && (
                          <span className="truncate font-medium">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? t.nav.openMenu : t.nav.closeMenu}
          className="m-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/50 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          {collapsed ? (
            <ChevronsRight className="size-4" aria-hidden />
          ) : (
            <>
              <ChevronsLeft className="size-4" aria-hidden />
              <span>Daralt</span>
            </>
          )}
        </button>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6 lg:px-8">
          {/* Mobile brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <Logo iconOnly />
          </div>

          {/* Role pill */}
          <div className="hidden items-center gap-2 lg:flex">
            <ShieldCheck className="size-4 text-accent" aria-hidden />
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
              Yönetim
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {user && (
              <span
                className="hidden truncate text-xs text-muted-foreground md:inline-block md:max-w-[180px]"
                title={user.email}
              >
                {user.email}
              </span>
            )}
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              aria-label={t.nav.logout}
              title={t.nav.logout}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 bg-background/50 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          </div>
        </header>

        {/* Mobile horizontal nav */}
        <nav
          className="scrollbar-none flex gap-1 overflow-x-auto border-b border-border bg-surface/40 px-4 py-2 lg:hidden"
          aria-label="Admin sections"
        >
          {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-surface-2 text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main id="main" className="flex-1 px-4 py-8 md:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
