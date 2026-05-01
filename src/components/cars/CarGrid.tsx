/**
 * Responsive car grid. Renders skeletons during initial load,
 * cards otherwise. Empty state handled by parent (page).
 *
 * Uses `data-stale` to subtly desaturate when paging (placeholderData).
 */

import { CarCard } from "./CarCard";
import { CarCardSkeleton } from "./CarCardSkeleton";
import { cn } from "@/lib/utils";
import type { Car } from "@/lib/api/types";

interface CarGridProps {
  cars: Car[];
  loading?: boolean;
  /** Stale = currently showing previous page's data while next page loads. */
  stale?: boolean;
  skeletonCount?: number;
}

export function CarGrid({
  cars,
  loading,
  stale,
  skeletonCount = 8,
}: CarGridProps) {
  if (loading) {
    return (
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <li key={i}>
            <CarCardSkeleton />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4",
        stale && "opacity-60",
      )}
      aria-busy={stale || undefined}
    >
      {cars.map((car) => (
        <li key={car.id}>
          <CarCard car={car} />
        </li>
      ))}
    </ul>
  );
}
