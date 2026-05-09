"use client";

/**
 * Pill-shaped primary submit button — matches the Hero CTA aesthetic.
 * Distinct from shadcn Button which is sized for compact UI; this one
 * carries the auth flow weight (h-12, full-width, mono affordances).
 */

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export const SubmitButton = React.forwardRef<HTMLButtonElement, Props>(
  function SubmitButton(
    { children, loading, loadingText, disabled, className, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="submit"
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "group/cta relative inline-flex h-12 w-full items-center justify-center gap-2",
          "rounded-full bg-accent text-accent-foreground",
          "text-[0.95rem] font-semibold tracking-[-0.005em]",
          "transition-all duration-200",
          "hover:brightness-110 active:translate-y-px",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-60",
          className,
        )}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
