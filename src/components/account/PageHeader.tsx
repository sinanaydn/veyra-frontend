/**
 * Editorial page header for account sub-routes.
 *
 *   ── 02 — KIRALAMALARIM
 *   Kiralamalarım
 *   Tüm kiralama hareketlerin tek bir akışta.
 */

import { cn } from "@/lib/utils";

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
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
          <span className="h-px w-6 bg-accent/70" />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </span>
        </div>
        <h1 className="text-[1.85rem] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-[2.15rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
