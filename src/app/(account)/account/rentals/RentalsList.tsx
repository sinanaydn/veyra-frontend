"use client";

/**
 * Client list with URL-synced pagination via nuqs.
 *
 * Sort is locked to `createdAt,desc` — the customer always wants the
 * latest rental on top.
 */

import { Ticket } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

import { useMyRentals } from "@/lib/queries/useRentals";
import {
  RentalCard,
  RentalCardSkeleton,
} from "@/components/account/RentalCard";
import { EmptyState } from "@/components/account/EmptyState";
import { ErrorState } from "@/components/account/ErrorState";
import { Pagination } from "@/components/common/Pagination";
import { t } from "@/messages/tr";

const PAGE_SIZE = 10;

export function RentalsList() {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(0).withOptions({ history: "push" }),
  );

  const rentals = useMyRentals({
    page,
    size: PAGE_SIZE,
    sort: ["createdAt,desc"],
  });

  if (rentals.isLoading && !rentals.data) {
    return (
      <ul className="grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
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
    <div className="space-y-8">
      <ul
        aria-busy={rentals.isFetching || undefined}
        className="grid gap-3 transition-opacity data-[fetching=true]:opacity-70"
        data-fetching={rentals.isFetching ? "true" : undefined}
      >
        {rentals.data.content.map((r) => (
          <li key={r.id}>
            <RentalCard rental={r} />
          </li>
        ))}
      </ul>

      <Pagination
        page={page}
        totalPages={rentals.data.totalPages}
        onChange={(p) => setPage(p)}
      />
    </div>
  );
}
