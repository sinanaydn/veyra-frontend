"use client";

/**
 * Floating-label input — premium, distinctive auth field.
 *
 * Pattern: empty placeholder + `:placeholder-shown` peer state collapses
 * the label down to where the value sits. When focused or filled, label
 * floats up & shrinks. Pure CSS — no JS state needed.
 *
 * Used by both /login and /register so all fields share the same idiom.
 */

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label: string;
  hint?: string;
  error?: string;
  /** Slot rendered to the right inside the field (e.g. show-password toggle). */
  trailing?: React.ReactNode;
}

export const FloatingField = React.forwardRef<
  HTMLInputElement,
  FloatingFieldProps
>(function FloatingField(
  { label, hint, error, trailing, className, id, type = "text", ...props },
  ref,
) {
  const reactId = React.useId();
  const inputId = id ?? reactId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  return (
    <div className="grid gap-1.5">
      <div
        data-invalid={error ? "" : undefined}
        className={cn(
          "group/field relative isolate",
          "rounded-xl border border-border/80 bg-background/40",
          "transition-all duration-200",
          "hover:border-border",
          "focus-within:border-accent focus-within:bg-background/60",
          "focus-within:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_18%,transparent)]",
          "data-invalid:border-destructive/70",
          "data-invalid:focus-within:shadow-[0_0_0_4px_color-mix(in_oklch,var(--destructive)_18%,transparent)]",
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder=" "
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={cn(hint && hintId, error && errorId) || undefined}
          className={cn(
            "peer block w-full bg-transparent",
            "h-14 px-4 pt-5 pb-1.5 pr-12",
            "text-base text-foreground",
            "outline-none focus:outline-none",
            "[&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]",
            // Hide the trailing-slot padding when there's no trailing content
            !trailing && "pr-4",
            className,
          )}
          {...props}
        />

        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2",
            "select-none font-medium text-muted-foreground",
            "transition-all duration-200",
            // Default position when empty + not focused → centered, base size
            "text-[0.95rem]",
            // Floats up when focused or filled
            "peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[0.7rem] peer-focus:tracking-[0.08em] peer-focus:uppercase peer-focus:text-accent",
            "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[0.7rem] peer-[:not(:placeholder-shown)]:tracking-[0.08em] peer-[:not(:placeholder-shown)]:uppercase",
            "peer-[:not(:placeholder-shown)]:text-muted-foreground",
            // Invalid color
            "group-data-invalid/field:peer-[:not(:placeholder-shown)]:text-destructive",
            "group-data-invalid/field:peer-focus:text-destructive",
          )}
        >
          {label}
        </label>

        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>

      {hint && !error && (
        <p
          id={hintId}
          className="px-1 text-[0.78rem] leading-snug text-muted-foreground"
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="flex items-start gap-1.5 px-1 text-[0.78rem] leading-snug text-destructive"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});
