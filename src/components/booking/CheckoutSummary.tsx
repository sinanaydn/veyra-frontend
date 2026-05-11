"use client";

/**
 * Editorial booking-ticket summary that mirrors PaymentReceipt's idiom
 * (perforation hairlines, mono numerals, accent glow). Sits beside the
 * MockCardForm on /checkout. Single source of truth for what the user
 * is paying for.
 */

import { ArrowUpRight, ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useCar } from "@/lib/queries/useCars";
import {
  currencyTRY,
  formatDate,
  daysBetween,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { t } from "@/messages/tr";
import type { Rental } from "@/lib/api/types";

interface Props {
  rental: Rental;
  /** Idempotency UUID — surfaced as faint footer for transparency. */
  idempotencyKey?: string;
}

export function CheckoutSummary({ rental, idempotencyKey }: Props) {
  const carQuery = useCar(rental.carId);
  const car = carQuery.data;

  const days = daysBetween(rental.startDate, rental.endDate);
  // Backend total is gross. Display split with KDV %20 dahil — matches
  // PaymentReceipt convention.
  const subtotal = Math.round(rental.totalPrice / 1.2);
  const vat = rental.totalPrice - subtotal;
  const dailyRate = Math.round(rental.totalPrice / days);
  const ref = String(rental.id).padStart(5, "0");

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8">
      {/* Soft accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-30%] top-[-30%] -z-10 h-72 w-72 rounded-full bg-accent/8 blur-3xl"
      />

      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <span className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="text-accent">{t.booking.summaryRef}</span>
          <span aria-hidden className="text-border">·</span>
          <span className="text-foreground/85">VR-#{ref}</span>
        </span>
        {car && (
          <Link
            href={`/cars/${car.id}`}
            className="group inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            ARAÇ
            <ArrowUpRight
              className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        )}
      </header>

      {/* Car block */}
      <CarBlock
        carName={
          car
            ? `${car.brandName} · ${car.modelName}`
            : carQuery.isLoading
              ? "—"
              : "Araç"
        }
        year={car?.year}
        imageUrl={car?.primaryImageUrl ?? car?.images?.[0]?.url}
      />

      {/* Date range */}
      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-dashed border-border/60 pt-5">
        <Stack
          eyebrow={t.booking.startDate}
          value={formatDate(rental.startDate)}
        />
        <Stack
          eyebrow={t.booking.endDate}
          value={formatDate(rental.endDate)}
          align="right"
        />
      </div>

      <Perforation />

      {/* Itemized */}
      <dl className="space-y-2.5">
        <Row
          label={`${t.booking.summaryDailyRate} × ${t.booking.summaryDays.replace("{n}", String(days))}`}
          value={`${currencyTRY(dailyRate)} × ${days}`}
          muted
        />
        <Row label={t.booking.summarySubtotal} value={currencyTRY(subtotal)} />
        <Row label={t.booking.summaryVat} value={currencyTRY(vat)} muted />
      </dl>

      <Perforation />

      {/* Total */}
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          {t.booking.summaryTotal}
        </span>
        <span
          className="font-mono text-3xl font-semibold tabular-nums text-accent"
          data-numeric
        >
          {currencyTRY(rental.totalPrice)}
        </span>
      </div>

      {idempotencyKey && (
        <footer className="mt-6 border-t border-dashed border-border/60 pt-4">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground/80">
            IDEM ·{" "}
            <span className="text-foreground/60 normal-case tracking-[0.05em]">
              {idempotencyKey.slice(0, 8)}…{idempotencyKey.slice(-4)}
            </span>
          </p>
          <p className="mt-1 text-[0.7rem] text-muted-foreground/80">
            {t.booking.summaryIdemHint}
          </p>
        </footer>
      )}
    </article>
  );
}

// ============================================================
// Subcomponents
// ============================================================

function CarBlock({
  carName,
  year,
  imageUrl,
}: {
  carName: string;
  year?: number;
  imageUrl?: string;
}) {
  return (
    <div className="mt-5 flex items-center gap-4">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={carName}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-5" aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold tracking-[-0.01em]">
          {carName}
        </p>
        {year ? (
          <p
            className="mt-0.5 font-mono text-[0.78rem] tabular-nums text-muted-foreground"
            data-numeric
          >
            MODEL · {year}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Stack({
  eyebrow,
  value,
  align,
}: {
  eyebrow: string;
  value: string;
  align?: "right";
}) {
  return (
    <div className={cn(align === "right" && "text-right")}>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
        {eyebrow}
      </p>
      <p className="mt-1.5 font-mono text-[0.95rem] tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

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
