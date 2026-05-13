"use client";

/**
 * Car gallery — hero image + thumbnail strip + lightbox dialog.
 * Reference: SPECIFICATION.md FR-CD-1
 *
 * Sort rule: respect `displayOrder` ascending; ensure `primary` lands first.
 */

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CarImage } from "@/lib/api/types";

interface CarGalleryProps {
  images: CarImage[];
  alt: string;
}

function sortImages(images: CarImage[]): CarImage[] {
  if (!images.length) return [];
  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  // Ensure primary is first regardless of displayOrder.
  const primaryIdx = sorted.findIndex((img) => img.primary);
  if (primaryIdx > 0) {
    const [p] = sorted.splice(primaryIdx, 1);
    sorted.unshift(p);
  }
  return sorted;
}

export function CarGallery({ images, alt }: CarGalleryProps) {
  const sorted = useMemo(() => sortImages(images), [images]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const total = sorted.length;
  // Clamp at read-time — avoids an effect that resets state when the
  // image array shrinks (e.g. admin deletes the last image while we're
  // viewing). `safeIdx` is always a valid index into `sorted`.
  const safeIdx = total > 0 ? Math.min(activeIdx, total - 1) : 0;
  const active = sorted[safeIdx];

  const next = () =>
    setActiveIdx((i) => (Math.min(i, total - 1) + 1) % Math.max(1, total));
  const prev = () =>
    setActiveIdx(
      (i) =>
        (Math.min(i, total - 1) - 1 + total) % Math.max(1, total),
    );

  // Keyboard nav inside lightbox
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, total]);

  if (total === 0) {
    return (
      <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-surface-2">
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          görsel yok
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Araç görselleri">
      {/* Hero */}
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="group/hero relative block aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Image
          src={active.url}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover/hero:scale-[1.02]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-50"
        />
        <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-inset ring-border/50 backdrop-blur transition-opacity group-hover/hero:opacity-100 lg:opacity-0">
          <Maximize2 className="size-3.5" aria-hidden />
          Büyüt
        </span>
        {total > 1 && (
          <span className="absolute bottom-4 right-4 rounded-full bg-background/70 px-3 py-1 font-mono text-[0.65rem] font-medium tabular-nums text-foreground ring-1 ring-inset ring-border/50 backdrop-blur" data-numeric>
            {safeIdx + 1} / {total}
          </span>
        )}
      </button>

      {/* Thumbnail strip */}
      {total > 1 && (
        <ul className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
          {sorted.map((img, idx) => {
            const isActive = idx === safeIdx;
            return (
              <li key={img.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  aria-label={`Görsel ${idx + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative aspect-[4/3] w-24 overflow-hidden rounded-lg border-2 transition-all",
                    isActive
                      ? "border-accent shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-accent)_25%,transparent)]"
                      : "border-transparent opacity-70 hover:border-border hover:opacity-100",
                  )}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Lightbox */}
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          className="max-w-[100vw] border-none bg-background/95 p-0 backdrop-blur-md sm:max-w-6xl"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{alt} galeri</DialogTitle>
          <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl bg-background">
            <Image
              src={active.url}
              alt={alt}
              fill
              sizes="90vw"
              className="object-contain"
            />

            {/* Controls */}
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Galeriyi kapat"
              className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground ring-1 ring-inset ring-border backdrop-blur transition-colors hover:bg-surface"
            >
              <X className="size-4" aria-hidden />
            </button>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Önceki görsel"
                  className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground ring-1 ring-inset ring-border backdrop-blur transition-colors hover:bg-surface"
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Sonraki görsel"
                  className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground ring-1 ring-inset ring-border backdrop-blur transition-colors hover:bg-surface"
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>

                <span
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 font-mono text-xs tabular-nums text-foreground ring-1 ring-inset ring-border backdrop-blur"
                  data-numeric
                >
                  {safeIdx + 1} / {total}
                </span>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
