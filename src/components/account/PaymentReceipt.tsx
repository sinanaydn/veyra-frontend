"use client";

/**
 * Statement-style payment receipt. Sits on /account/payments/[id] and
 * /account/rentals/[id] (compact mode).
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │  TX · #00123              [TAMAMLANDI]        │
 *   │  3.600 ₺                                      │
 *   │  Düzenlenme · 03 May 2026 14:21               │
 *   ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
 *   │  Hizmet                Tutar                  │
 *   │  Araç kiralama         3.000 ₺                │
 *   │  KDV (dahil)             600 ₺                │
 *   ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
 *   │  TOPLAM                3.600 ₺                │
 *   └──────────────────────────────────────────────┘
 */

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRental } from "@/lib/queries/useRentals";
import { useCar } from "@/lib/queries/useCars";
import {
  currencyTRY,
  formatDateTime,
  formatDate,
  daysBetween,
} from "@/lib/format";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { cn } from "@/lib/utils";
import { t } from "@/messages/tr";
import type { Payment } from "@/lib/api/types";

interface Props {
  payment: Payment;
  /** Compact mode hides the rental cross-link & uses tighter padding. */
  compact?: boolean;
}

export function PaymentReceipt({ payment, compact }: Props) {
  // VAT split — backend amount is gross. Display split (KDV %20 dahil).
  const vatRate = 0.2;
  const subtotal = Math.round(payment.amount / (1 + vatRate));
  const vat = payment.amount - subtotal;

  const padded = String(payment.id).padStart(5, "0");

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface",
        compact ? "p-5" : "p-6 sm:p-8",
      )}
    >
      {/* Soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-30%] top-[-30%] -z-10 h-64 w-64 rounded-full bg-accent/8 blur-3xl"
      />

      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <span
            className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground"
            data-numeric
          >
            <span className="text-accent">TX</span>
            <span aria-hidden className="text-border">·</span>
            <span className="text-foreground/80">#{padded}</span>
          </span>
          <PaymentStatusBadge status={payment.status} />
        </div>

        <div>
          <p
            className="font-mono text-[2.4rem] font-semibold leading-none tracking-[-0.02em] tabular-nums sm:text-[2.8rem]"
            data-numeric
          >
            {currencyTRY(payment.amount)}
          </p>
          <p className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t.account.receiptIssued} · {formatDateTime(payment.createdAt)}
          </p>
        </div>
      </header>

      {/* Perforation */}
      <Perforation />

      {/* Itemized rows */}
      <RentalRow rentalId={payment.rentalId} />

      <dl className="mt-2 space-y-2.5">
        <Row label={t.account.receiptItem + " · " + t.account.receiptItemRental} value={currencyTRY(subtotal)} />
        <Row label={t.account.receiptVat} value={currencyTRY(vat)} muted />
      </dl>

      {/* Perforation */}
      <Perforation />

      {/* Total */}
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          {t.account.receiptTotal}
        </span>
        <span
          className="font-mono text-2xl font-semibold tabular-nums"
          data-numeric
        >
          {currencyTRY(payment.amount)}
        </span>
      </div>

      {!compact && (
        <footer className="mt-7 flex items-center justify-between gap-4 border-t border-dashed border-border/60 pt-5">
          <p className="text-[0.78rem] text-muted-foreground">
            {t.account.receiptThanks}
          </p>
          <Link
            href={`/account/rentals/${payment.rentalId}`}
            className="group/cta inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-foreground transition-colors hover:text-accent"
          >
            {t.account.receiptViewRental}
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
              aria-hidden
            />
          </Link>
        </footer>
      )}
    </article>
  );
}

// ============================================================
// Perforation — dashed hairline, page-bg color "notch" circles
// ============================================================

function Perforation() {
  return (
    <div className="relative my-5 sm:my-6">
      <div className="border-t border-dashed border-border/60" />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-3 top-1/2 size-3 -translate-y-1/2 rounded-full bg-background"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-3 top-1/2 size-3 -translate-y-1/2 rounded-full bg-background"
      />
    </div>
  );
}

// ============================================================
// RentalRow — pulls car name + dates from cache when available
// ============================================================

function RentalRow({ rentalId }: { rentalId: number }) {
  const rentalQuery = useRental(rentalId);
  const carQuery = useCar(rentalQuery.data?.carId ?? 0);

  if (rentalQuery.isLoading) {
    return (
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="h-3.5 w-32 animate-pulse rounded bg-surface-2" />
        <div className="h-3.5 w-20 justify-self-end animate-pulse rounded bg-surface-2" />
      </div>
    );
  }
  if (!rentalQuery.data) return null;

  const r = rentalQuery.data;
  const days = daysBetween(new Date(r.startDate), new Date(r.endDate));
  const carName =
    carQuery.data && `${carQuery.data.brandName} · ${carQuery.data.modelName}`;

  return (
    <div className="mb-3 grid gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[0.95rem] font-medium">
          {carName ?? t.account.rentalCar}
        </span>
        <span
          className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground"
          data-numeric
        >
          {t.account.rentalDays.replace("{n}", String(days))}
        </span>
      </div>
      <span
        className="font-mono text-[0.78rem] tabular-nums text-muted-foreground"
        data-numeric
      >
        {formatDate(r.startDate)} — {formatDate(r.endDate)}
      </span>
    </div>
  );
}

// ============================================================
// Row — label + value, mono numerals
// ============================================================

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt
        className={cn(
          "text-[0.85rem]",
          muted ? "text-muted-foreground" : "text-foreground/90",
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "font-mono text-[0.95rem] tabular-nums",
          muted ? "text-muted-foreground" : "text-foreground",
        )}
        data-numeric
      >
        {value}
      </dd>
    </div>
  );
}
