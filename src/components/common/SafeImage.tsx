"use client";

/**
 * SafeImage — `next/image` wrapper with a graceful fallback when the
 * source 403/404s.
 *
 * Why: backend serves presigned URLs with a TTL (~60 min). A page that
 * was rendered an hour ago and never refetched will reference a stale,
 * signed URL that returns 403. Two failure modes we handle:
 *
 *   1. TTL expired (most common)  → silent fallback to placeholder
 *   2. Orphaned record in DB      → same fallback
 *
 * Components that need fancier handling (e.g. trigger a refetch on
 * error) can read `onError` themselves; this is the default for the
 * 95% case.
 */

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends Omit<ImageProps, "onError" | "src"> {
  src: string | undefined | null;
  /** Optional icon size for fallback (default: 24). */
  fallbackIconSize?: number;
}

export function SafeImage({
  src,
  alt,
  className,
  fallbackIconSize = 24,
  ...rest
}: Props) {
  // "Adjust state during render" pattern — when `src` changes (e.g. a
  // refetch returned a fresh presigned URL), reset the errored flag so
  // the new URL gets a chance to load. Cheaper than an effect cascade.
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevSrc, setPrevSrc] = React.useState(src);
  const [errored, setErrored] = React.useState(false);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setErrored(false);
  }

  if (!src || errored) {
    return (
      <div
        aria-hidden={!alt}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className={cn(
          "grid place-items-center bg-surface-2 text-muted-foreground/40",
          className,
        )}
      >
        <ImageOff
          style={{ width: fallbackIconSize, height: fallbackIconSize }}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}
