"use client";

/**
 * Catalog page — `/cars`.
 * Reference: TASKS.md T-051, IMPLEMENTATION.md §4.10
 *
 * URL-synced filter state (nuqs), server-side pagination, optimistic
 * page-keep on filter change, mobile bottom-sheet filter UI.
 *
 * Suspense boundary: nuqs uses `useSearchParams()` internally, which Next
 * 16 requires to live under a Suspense boundary so the shell can
 * prerender while the URL state hydrates on the client.
 */

import { Suspense, useEffect, useMemo } from "react";
import { Filter as FilterIcon } from "lucide-react";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";

import { CarGrid } from "@/components/cars/CarGrid";
import { CarFilterPanel } from "@/components/cars/CarFilterPanel";
import { CarFilterChipBar } from "@/components/cars/CarFilterChipBar";
import { CarSort, DEFAULT_SORT, type SortValue } from "@/components/cars/CarSort";
import { EmptyCars } from "@/components/cars/EmptyCars";
import { Pagination } from "@/components/common/Pagination";
import { RateLimitBanner } from "@/components/common/RateLimitBanner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCars } from "@/lib/queries/useCars";
import { ApiError } from "@/lib/api/errors";
import { formatNumber } from "@/lib/format";
import { t } from "@/messages/tr";
import { DEFAULT_PAGE_SIZE, type CarFilter } from "@/lib/api/types";

const FUEL_VALUES = ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"] as const;
const TX_VALUES = ["MANUAL", "AUTOMATIC"] as const;

const parsers = {
  brandId: parseAsInteger,
  modelId: parseAsInteger,
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  minYear: parseAsInteger,
  maxYear: parseAsInteger,
  fuelType: parseAsString,
  transmission: parseAsString,
  available: parseAsBoolean,
  page: parseAsInteger.withDefault(0),
  size: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  sort: parseAsString.withDefault(DEFAULT_SORT),
};

function CatalogShell() {
  const [state, setState] = useQueryStates(parsers, { history: "push" });

  // Project URL state into typed CarFilter (drop pagination/sort).
  const filter = useMemo<CarFilter>(() => {
    const f: CarFilter = {};
    if (state.brandId != null) f.brandId = state.brandId;
    if (state.modelId != null) f.modelId = state.modelId;
    if (state.minPrice != null) f.minPrice = state.minPrice;
    if (state.maxPrice != null) f.maxPrice = state.maxPrice;
    if (state.minYear != null) f.minYear = state.minYear;
    if (state.maxYear != null) f.maxYear = state.maxYear;
    if (
      state.fuelType &&
      (FUEL_VALUES as readonly string[]).includes(state.fuelType)
    ) {
      f.fuelType = state.fuelType as CarFilter["fuelType"];
    }
    if (
      state.transmission &&
      (TX_VALUES as readonly string[]).includes(state.transmission)
    ) {
      f.transmission = state.transmission as CarFilter["transmission"];
    }
    if (state.available != null) f.available = state.available;
    return f;
  }, [state]);

  const query = useCars(filter, {
    page: state.page,
    size: state.size,
    sort: [state.sort],
  });

  // When filters change, snap back to page 0 (don't search page 4 of new filter set)
  const filterSerialized = JSON.stringify(filter);
  useEffect(() => {
    if (state.page !== 0) setState({ page: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSerialized]);

  const onPatch = (patch: Partial<CarFilter>) => {
    setState({ ...patch, page: 0 });
  };

  const onClearAll = () => {
    setState({
      brandId: null,
      modelId: null,
      minPrice: null,
      maxPrice: null,
      minYear: null,
      maxYear: null,
      fuelType: null,
      transmission: null,
      available: null,
      page: 0,
    });
  };

  const onClearOne = (key: keyof CarFilter) => {
    setState({ [key]: null, page: 0 } as never);
  };

  const isRateLimited =
    query.error instanceof ApiError && query.error.status === 429;

  const data = query.data;
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const cars = data?.content ?? [];

  return (
    <main
      id="main"
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20"
    >
      {/* Page header */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
            Katalog
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {t.cars.catalogTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {query.isLoading ? (
              "Yükleniyor…"
            ) : (
              <>
                <span
                  className="font-mono font-medium text-foreground"
                  data-numeric
                >
                  {formatNumber(totalElements)}
                </span>{" "}
                araç bulundu
              </>
            )}
          </p>
        </div>
        <CarSort
          value={state.sort}
          onChange={(v: SortValue) => setState({ sort: v, page: 0 })}
        />
      </header>

      {/* 12-col grid: filter sidebar (3) + grid (9) on lg+ */}
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24">
            <h2 className="mb-6 flex items-center gap-2 text-sm font-semibold tracking-tight">
              <FilterIcon
                className="size-4 text-muted-foreground"
                aria-hidden
              />
              {t.cars.filters}
            </h2>
            <CarFilterPanel value={filter} onChange={onPatch} />
          </div>
        </aside>

        {/* Main column */}
        <section className="lg:col-span-9">
          {/* Active chips + mobile filter trigger */}
          <div className="mb-6">
            <CarFilterChipBar
              value={filter}
              onClear={onClearOne}
              onClearAll={onClearAll}
              mobileTrigger={
                <Sheet>
                  <SheetTrigger className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface-2">
                    <FilterIcon className="size-3.5" aria-hidden />
                    {t.cars.filters}
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="max-h-[85svh] overflow-y-auto rounded-t-2xl"
                  >
                    <SheetHeader>
                      <SheetTitle>{t.cars.filters}</SheetTitle>
                    </SheetHeader>
                    <div className="px-4 pb-6">
                      <CarFilterPanel
                        value={filter}
                        onChange={onPatch}
                        compact
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              }
            />
          </div>

          {isRateLimited && (
            <div className="mb-6">
              <RateLimitBanner onRetry={() => query.refetch()} />
            </div>
          )}

          {query.isLoading ? (
            <CarGrid cars={[]} loading />
          ) : cars.length === 0 ? (
            <EmptyCars onReset={onClearAll} />
          ) : (
            <CarGrid cars={cars} stale={query.isPlaceholderData} />
          )}

          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                page={state.page}
                totalPages={totalPages}
                onChange={(p) => setState({ page: p })}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function CatalogFallback() {
  return (
    <main
      id="main"
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20"
    >
      <div className="mb-8 md:mb-10">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          Katalog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          {t.cars.catalogTitle}
        </h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="hidden lg:col-span-3 lg:block" />
        <section className="lg:col-span-9">
          <CarGrid cars={[]} loading />
        </section>
      </div>
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogShell />
    </Suspense>
  );
}
