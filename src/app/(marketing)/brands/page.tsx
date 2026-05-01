/**
 * Brands index — `/brands`.
 * Reference: TASKS.md T-053, SPECIFICATION.md §4.1
 *
 * Server component. Parallel fetches brands + all models so we can
 * render per-tile model counts without N+1.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { serverApi } from "@/lib/api/server";
import type { Brand } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Markalar",
  description: "Premium üreticilerin filomuzdaki tüm markaları.",
};

interface BrandTileProps {
  brand: Brand;
  modelCount: number;
}

function BrandTile({ brand, modelCount }: BrandTileProps) {
  return (
    <Link
      href={`/brands/${brand.id}`}
      className="group/tile flex h-full flex-col justify-between bg-background p-6 transition-colors hover:bg-surface md:p-8"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
          Marka
        </p>
        <ArrowUpRight
          className="size-4 text-muted-foreground/50 transition-all duration-200 group-hover/tile:-translate-y-0.5 group-hover/tile:translate-x-0.5 group-hover/tile:text-accent"
          aria-hidden
        />
      </div>
      <div className="mt-10">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {brand.name}
        </h3>
        <p
          className="mt-2 font-mono text-xs tabular-nums text-muted-foreground"
          data-numeric
        >
          {modelCount} model
        </p>
      </div>
    </Link>
  );
}

export default async function BrandsIndexPage() {
  let brands: Brand[] = [];
  let modelsByBrand = new Map<number, number>();

  try {
    const [b, allModels] = await Promise.all([
      serverApi.brands.list(),
      serverApi.models.list(),
    ]);
    brands = b;
    modelsByBrand = allModels.reduce((acc, m) => {
      acc.set(m.brandId, (acc.get(m.brandId) ?? 0) + 1);
      return acc;
    }, new Map<number, number>());
  } catch {
    // soft-fail
  }

  return (
    <main
      id="main"
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20"
    >
      {/* Header */}
      <header className="mb-12 max-w-2xl md:mb-16">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          Markalar
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Premium üreticiler,
          <br className="hidden md:block" />
          <span className="text-muted-foreground">tek çatı altında.</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          Avrupa, Asya ve Amerika menşeli{" "}
          <span
            className="font-mono font-medium text-foreground"
            data-numeric
          >
            {brands.length}
          </span>{" "}
          markadan oluşan filomuz, her sürüş zevkine hitap edecek seçenekler sunar.
        </p>
      </header>

      {brands.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/30 px-6 py-20 text-sm text-muted-foreground">
          Henüz marka eklenmemiş.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border/60 md:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => (
            <li key={brand.id}>
              <BrandTile
                brand={brand}
                modelCount={modelsByBrand.get(brand.id) ?? 0}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
