/**
 * Car catalog card — used in FeaturedCars row, /cars grid, and similar-cars rail.
 * Reference: BRANDING.md §10
 *
 * Server-component-friendly (no hooks, no event handlers — wrap with Link).
 *
 * Visual:
 *  - 4:3 image at top, object-cover, subtle bottom-fade vignette in dark
 *  - Hover: -translate-y-0.5, accent border at 40%, image subtle zoom
 *  - Top-right: frosted CarStatusBadge
 *  - Bottom-left: brand·model bold, specs row mono small, price mono semibold
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Fuel, Gauge, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { currencyTRY } from "@/lib/format";
import { t } from "@/messages/tr";
import type { Car } from "@/lib/api/types";
import { CarStatusBadge } from "./CarStatusBadge";

const FUEL_LABEL: Record<Car["fuelType"], string> = {
  GASOLINE: t.cars.fuelGasoline,
  DIESEL: t.cars.fuelDiesel,
  ELECTRIC: t.cars.fuelElectric,
  HYBRID: t.cars.fuelHybrid,
};

const TX_LABEL: Record<Car["transmission"], string> = {
  MANUAL: t.cars.transmissionManual,
  AUTOMATIC: t.cars.transmissionAutomatic,
};

interface CarCardProps {
  car: Car;
  /** Compact variant — used in similar-cars row, hides description-style spacing */
  compact?: boolean;
  className?: string;
}

export function CarCard({ car, compact, className }: CarCardProps) {
  const image = car.primaryImageUrl ?? car.images?.[0]?.url;

  return (
    <Link
      href={`/cars/${car.id}`}
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_12px_40px_-20px_var(--color-accent)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
        {image ? (
          <Image
            src={image}
            alt={`${car.brandName} ${car.modelName}`}
            fill
            sizes="(min-width: 1280px) 320px, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            görsel yok
          </div>
        )}

        {/* Bottom fade (BRANDING.md §9.1) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent opacity-70"
        />

        {/* Status badge top-right */}
        <CarStatusBadge
          status={car.status}
          className="absolute right-3 top-3"
        />

        {/* Year tag bottom-left */}
        <span
          className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-background/70 px-2.5 py-1 font-mono text-[0.7rem] font-medium tracking-tight text-foreground ring-1 ring-inset ring-border/50 backdrop-blur"
          data-numeric
        >
          {car.year}
        </span>
      </div>

      {/* Body */}
      <div className={cn("flex flex-1 flex-col px-5", compact ? "py-4" : "py-5")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {car.brandName}
            </p>
            <h3 className="mt-1 truncate text-base font-semibold tracking-tight">
              {car.modelName}
            </h3>
          </div>
          <ArrowUpRight
            className="mt-1 size-4 shrink-0 text-muted-foreground/60 transition-all duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 group-hover/card:text-accent"
            aria-hidden
          />
        </div>

        {/* Specs row */}
        <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-muted-foreground">
          <li className="inline-flex items-center gap-1">
            <Users className="size-3" aria-hidden />
            <span>
              {car.seats}
              <span className="ml-0.5">{t.cars.seats}</span>
            </span>
          </li>
          <li
            aria-hidden
            className="size-0.5 rounded-full bg-muted-foreground/40"
          />
          <li className="inline-flex items-center gap-1">
            <Fuel className="size-3" aria-hidden />
            <span>{FUEL_LABEL[car.fuelType]}</span>
          </li>
          <li
            aria-hidden
            className="size-0.5 rounded-full bg-muted-foreground/40"
          />
          <li className="inline-flex items-center gap-1">
            <Gauge className="size-3" aria-hidden />
            <span>{TX_LABEL[car.transmission]}</span>
          </li>
        </ul>

        {/* Divider + price */}
        <div className="mt-5 flex items-end justify-between border-t border-border/50 pt-4">
          <div>
            <p
              className="font-mono text-xl font-semibold tracking-tight text-foreground"
              data-numeric
            >
              {currencyTRY(car.dailyPrice)}
            </p>
            <p className="text-[0.7rem] text-muted-foreground">
              {t.common.perDay}
            </p>
          </div>
          <span className="text-[0.7rem] text-muted-foreground transition-colors group-hover/card:text-accent">
            Detay →
          </span>
        </div>
      </div>
    </Link>
  );
}
