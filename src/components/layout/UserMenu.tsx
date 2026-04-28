"use client";

/**
 * Authenticated user menu — avatar trigger + dropdown.
 * Shown in Header when `useAuth()` has a session.
 *
 * Logout calls /api/auth/logout (BFF clears cookies + revokes upstream),
 * then clears the local store and hard-redirects to "/".
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  ShieldCheck,
  Ticket,
  User as UserIcon,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/store/auth";
import { t } from "@/messages/tr";

function initials(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "VR";
}

export function UserMenu() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const role = useAuth((s) => s.role);
  const clear = useAuth((s) => s.clear);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
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
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group/avatar inline-flex size-9 items-center justify-center rounded-full ring-1 ring-border/60 transition-all hover:ring-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={t.nav.profile}
      >
        <Avatar className="size-9">
          <AvatarFallback
            className="bg-muted font-mono text-[0.7rem] font-semibold tracking-tight text-foreground"
            data-numeric
          >
            {initials(user.email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-60">
        <DropdownMenuLabel className="px-2 py-1.5">
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{user.email}</span>
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
              {role === "ADMIN" ? t.admin.roleAdmin : t.admin.roleUser}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/account" />}>
          <UserIcon className="size-4" aria-hidden />
          {t.nav.profile}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/rentals" />}>
          <Ticket className="size-4" aria-hidden />
          {t.nav.rentals}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/payments" />}>
          <Receipt className="size-4" aria-hidden />
          {t.nav.payments}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/settings" />}>
          <Settings className="size-4" aria-hidden />
          {t.nav.settings}
        </DropdownMenuItem>
        {role === "ADMIN" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin" />}>
              <ShieldCheck className="size-4 text-accent" aria-hidden />
              <span className="font-medium">{t.nav.admin}</span>
              <LayoutDashboard
                className="ml-auto size-3.5 text-muted-foreground"
                aria-hidden
              />
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={busy}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" aria-hidden />
          {t.nav.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
