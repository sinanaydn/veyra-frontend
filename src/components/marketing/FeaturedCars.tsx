/**
 * "Editör seçimleri" — 6 newest cars in a snap-scroll row on mobile,
 * 3-col grid on desktop.
 *
 * Server component: fetches via serverApi, no client JS needed.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { serverApi } from "@/lib/api/server";
import { CarCard } from "@/components/cars/CarCard";

export async function FeaturedCars() {
  let cars: Awaited<ReturnType<typeof serverApi.cars.list>>["content"] = [];
  try {
    const page = await serverApi.cars.list(
      {},
      { page: 0, size: 6, sort: ["createdAt,desc"] },
    );
    cars = page.content;
  } catch {
    // Soft fail — landing should still render even if backend is down.
    cars = [];
  }

  if (cars.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
      {/* Section header */}
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
            Editör Seçimleri
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Bu hafta öne çıkan araçlar
          </h2>
        </div>
        <Link
          href="/cars"
          className="group/all hidden shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
        >
          Tümünü gör
          <ArrowRight
            className="size-4 transition-transform group-hover/all:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>

      {/* Grid (mobile: snap row, desktop: 3-col grid) */}
      <ul
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3 lg:gap-6"
      >
        {cars.map((car) => (
          <li
            key={car.id}
            className="w-[78vw] shrink-0 snap-start sm:w-[55vw] md:w-auto md:shrink"
          >
            <CarCard car={car} />
          </li>
        ))}
      </ul>

      <div className="mt-8 md:hidden">
        <Link
          href="/cars"
          className="group/all inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Tümünü gör
          <ArrowRight
            className="size-4 transition-transform group-hover/all:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </section>
  );
}
