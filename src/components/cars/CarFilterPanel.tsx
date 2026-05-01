"use client";

/**
 * Catalog filter panel — works as both desktop sidebar and mobile sheet body.
 * Reference: SPECIFICATION.md FR-CAT-1, FR-CAT-5
 *
 * Section conventions:
 *  - Mono uppercase eyebrow label per BRANDING.md §4.3
 *  - Hairline divider between sections
 *  - Native <select> for brand/model (cascading via brandId), simple
 *    inputs for ranges, custom chip groups for enums, Switch for booleans
 */

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { useBrands } from "@/lib/queries/useBrands";
import { useModels } from "@/lib/queries/useModels";
import {
  FUEL_TYPES,
  TRANSMISSIONS,
  type CarFilter,
  type FuelType,
  type Transmission,
} from "@/lib/api/types";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

const FUEL_LABEL: Record<FuelType, string> = {
  GASOLINE: t.cars.fuelGasoline,
  DIESEL: t.cars.fuelDiesel,
  ELECTRIC: t.cars.fuelElectric,
  HYBRID: t.cars.fuelHybrid,
};

const TX_LABEL: Record<Transmission, string> = {
  MANUAL: t.cars.transmissionManual,
  AUTOMATIC: t.cars.transmissionAutomatic,
};

export interface CarFilterPanelProps {
  value: CarFilter;
  onChange: (next: Partial<CarFilter>) => void;
  /** Compact = inside mobile sheet (no sticky, denser). */
  compact?: boolean;
}

function Section({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-border/60 pb-6 last:border-b-0", className)}>
      <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  labels,
  ariaLabel,
}: {
  options: readonly T[];
  value: T | undefined;
  onChange: (v: T | undefined) => void;
  labels: Record<T, string>;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? undefined : opt)}
            className={cn(
              "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
              active
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border/60 bg-surface text-muted-foreground hover:border-border hover:bg-surface-2 hover:text-foreground",
            )}
          >
            {labels[opt]}
          </button>
        );
      })}
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  children,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <div className="group/sel relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-foreground transition-colors hover:border-border hover:bg-surface-2 focus-visible:border-accent focus-visible:outline-none"
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
        aria-hidden
      />
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  min,
  max,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder: string;
  ariaLabel: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={ariaLabel}
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "") return onChange(undefined);
        const n = Number(v);
        if (Number.isFinite(n)) onChange(n);
      }}
      placeholder={placeholder}
      min={min}
      max={max}
      className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm font-mono tabular-nums text-foreground transition-colors hover:border-border hover:bg-surface-2 focus-visible:border-accent focus-visible:outline-none placeholder:text-muted-foreground/60"
      data-numeric
    />
  );
}

export function CarFilterPanel({ value, onChange, compact }: CarFilterPanelProps) {
  const { data: brands } = useBrands();
  const { data: models } = useModels(
    value.brandId ? { brandId: value.brandId } : {},
  );

  // Reset modelId if it doesn't belong to selected brand
  const validModelIds = useMemo(
    () => new Set(models?.map((m) => m.id) ?? []),
    [models],
  );
  useEffect(() => {
    if (
      value.modelId !== undefined &&
      models !== undefined &&
      !validModelIds.has(value.modelId)
    ) {
      onChange({ modelId: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.brandId, models]);

  return (
    <div className={cn("flex flex-col gap-6", compact ? "pb-4" : "pb-6")}>
      {/* Brand */}
      <Section label={t.cars.brand}>
        <NativeSelect
          ariaLabel={t.cars.brand}
          value={value.brandId ? String(value.brandId) : ""}
          onChange={(v) => {
            onChange({
              brandId: v ? Number(v) : undefined,
              modelId: undefined, // cascade reset
            });
          }}
        >
          <option value="">Tüm markalar</option>
          {(brands ?? []).map((b) => (
            <option key={b.id} value={String(b.id)}>
              {b.name}
            </option>
          ))}
        </NativeSelect>
      </Section>

      {/* Model */}
      <Section label={t.cars.model}>
        <NativeSelect
          ariaLabel={t.cars.model}
          value={value.modelId ? String(value.modelId) : ""}
          onChange={(v) =>
            onChange({ modelId: v ? Number(v) : undefined })
          }
        >
          <option value="">Tüm modeller</option>
          {(models ?? []).map((m) => (
            <option key={m.id} value={String(m.id)}>
              {m.name}
            </option>
          ))}
        </NativeSelect>
        {!value.brandId && (
          <p className="mt-2 text-[0.7rem] text-muted-foreground">
            Önce marka seç.
          </p>
        )}
      </Section>

      {/* Price range */}
      <Section label={t.cars.priceRange}>
        <div className="flex items-center gap-2">
          <NumberInput
            ariaLabel="Min fiyat"
            placeholder="Min ₺"
            value={value.minPrice}
            onChange={(v) => onChange({ minPrice: v })}
            min={0}
          />
          <span aria-hidden className="text-muted-foreground/50">
            —
          </span>
          <NumberInput
            ariaLabel="Max fiyat"
            placeholder="Max ₺"
            value={value.maxPrice}
            onChange={(v) => onChange({ maxPrice: v })}
            min={0}
          />
        </div>
      </Section>

      {/* Year range */}
      <Section label={t.cars.yearRange}>
        <div className="flex items-center gap-2">
          <NumberInput
            ariaLabel="Min yıl"
            placeholder="2000"
            value={value.minYear}
            onChange={(v) => onChange({ minYear: v })}
            min={2000}
            max={new Date().getFullYear() + 1}
          />
          <span aria-hidden className="text-muted-foreground/50">
            —
          </span>
          <NumberInput
            ariaLabel="Max yıl"
            placeholder={String(new Date().getFullYear())}
            value={value.maxYear}
            onChange={(v) => onChange({ maxYear: v })}
            min={2000}
            max={new Date().getFullYear() + 1}
          />
        </div>
      </Section>

      {/* Fuel */}
      <Section label={t.cars.fuelType}>
        <ChipGroup
          ariaLabel={t.cars.fuelType}
          options={FUEL_TYPES}
          labels={FUEL_LABEL}
          value={value.fuelType}
          onChange={(v) => onChange({ fuelType: v })}
        />
      </Section>

      {/* Transmission */}
      <Section label={t.cars.transmission}>
        <ChipGroup
          ariaLabel={t.cars.transmission}
          options={TRANSMISSIONS}
          labels={TX_LABEL}
          value={value.transmission}
          onChange={(v) => onChange({ transmission: v })}
        />
      </Section>

      {/* Available */}
      <Section label="Müsaitlik" className="border-b-0">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="text-sm text-foreground">
            {t.cars.availableOnly}
          </span>
          <Switch
            checked={value.available ?? false}
            onCheckedChange={(checked) =>
              onChange({ available: checked || undefined })
            }
            aria-label={t.cars.availableOnly}
          />
        </label>
      </Section>
    </div>
  );
}
