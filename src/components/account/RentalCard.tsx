"use client";

/**
 * Boarding-pass styled rental card.
 *
 * Composition:
 *   ┌────────────────────────────────────────────┐
 *   │  VR · #0042                  [BEKLEMEDE]   │  top stripe (surface-2)
 *   ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤  dashed perforation
 *   │  Toyota · Corolla 2024                     │
 *   │  ALIS  ──   TESLİM   ──  SÜRE  ──  TOPLAM  │
 *   │  03 May  ─  06 May   ─  3 gün  ─  3.600 ₺  │
 *   ├────────────────────────────────────────────┤
 *   │  Detayı gör →                              │  footer
 *   └────────────────────────────────────────────┘
 *
 * Rental.car is hydrated via shared TanStack cache (`useCar(carId)`),
 * so multiple rows for the same car share a single in-flight request.
 */

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCar } from "@/lib/queries/useCars";
import {
  currencyTRY,
  formatDate,
  daysBetween,
} from "@/lib/format";
import { RentalRef } from "./RentalRef";
import { RentalStatusBadge } from "./RentalStatusBadge";
import { cn } from "@/lib/utils";
import { t } from "@/messages/tr";
import type { Rental } from "@/lib/api/types";

interface Props {
  rental: Rental;
}

export function RentalCard({ rental }: Props) {
  const carQuery = useCar(rental.carId);
  const days = daysBetween(new Date(rental.startDate), new Date(rental.endDate));

  return (
    <article
      className={cn(
        "group/rc relative overflow-hidden rounded-2xl border border-border bg-surface",
        "transition-colors hover:border-accent/40",
      )}
    >
      {/* Top stripe — mono ref + status */}
      <header
        className={cn(
          "flex items-center justify-between gap-2 px-5 py-3.5",
          "border-b border-dashed border-border/70",
          "bg-gradient-to-b from-surface-2/60 to-transparent",
        )}
      >
        <RentalRef id={rental.id} size="sm" />
        <RentalStatusBadge status={rental.status} />
      </header>

      {/* Body */}
      <div className="px-5 py-5">
        {/* Car identity */}
        <div className="mb-5">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t.account.rentalCar}
          </p>
          {carQuery.isLoading ? (
            <div className="mt-1.5 h-5 w-48 animate-pulse rounded bg-surface-2" />
          ) : (
            <h3 className="mt-1 truncate text-[1.05rem] font-semibold tracking-[-0.01em]">
              {carQuery.data
                ? `${carQuery.data.brandName} · ${carQuery.data.modelName} ${carQuery.data.year}`
                : t.account.rentalCar}
            </h3>
          )}
        </div>

        {/* Stats row */}
        <dl
          className={cn(
            "grid gap-x-4 gap-y-3",
            "grid-cols-2 sm:grid-cols-4",
          )}
        >
          <KV label="Alış" value={formatDate(rental.startDate)} />
          <KV label="Teslim" value={formatDate(rental.endDate)} />
          <KV label="Süre" value={t.account.rentalDays.replace("{n}", String(days))} />
          <KV
            label={t.account.rentalTotal}
            value={currencyTRY(rental.totalPrice)}
            emphasis
          />
        </dl>
      </div>

      {/* Footer — view detail link */}
      <footer className="flex items-center justify-between border-t border-border/40 px-5 py-3">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          {formatDate(rental.createdAt)}
        </span>
        <Link
          href={`/account/rentals/${rental.id}`}
          className="group/cta inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-foreground transition-colors hover:text-accent"
        >
          {t.account.rentalViewDetail}
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
            aria-hidden
          />
        </Link>
      </footer>
    </article>
  );
}

// ============================================================
// Local KV — label/value stacked pair, mono numerals
// ============================================================

function KV({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "truncate font-mono tabular-nums",
          emphasis
            ? "text-base font-semibold text-foreground"
            : "text-[0.88rem] text-foreground/90",
        )}
        data-numeric
      >
        {value}
      </dd>
    </div>
  );
}

// ============================================================
// Skeleton — same shape, animated shimmer
// ============================================================

export function RentalCardSkeleton() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div className="flex items-center justify-between border-b border-dashed border-border/70 px-5 py-3.5">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-surface-2" />
      </div>
      <div className="space-y-5 px-5 py-5">
        <div className="space-y-1.5">
          <div className="h-2.5 w-12 animate-pulse rounded bg-surface-2" />
          <div className="h-5 w-56 animate-pulse rounded bg-surface-2" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-2.5 w-10 animate-pulse rounded bg-surface-2" />
              <div className="h-4 w-20 animate-pulse rounded bg-surface-2" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/40 px-5 py-3">
        <div className="h-3 w-20 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}
