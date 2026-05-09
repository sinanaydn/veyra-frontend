"use client";

/**
 * Stat tiles — derived from the user's rental + payment history.
 * Lightweight client island; pulls only the first page of each (size 50)
 * which is plenty for the statistics shown.
 */

import { useMyRentals } from "@/lib/queries/useRentals";
import { useMyPayments } from "@/lib/queries/usePayments";
import { StatTile } from "@/components/account/StatTile";
import { currencyTRY } from "@/lib/format";
import { t } from "@/messages/tr";

const SAMPLE_PAGE = { page: 0, size: 50 } as const;

export function AccountStats() {
  const rentals = useMyRentals(SAMPLE_PAGE);
  const payments = useMyPayments(SAMPLE_PAGE);

  const total = rentals.data?.totalElements ?? 0;
  const active =
    rentals.data?.content.filter(
      (r) => r.status === "ACTIVE" || r.status === "CONFIRMED",
    ).length ?? 0;

  const completedPayments =
    payments.data?.content.filter((p) => p.status === "COMPLETED") ?? [];
  const spent = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const paymentCount = payments.data?.totalElements ?? 0;

  const loading = rentals.isLoading || payments.isLoading;

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <li>
        <StatTile
          label={t.account.statTotalRentals}
          value={loading ? "—" : String(total)}
        />
      </li>
      <li>
        <StatTile
          label={t.account.statActiveRentals}
          value={loading ? "—" : String(active)}
          tone={active > 0 ? "accent" : "default"}
        />
      </li>
      <li>
        <StatTile
          label={t.account.statTotalPayments}
          value={loading ? "—" : String(paymentCount)}
        />
      </li>
      <li>
        <StatTile
          label={t.account.statSpent}
          value={loading ? "—" : currencyTRY(spent)}
          tone="success"
        />
      </li>
    </ul>
  );
}
