/**
 * Compact empty state for inside admin table cards.
 *
 * Used when a query returns 0 rows. Centered, hairline border, no CTA
 * unless caller passes `action`. Keeps table chrome consistent — no
 * jarring "Try a different filter" until the user has filtered.
 */

import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyRow({ title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className="grid size-10 place-items-center rounded-full border border-dashed border-border"
      >
        <span className="size-1.5 rounded-full bg-muted-foreground/40" />
      </div>
      <p className="text-[0.95rem] font-medium">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
