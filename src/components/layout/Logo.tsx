/**
 * Brand mark — chevron + "Veyra" wordmark.
 * Reference: BRANDING.md §2
 *
 * Pure SVG — scales crisply, inherits text color, no image asset needed.
 */

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Set true to render only the chevron (compact contexts). */
  iconOnly?: boolean;
  /** Override link target — defaults to "/" */
  href?: string;
  className?: string;
}

export function Logo({ iconOnly, href = "/", className }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Veyra RentACar"
      className={cn(
        "group/logo inline-flex items-center gap-2.5",
        "text-foreground transition-opacity hover:opacity-90",
        className,
      )}
    >
      {/* Chevron mark — angled 65° per BRANDING.md §2 */}
      <span className="relative flex size-7 items-center justify-center">
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-7"
          aria-hidden
        >
          <path
            d="M6 7L17 14L6 21"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="square"
            strokeLinejoin="miter"
            className="text-accent"
          />
          <path
            d="M14 7L25 14L14 21"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="square"
            strokeLinejoin="miter"
            opacity="0.35"
            className="text-accent"
          />
        </svg>
      </span>
      {!iconOnly && (
        <span
          className="text-[1.05rem] font-semibold leading-none tracking-[-0.04em]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          Veyra
        </span>
      )}
    </Link>
  );
}
