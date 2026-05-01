/**
 * Car detail — `/cars/[id]`.
 * Reference: TASKS.md T-052
 *
 * Server component for SEO and fastest first paint. Booking widget and
 * gallery are client islands.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ApiError } from "@/lib/api/errors";
import { serverApi } from "@/lib/api/server";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { CarGallery } from "@/components/cars/CarGallery";
import { CarSpecsGrid } from "@/components/cars/CarSpecsGrid";
import { CarStatusBadge } from "@/components/cars/CarStatusBadge";
import { SimilarCars } from "@/components/cars/SimilarCars";
import { currencyTRY } from "@/lib/format";
import { t } from "@/messages/tr";
import type { Car } from "@/lib/api/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadCar(idStr: string): Promise<Car> {
  const id = Number(idStr);
  if (!Number.isFinite(id) || id <= 0) notFound();
  try {
    return await serverApi.cars.byId(id);
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
    const car = await loadCar(id);
    const title = `${car.brandName} ${car.modelName} ${car.year}`;
    return {
      title,
      description:
        car.description ??
        `${title} — günlük ${currencyTRY(car.dailyPrice)} fiyatla Veyra RentACar'da.`,
      openGraph: {
        title,
        description: car.description ?? undefined,
        images: car.primaryImageUrl ? [{ url: car.primaryImageUrl }] : [],
      },
    };
  } catch {
    return { title: "Araç" };
  }
}

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params;
  const car = await loadCar(id);

  return (
    <main
      id="main"
      className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14 lg:px-8 lg:py-16"
    >
      {/* Breadcrumb */}
      <nav
        aria-label="Konum"
        className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <a
              href="/cars"
              className="transition-colors hover:text-foreground"
            >
              {t.cars.catalogTitle}
            </a>
          </li>
          <li aria-hidden>›</li>
          <li>
            <a
              href={`/cars?brandId=${car.brandId}`}
              className="transition-colors hover:text-foreground"
            >
              {car.brandName}
            </a>
          </li>
          <li aria-hidden>›</li>
          <li className="text-foreground">{car.modelName}</li>
        </ol>
      </nav>

      {/* Title row */}
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            {car.brandName}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {car.modelName}
          </h1>
          <p
            className="mt-2 font-mono text-sm tabular-nums text-muted-foreground"
            data-numeric
          >
            {car.year} · {car.seats} {t.cars.seats} · {car.doors} {t.cars.doors}
          </p>
        </div>
        <CarStatusBadge status={car.status} />
      </header>

      {/* Main grid: gallery+content (lg:8) | booking (lg:4) */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-12 lg:col-span-8">
          <CarGallery
            images={car.images}
            alt={`${car.brandName} ${car.modelName}`}
          />

          <CarSpecsGrid car={car} />

          {car.description && (
            <section>
              <h2 className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                {t.cars.detailDescription}
              </h2>
              <p className="text-base leading-relaxed text-foreground">
                {car.description}
              </p>
            </section>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <BookingWidget car={car} />
          </div>
        </div>
      </div>

      {/* Similar cars */}
      <div className="mt-16 md:mt-24">
        <SimilarCars
          brandId={car.brandId}
          excludeCarId={car.id}
          brandName={car.brandName}
        />
      </div>
    </main>
  );
}
