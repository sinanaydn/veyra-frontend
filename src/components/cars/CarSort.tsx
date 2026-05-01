"use client";

/**
 * Catalog sort dropdown — uses shadcn DropdownMenu for a clean menu UI.
 * Reference: SPECIFICATION.md FR-CAT-4
 */

import { ArrowUpDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { t } from "@/messages/tr";

export const SORT_OPTIONS = [
  { value: "createdAt,desc", label: t.cars.sortNewest },
  { value: "dailyPrice,asc", label: t.cars.sortPriceAsc },
  { value: "dailyPrice,desc", label: t.cars.sortPriceDesc },
  { value: "year,desc", label: t.cars.sortYearDesc },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortValue = "createdAt,desc";

interface CarSortProps {
  value: string;
  onChange: (v: SortValue) => void;
}

export function CarSort({ value, onChange }: CarSortProps) {
  const current =
    SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface-2 focus-visible:border-accent focus-visible:outline-none">
        <ArrowUpDown className="size-3.5 text-muted-foreground" aria-hidden />
        <span className="hidden sm:inline">{t.cars.sort}:</span>
        <span className="font-medium">{current.label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        {SORT_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onSelect={() => onChange(opt.value)}
            className={cn(
              "flex items-center justify-between gap-3",
              opt.value === value && "text-accent",
            )}
          >
            <span>{opt.label}</span>
            {opt.value === value && (
              <Check className="size-4" aria-hidden />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
