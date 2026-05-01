/**
 * Car specifications grid — 4-col on desktop, 2-col on mobile.
 * Reference: SPECIFICATION.md FR-CD-2 — omit null fields.
 */

import {
  Calendar,
  Cog,
  Droplet,
  Fuel,
  GaugeCircle,
  Luggage,
  Palette,
  Users,
  type LucideIcon,
} from "lucide-react";
import { formatNumber } from "@/lib/format";
import { t } from "@/messages/tr";
import type { Car } from "@/lib/api/types";

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

interface SpecCell {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
}

export function CarSpecsGrid({ car }: { car: Car }) {
  const cells: SpecCell[] = [
    { icon: Calendar, label: "Yıl", value: String(car.year), mono: true },
    {
      icon: Cog,
      label: t.cars.transmission,
      value: TX_LABEL[car.transmission],
    },
    { icon: Fuel, label: t.cars.fuelType, value: FUEL_LABEL[car.fuelType] },
    { icon: Users, label: "Koltuk", value: `${car.seats}`, mono: true },
    { icon: GaugeCircle, label: "Kapı", value: `${car.doors}`, mono: true },
    {
      icon: Luggage,
      label: t.cars.baggage,
      value: `${car.baggages}`,
      mono: true,
    },
  ];

  if (car.mileage != null) {
    cells.push({
      icon: Droplet,
      label: "Kilometre",
      value: `${formatNumber(car.mileage)} km`,
      mono: true,
    });
  }
  if (car.color) {
    cells.push({ icon: Palette, label: "Renk", value: car.color });
  }

  return (
    <section>
      <h2 className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
        {t.cars.detailSpecs}
      </h2>
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border/60 sm:grid-cols-3 md:grid-cols-4">
        {cells.map(({ icon: Icon, label, value, mono }) => (
          <li
            key={label}
            className="flex items-start gap-3 bg-background p-5"
          >
            <Icon
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                {label}
              </p>
              <p
                className={`mt-1 truncate text-sm font-medium text-foreground ${mono ? "font-mono tabular-nums" : ""}`}
                {...(mono ? { "data-numeric": true } : {})}
              >
                {value}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
