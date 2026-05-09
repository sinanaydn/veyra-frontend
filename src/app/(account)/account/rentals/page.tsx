/**
 * /account/rentals — paged list of the user's rentals (T-071).
 *
 * Uses URL state via nuqs so back-button restores prior page. Page-size
 * is fixed at 10 — premium dense list, not a generic table.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/account/PageHeader";
import { RentalsList } from "./RentalsList";
import { t } from "@/messages/tr";

export const metadata: Metadata = {
  title: t.account.rentalsTitle,
};

export default function RentalsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="KIRALAMALARIM"
        title={t.account.rentalsTitle}
        description={t.account.rentalsSubtitle}
      />
      <Suspense fallback={<RentalsListSkeletonInline />}>
        <RentalsList />
      </Suspense>
    </div>
  );
}

function RentalsListSkeletonInline() {
  return (
    <ul className="grid gap-3">
      {[0, 1, 2, 3].map((i) => (
        <li
          key={i}
          aria-hidden
          className="h-44 animate-pulse rounded-2xl border border-border bg-surface/60"
        />
      ))}
    </ul>
  );
}
