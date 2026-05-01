"use client";

/**
 * Active-filter chip bar shown above the catalog.
 * Reference: SPECIFICATION.md FR-CAT-3
 *
 * Each non-default filter renders as a removable chip. A "Tümünü sıfırla"
 * button appears on the right when ≥1 filter active. Mobile-only "Filtrele"
 * trigger is rendered as a separate button passed in as `mobileTrigger`.
 */

import { X } from "lucide-react";
import { useMemo } from "react";
import { useBrands } from "@/lib/queries/useBrands";
import { useModels } from "@/lib/queries/useModels";
import { currencyTRY } from "@/lib/format";
import {
  type CarFilter,
  type FuelType,
  type Transmission,
} from "@/lib/api/types";
import { t } from "@/messages/tr";

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

interface Chip {
  key: keyof CarFilter;
  label: string;
}

export interface CarFilterChipBarProps {
  value: CarFilter;
  onClear: (key: keyof CarFilter) => void;
  onClearAll: () => void;
  mobileTrigger?: React.ReactNode;
}

export function CarFilterChipBar({
  value,
  onClear,
  onClearAll,
  mobileTrigger,
}: CarFilterChipBarProps) {
  const { data: brands } = useBrands();
  const { data: models } = useModels(
    value.brandId ? { brandId: value.brandId } : {},
  );

  const chips = useMemo<Chip[]>(() => {
    const list: Chip[] = [];
    if (value.brandId) {
      const brand = brands?.find((b) => b.id === value.brandId);
      list.push({ key: "brandId", label: brand?.name ?? `Marka #${value.brandId}` });
    }
    if (value.modelId) {
      const model = models?.find((m) => m.id === value.modelId);
      list.push({
        key: "modelId",
        label: model?.name ?? `Model #${value.modelId}`,
      });
    }
    if (value.minPrice != null) {
      list.push({ key: "minPrice", label: `${currencyTRY(value.minPrice)} +` });
    }
    if (value.maxPrice != null) {
      list.push({ key: "maxPrice", label: `≤ ${currencyTRY(value.maxPrice)}` });
    }
    if (value.minYear != null) {
      list.push({ key: "minYear", label: `${value.minYear}+` });
    }
    if (value.maxYear != null) {
      list.push({ key: "maxYear", label: `≤ ${value.maxYear}` });
    }
    if (value.fuelType) {
      list.push({ key: "fuelType", label: FUEL_LABEL[value.fuelType] });
    }
    if (value.transmission) {
      list.push({
        key: "transmission",
        label: TX_LABEL[value.transmission],
      });
    }
    if (value.available) {
      list.push({ key: "available", label: t.cars.availableOnly });
    }
    return list;
  }, [value, brands, models]);

  const hasAny = chips.length > 0;

  if (!hasAny && !mobileTrigger) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Mobile-only trigger (rendered first so it stays leftmost) */}
      {mobileTrigger && <span className="lg:hidden">{mobileTrigger}</span>}

      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => onClear(c.key)}
          className="group/chip inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent transition-colors hover:border-accent/50 hover:bg-accent/15"
        >
          <span>{c.label}</span>
          <X
            className="size-3 text-accent/70 transition-colors group-hover/chip:text-accent"
            aria-hidden
          />
          <span className="sr-only">filtreyi kaldır</span>
        </button>
      ))}

      {hasAny && (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-auto text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {t.cars.filtersClear}
        </button>
      )}
    </div>
  );
}
