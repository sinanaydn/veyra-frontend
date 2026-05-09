/**
 * Empty state — used when /rentals or /payments have no items.
 * Editorial; not chatty, not over-illustrated.
 */

import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaHref,
  ctaLabel,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-dashed border-border/70 bg-surface/40 px-6 py-14 text-center",
        className,
      )}
    >
      {/* Soft accent halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-40 w-80 -translate-x-1/2 rounded-full bg-accent/5 blur-3xl"
      />

      <div className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-surface text-accent">
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-[0.85rem] font-semibold text-accent-foreground transition-all hover:brightness-110 active:translate-y-px"
        >
          {ctaLabel}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
