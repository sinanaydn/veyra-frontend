/**
 * Admin editorial header.
 *
 *   ── VEYRA · YÖNETİM // 03
 *   Araçlar
 *   Filodaki tüm araçlar.                              [Yeni araç ＋]
 *
 * Mono eyebrow + tight-tracked display title. Optional actions slot
 * on the right (a single primary CTA, or a row of secondary controls).
 */

import { cn } from "@/lib/utils";

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: Props) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 pb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="mb-3 inline-flex items-center gap-2.5">
          <span aria-hidden className="h-px w-6 bg-accent/70" />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </span>
        </div>
        <h1 className="text-[1.85rem] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[2.15rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
