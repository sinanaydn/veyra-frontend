/**
 * /account — profile snapshot landing page (T-070).
 *
 * Server component: reads session for header copy. Stat tiles + recent
 * activity are client islands that consume TanStack Query.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Receipt, Settings, Ticket } from "lucide-react";

import { readSession } from "@/lib/rbac";
import { PageHeader } from "@/components/account/PageHeader";
import { AccountStats } from "./AccountStats";
import { RecentRentals } from "./RecentRentals";
import { t } from "@/messages/tr";

export const metadata: Metadata = {
  title: "Hesabım",
};

const QUICK_LINKS = [
  {
    href: "/account/rentals",
    label: t.nav.rentals,
    icon: Ticket,
    desc: t.account.rentalsSubtitle,
  },
  {
    href: "/account/payments",
    label: t.nav.payments,
    icon: Receipt,
    desc: t.account.paymentsSubtitle,
  },
  {
    href: "/account/settings",
    label: t.nav.settings,
    icon: Settings,
    desc: t.account.settingsSubtitle,
  },
] as const;

export default async function AccountIndexPage() {
  const session = await readSession();
  // Layout already guards — but TS needs the narrow:
  if (!session) return null;

  // Greeting fallback when no firstName is available (per GAP-1)
  const localName = session.email.split("@")[0];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="01 — HESAP"
        title={`${t.account.welcomeBack}, ${localName}`}
        description={t.account.accountSummary}
      />

      <AccountStats />

      <section className="space-y-5">
        <SectionTitle eyebrow="02 — SON HAREKETLER" title={t.account.rentalsTitle} />
        <RecentRentals />
      </section>

      <section className="space-y-5">
        <SectionTitle eyebrow="03 — HIZLI BAĞLANTILAR" title={t.account.quickLinks} />
        <ul className="grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map(({ href, label, icon: Icon, desc }) => (
            <li key={href}>
              <Link
                href={href}
                className="group/ql relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-9 items-center justify-center rounded-xl border border-border/60 bg-surface-2 text-accent">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <ArrowUpRight
                    className="size-4 text-muted-foreground transition-transform group-hover/ql:-translate-y-0.5 group-hover/ql:translate-x-0.5 group-hover/ql:text-foreground"
                    aria-hidden
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[0.95rem] font-semibold tracking-tight">
                    {label}
                  </p>
                  <p className="text-[0.78rem] leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3 border-b border-border/50 pb-3">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">{title}</h2>
      </div>
    </div>
  );
}
