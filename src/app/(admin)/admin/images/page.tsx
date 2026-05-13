"use client";

/**
 * Admin · Images overview — grid of all cars with their primary image
 * thumbnail + image count + a one-tap link into the per-car manager.
 *
 * Use case: an admin wants to find "the car that's missing photos" or
 * jump straight to the gallery without going through the cars table.
 */

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ImageIcon, ImageOff, Search } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pager } from "@/components/admin/Pager";
import { EmptyRow } from "@/components/admin/EmptyRow";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCars } from "@/lib/queries/useCars";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export default function AdminImagesOverviewPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const cars = useCars(
    {},
    { page, size: PAGE_SIZE, sort: ["createdAt,desc"] },
  );

  const term = search.trim().toLowerCase();
  const filtered = term
    ? (cars.data?.content ?? []).filter((c) =>
        `${c.brandName} ${c.modelName}`.toLowerCase().includes(term),
      )
    : (cars.data?.content ?? []);

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow={t.admin.eyebrowImages}
        title={t.admin.sectionImages}
        description="Filondaki her aracın görsellerini yönet — kapak seç, sırala, yükle."
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder={t.common.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            aria-label={t.common.search}
          />
        </div>
      </div>

      {cars.isLoading && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!cars.isLoading && filtered.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface">
          <EmptyRow title={t.admin.carsEmpty} />
        </div>
      )}

      {!cars.isLoading && filtered.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((car) => {
            const count = car.images?.length ?? 0;
            const cover =
              car.primaryImageUrl ??
              car.images?.find((i) => i.primary)?.url ??
              car.images?.[0]?.url;
            return (
              <li key={car.id}>
                <Link
                  href={`/admin/cars/${car.id}/images`}
                  className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent/40"
                >
                  <div className="relative aspect-[4/3] w-full bg-surface-2">
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground/40">
                        <ImageOff className="size-8" aria-hidden />
                      </div>
                    )}
                    <span
                      className={cn(
                        "absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] backdrop-blur-md",
                        count === 0
                          ? "bg-warning/80 text-warning-foreground"
                          : "bg-background/80 text-foreground",
                      )}
                      data-numeric
                    >
                      <ImageIcon className="size-3" aria-hidden />
                      {count}/10
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="truncate text-[0.9rem] font-semibold">
                      {car.brandName} {car.modelName}
                    </p>
                    <p className="mt-0.5 font-mono text-[0.72rem] tabular-nums text-muted-foreground">
                      #{car.id} · {car.year}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
        <Pager
          page={cars.data?.pageNumber ?? page}
          totalPages={cars.data?.totalPages ?? 0}
          totalElements={cars.data?.totalElements}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
