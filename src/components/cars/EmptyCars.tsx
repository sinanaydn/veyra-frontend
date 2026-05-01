/**
 * Empty state for the catalog when 0 results match the active filters.
 * Reference: SPECIFICATION.md FR-CAT-6
 */

import { SearchX } from "lucide-react";
import { t } from "@/messages/tr";

export function EmptyCars({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/30 px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-surface text-muted-foreground">
        <SearchX className="size-6" aria-hidden />
      </div>
      <h2 className="mt-6 text-lg font-semibold tracking-tight">
        {t.cars.emptyTitle}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Filtreleri biraz gevşetmeyi dene; gizli kalmış favorilere ulaşabilirsin.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-7 inline-flex h-10 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110 active:translate-y-px"
      >
        {t.cars.emptyAction}
      </button>
    </div>
  );
}
