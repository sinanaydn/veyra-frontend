"use client";

/**
 * Date range picker — Calendar inside a Popover.
 * Reference: SPECIFICATION.md FR-CD-3
 *
 * Constraints:
 *  - past dates disabled
 *  - endDate must be > startDate (DayPicker handles this naturally for ranges)
 */

import { CalendarRange } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/format";
import { t } from "@/messages/tr";
import { tr } from "date-fns/locale";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (v: DateRange | undefined) => void;
  className?: string;
}

const today = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const hasFrom = !!value?.from;
  const hasTo = !!value?.to;

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex h-12 w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 text-left transition-colors hover:bg-surface-2 focus-visible:border-accent focus-visible:outline-none",
          className,
        )}
      >
        <CalendarRange
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="flex flex-1 items-center gap-3 text-sm">
          <div className="flex flex-col">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t.booking.startDate}
            </span>
            <span
              className={cn(
                "font-medium tabular-nums",
                !hasFrom && "text-muted-foreground/60",
              )}
              data-numeric
            >
              {hasFrom ? formatDateShort(value!.from!) : "—"}
            </span>
          </div>
          <span aria-hidden className="text-muted-foreground/40">
            →
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t.booking.endDate}
            </span>
            <span
              className={cn(
                "font-medium tabular-nums",
                !hasTo && "text-muted-foreground/60",
              )}
              data-numeric
            >
              {hasTo ? formatDateShort(value!.to!) : "—"}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-0"
        sideOffset={8}
      >
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          disabled={{ before: today }}
          numberOfMonths={1}
          locale={tr}
          showOutsideDays
        />
      </PopoverContent>
    </Popover>
  );
}
