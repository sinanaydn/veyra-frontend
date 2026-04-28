"use client";

/**
 * Customer account shell — left sidebar nav + main content.
 * Reference: TASKS.md T-044, SPECIFICATION.md §7
 *
 * Mobile: sidebar collapses to a horizontal scroll-snap nav strip.
 * Active item: accent left rail + surface-2 background.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Receipt,
  Settings,
  Ticket,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { href: "/account", label: t.nav.profile, icon: UserIcon, exact: true },
  { href: "/account/rentals", label: t.nav.rentals, icon: Ticket },
  { href: "/account/payments", label: t.nav.payments, icon: Receipt },
  { href: "/account/settings", label: t.nav.settings, icon: Settings },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuth((s) => s.user);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {/* Greeting block */}
          <div className="mb-6 hidden border-b border-border/60 pb-6 lg:block">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {t.nav.account}
            </p>
            {user && (
              <p
                className="mt-2 truncate text-sm font-medium text-foreground"
                title={user.email}
              >
                {user.email}
              </p>
            )}
          </div>

          {/* Mobile: horizontal scroll strip; Desktop: vertical stack */}
          <nav
            className={cn(
              "scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4",
              "lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0",
            )}
            aria-label="Account"
          >
            {NAV_ITEMS.map((item) => {
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
                    "group/aitem relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    "lg:w-full lg:shrink lg:whitespace-normal lg:py-2.5",
                    active
                      ? "bg-surface-2 text-foreground"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground",
                  )}
                >
                  {/* Vertical accent rail (desktop only) */}
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute left-0 top-1/2 hidden h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-opacity lg:block",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <Icon
                    className={cn(
                      "size-4 transition-colors",
                      active ? "text-accent" : "text-muted-foreground/80",
                    )}
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main id="main" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
