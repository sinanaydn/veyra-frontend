/**
 * Similar cars rail — same brand, exclude the current car.
 * Server component.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { serverApi } from "@/lib/api/server";
import { CarCard } from "./CarCard";
import { t } from "@/messages/tr";

interface SimilarCarsProps {
  brandId: number;
  excludeCarId: number;
  brandName: string;
}

export async function SimilarCars({
  brandId,
  excludeCarId,
  brandName,
}: SimilarCarsProps) {
  let cars: Awaited<
    ReturnType<typeof serverApi.cars.list>
  >["content"] = [];
  try {
    const page = await serverApi.cars.list(
      { brandId },
      { page: 0, size: 8, sort: ["createdAt,desc"] },
    );
    cars = page.content.filter((c) => c.id !== excludeCarId).slice(0, 4);
  } catch {
    cars = [];
  }
  if (cars.length === 0) return null;

  return (
    <section>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
            {t.cars.detailSimilar}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">
            {brandName} ailesinden
          </h2>
        </div>
        <Link
          href={`/cars?brandId=${brandId}`}
          className="group/all hidden items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
        >
          Tümünü gör
          <ArrowRight
            className="size-3.5 transition-transform group-hover/all:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </header>

      <ul className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4 lg:gap-5">
        {cars.map((car) => (
          <li
            key={car.id}
            className="w-[78vw] shrink-0 snap-start sm:w-[55vw] md:w-auto md:shrink"
          >
            <CarCard car={car} compact />
          </li>
        ))}
      </ul>
    </section>
  );
}
