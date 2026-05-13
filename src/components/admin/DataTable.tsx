/**
 * Admin DataTable — TanStack Table v8 headless wrapper.
 *
 * Editorial chrome:
 *  - Hairline borders, surface card body
 *  - Mono uppercase column headers (tight tracking)
 *  - Hover row pulls 2px right, accent rail bleeds in from the left
 *  - Tabular numerals for numeric/ID columns
 *
 * Server-side pagination — caller owns page state (drives `Pageable`).
 * This component receives data + total page count + optional handlers.
 */

"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyRow } from "./EmptyRow";

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  /** Number of skeleton rows when loading and data is empty. */
  skeletonRows?: number;
  /** Empty state shown when data is empty and not loading. */
  empty?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Render an additional row beneath each base row (e.g. expanded detail). */
  renderSubRow?: (row: Row<TData>) => React.ReactNode;
  /** Click handler for the row body — does not fire on action cells. */
  onRowClick?: (row: TData) => void;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  skeletonRows = 6,
  empty,
  emptyTitle = "Kayıt yok.",
  emptyDescription,
  renderSubRow,
  onRowClick,
  className,
}: Props<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const showSkeleton = isLoading && data.length === 0;
  const showEmpty = !isLoading && data.length === 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b border-border bg-surface-2/30">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    scope="col"
                    className="px-4 py-3 text-left font-mono text-[0.62rem] font-medium uppercase tracking-[0.22em] text-muted-foreground"
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {showSkeleton &&
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr
                  key={`sk-${i}`}
                  className="border-b border-border last:border-b-0"
                >
                  {columns.map((_c, j) => (
                    <td key={j} className="px-4 py-4">
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!showSkeleton &&
              !showEmpty &&
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : undefined
                    }
                    className={cn(
                      "group relative border-b border-border transition-colors last:border-b-0",
                      "hover:bg-surface-2/40",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="relative px-4 py-3.5 align-middle text-[0.875rem] text-foreground first:pl-5"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                  {renderSubRow && (
                    <tr className="border-b border-border last:border-b-0">
                      <td
                        colSpan={row.getVisibleCells().length}
                        className="bg-surface-2/20 px-5 py-3"
                      >
                        {renderSubRow(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

            {showEmpty && (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {empty ?? (
                    <EmptyRow
                      title={emptyTitle}
                      description={emptyDescription}
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Tabular numeric cell — for IDs, currency, dates. */
export function NumCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[0.825rem] tabular-nums text-foreground",
        className,
      )}
      data-numeric
    >
      {children}
    </span>
  );
}

/** Compact ID badge — for hash-style numeric IDs. */
export function IdCell({ id }: { id: number | string }) {
  return (
    <span
      className="font-mono text-[0.78rem] tabular-nums text-muted-foreground"
      data-numeric
    >
      #{id}
    </span>
  );
}
