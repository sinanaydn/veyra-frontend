/**
 * Brand detail — `/brands/[id]`.
 * Reference: TASKS.md T-053
 *
 * Three sections:
 *  1. Hero — brand name + stats
 *  2. Modeller — chips that drill into the catalog
 *  3. Araçlar — first 12 cars; "Tümünü gör" deep-links to /cars?brandId=
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { serverApi } from "@/lib/api/server";
import { CarCard } from "@/components/cars/CarCard";
import { formatNumber } from "@/lib/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadBrand(idStr: string) {
  const id = Number(idStr);
  if (!Number.isFinite(id) || id <= 0) notFound();
  try {
    return await serverApi.brands.byId(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const brand = await loadBrand(id);
    return {
      title: brand.name,
      description: `${brand.name} marka araçları Veyra RentACar'da.`,
    };
  } catch {
    return { title: "Marka" };
  }
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { id } = await params;
  const brand = await loadBrand(id);
  const brandIdNum = Number(id);

  // Fetch models + first cars in parallel
  const [models, carsPage] = await Promise.all([
    serverApi.models.list({ brandId: brandIdNum }).catch(() => []),
    serverApi.cars
      .list(
        { brandId: brandIdNum },
        { page: 0, size: 12, sort: ["createdAt,desc"] },
      )
      .catch(() => null),
  ]);

  const cars = carsPage?.content ?? [];
  const totalCars = carsPage?.totalElements ?? 0;

  return (
    <main
      id="main"
      className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14 lg:px-8 lg:py-16"
    >
      {/* Back */}
      <Link
        href="/brands"
        className="group/back inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft
          className="size-3.5 transition-transform group-hover/back:-translate-x-0.5"
          aria-hidden
        />
        Markalar
      </Link>

      {/* Hero */}
      <header className="mt-6 mb-12 md:mt-8 md:mb-16">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          Marka
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.045em] md:text-6xl lg:text-7xl">
          {brand.name}
        </h1>

        {/* Stats row */}
        <dl className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-3">
          <div className="flex items-baseline gap-2">
            <dt
              className="font-mono text-2xl font-semibold tracking-tight text-foreground"
              data-numeric
            >
              {formatNumber(models.length)}
            </dt>
            <dd className="text-xs uppercase tracking-widest text-muted-foreground">
              model
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt
              className="font-mono text-2xl font-semibold tracking-tight text-foreground"
              data-numeric
            >
              {formatNumber(totalCars)}
            </dt>
            <dd className="text-xs uppercase tracking-widest text-muted-foreground">
              araç
            </dd>
          </div>
        </dl>
      </header>

      {/* Models */}
      {models.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-5 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
            Modeller
          </h2>
          <ul className="flex flex-wrap gap-2">
            {models.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/cars?brandId=${brand.id}&modelId=${m.id}`}
                  className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
                >
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Cars */}
      <section>
        <header className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
            Araçlar
          </h2>
          {totalCars > cars.length && (
            <Link
              href={`/cars?brandId=${brand.id}`}
              className="group/all inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Tümünü gör (
              <span className="font-mono tabular-nums" data-numeric>
                {formatNumber(totalCars)}
              </span>
              )
              <ArrowRight
                className="size-3.5 transition-transform group-hover/all:translate-x-0.5"
                aria-hidden
              />
            </Link>
          )}
        </header>

        {cars.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/30 px-6 py-16 text-sm text-muted-foreground">
            Bu marka altında henüz araç bulunmuyor.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {cars.map((car) => (
              <li key={car.id}>
                <CarCard car={car} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
