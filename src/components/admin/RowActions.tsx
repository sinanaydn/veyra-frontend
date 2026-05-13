/**
 * Right-aligned row actions container — compact ghost icon buttons that
 * stop propagation so the row click handler does not fire.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function RowActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-end gap-1", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: "default" | "danger" | "accent";
}

export function RowIconButton({
  label,
  tone = "default",
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-surface-2",
        tone === "default" && "hover:text-foreground",
        tone === "accent" && "hover:text-accent",
        tone === "danger" && "hover:text-destructive",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
