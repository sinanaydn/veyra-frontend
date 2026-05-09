"use client";

/**
 * Top 3 most recent rentals — sorted by createdAt desc.
 * Empty state plugs the user into the catalog.
 */

import Link from "next/link";
import { ArrowUpRight, Ticket } from "lucide-react";
import { useMyRentals } from "@/lib/queries/useRentals";
import {
  RentalCard,
  RentalCardSkeleton,
} from "@/components/account/RentalCard";
import { EmptyState } from "@/components/account/EmptyState";
import { ErrorState } from "@/components/account/ErrorState";
import { t } from "@/messages/tr";

export function RecentRentals() {
  const rentals = useMyRentals({
    page: 0,
    size: 3,
    sort: ["createdAt,desc"],
  });

  if (rentals.isLoading) {
    return (
      <ul className="grid gap-3">
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <RentalCardSkeleton />
          </li>
        ))}
      </ul>
    );
  }

  if (rentals.isError && !rentals.data) {
    return (
      <ErrorState error={rentals.error} onRetry={() => rentals.refetch()} />
    );
  }

  if (!rentals.data || rentals.data.content.length === 0) {
    return (
      <EmptyState
        icon={Ticket}
        title={t.account.rentalsEmpty}
        description={t.account.rentalsEmptySub}
        ctaHref="/cars"
        ctaLabel={t.account.rentalsEmptyCta}
      />
    );
  }

  return (
    <>
      <ul className="grid gap-3">
        {rentals.data.content.map((r) => (
          <li key={r.id}>
            <RentalCard rental={r} />
          </li>
        ))}
      </ul>
      <div className="flex justify-end">
        <Link
          href="/account/rentals"
          className="group/cta inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-foreground/80 transition-colors hover:text-accent"
        >
          {t.nav.rentals}
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </>
  );
}
