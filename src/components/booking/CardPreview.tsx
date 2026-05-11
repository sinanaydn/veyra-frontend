"use client";

/**
 * Live credit-card preview that mirrors the form as the user types.
 *
 * Visual concept — a luxury black card lit from one side. As the user
 * types, the digits stream into the card body in mono numerals. When the
 * CVC field is focused, the card flips on its Y-axis to reveal a magstripe
 * + signature panel with a tasteful "ANAHTARIN YOLA HAZIR" tagline.
 *
 * Per BRANDING.md: deep navy primary, electric accent. No glossy gradient,
 * no skeumorphism — just a chamfered surface with a hairline grid texture.
 *
 * Cosmetic only — no real card data flows anywhere.
 */

import { motion } from "framer-motion";
import { Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/messages/tr";

export type CardBrand = "visa" | "mastercard" | "amex" | "generic";

export function detectBrand(num: string): CardBrand {
  const digits = num.replace(/\D/g, "");
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return "generic";
}

export function formatCardNumber(num: string, brand: CardBrand): string {
  const digits = num.replace(/\D/g, "").slice(0, brand === "amex" ? 15 : 19);
  if (brand === "amex") {
    return digits.replace(/(\d{4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(" "),
    );
  }
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function maskedCardNumber(formatted: string, brand: CardBrand): string {
  // Pad with bullet groups so the card always shows the full silhouette
  const target = brand === "amex" ? "•••• •••••• •••••" : "•••• •••• •••• ••••";
  if (!formatted) return target;
  // Replace leading characters of the placeholder with what's typed
  const out: string[] = [];
  let pi = 0;
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    if (ch === " ") {
      out.push(" ");
      continue;
    }
    out.push(formatted[pi] && formatted[pi] !== " " ? formatted[pi] : "•");
    if (formatted[pi]) pi++;
  }
  return out.join("");
}

interface Props {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  brand: CardBrand;
  flipped: boolean;
}

export function CardPreview({
  number,
  name,
  expiry,
  cvc,
  brand,
  flipped,
}: Props) {
  return (
    <div
      className="relative w-full"
      style={{ perspective: "1400px" }}
      aria-hidden
    >
      {/* Soft accent halo — anchors the card to the page */}
      <div
        className="pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 rounded-[2rem] bg-accent/8 blur-3xl"
      />

      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="relative aspect-[1.586/1] w-full rounded-[1.4rem]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Front number={number} name={name} expiry={expiry} brand={brand} />
        <Back cvc={cvc} />
      </motion.div>

      {/* Subtle reflection slab beneath card */}
      <div className="pointer-events-none mx-auto mt-3 h-3 w-3/4 rounded-full bg-gradient-to-b from-accent/15 to-transparent blur-md" />
    </div>
  );
}

// ============================================================
// Front face
// ============================================================

function Front({
  number,
  name,
  expiry,
  brand,
}: {
  number: string;
  name: string;
  expiry: string;
  brand: CardBrand;
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-[oklch(0.18_0.04_252)] via-[oklch(0.14_0.03_252)] to-[oklch(0.10_0.02_250)] text-white shadow-[0_30px_60px_-30px_oklch(0_0_0/0.6)]"
      style={{ backfaceVisibility: "hidden" }}
    >
      {/* Hairline grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(120% 80% at 0% 0%, black 0%, black 40%, transparent 75%)",
        }}
      />
      {/* Diagonal accent gleam */}
      <div
        aria-hidden
        className="absolute -right-1/3 -top-1/3 h-[140%] w-[80%] rotate-[18deg] bg-gradient-to-b from-accent/25 via-accent/10 to-transparent blur-2xl"
      />

      {/* Top row */}
      <div className="absolute inset-x-6 top-5 flex items-start justify-between">
        <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-white/85">
          Veyra
        </span>
        <Wifi
          className="size-4 -rotate-90 text-white/70"
          strokeWidth={1.6}
          aria-hidden
        />
      </div>

      {/* Chip */}
      <div className="absolute left-6 top-12">
        <Chip />
      </div>

      {/* Card number */}
      <div className="absolute inset-x-6 bottom-[5.4rem]">
        <p
          className="font-mono text-[1.05rem] tabular-nums text-white sm:text-[1.18rem]"
          style={{
            letterSpacing: "0.12em",
            textShadow: "0 1px 0 oklch(0 0 0 / 0.4)",
          }}
        >
          {maskedCardNumber(number, brand) || "•••• •••• •••• ••••"}
        </p>
      </div>

      {/* Bottom row */}
      <div className="absolute inset-x-6 bottom-5 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-white/55">
            {t.booking.cardName}
          </p>
          <p className="mt-1 truncate font-mono text-[0.85rem] uppercase tracking-[0.08em] text-white">
            {name.trim() || t.booking.cardHolderPlaceholder}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-white/55">
            {t.booking.cardExpiry}
          </p>
          <p className="mt-1 font-mono text-[0.85rem] tabular-nums text-white">
            {expiry || t.booking.cardExpiryShortPlaceholder}
          </p>
        </div>
      </div>

      {/* Brand mark — bottom right corner glyph */}
      <div className="absolute right-5 top-5">
        <BrandMark brand={brand} />
      </div>
    </div>
  );
}

// ============================================================
// Back face
// ============================================================

function Back({ cvc }: { cvc: string }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-[oklch(0.16_0.03_252)] to-[oklch(0.09_0.02_250)] text-white shadow-[0_30px_60px_-30px_oklch(0_0_0/0.6)]"
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
      }}
    >
      {/* Magstripe */}
      <div className="absolute inset-x-0 top-7 h-12 bg-black/85" />

      {/* Signature + CVC */}
      <div className="absolute inset-x-6 top-24 flex items-center gap-3">
        <div
          className="relative h-9 flex-1 rounded-sm bg-white/90"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, oklch(0.7 0 0) 0 6px, oklch(0.85 0 0) 6px 12px)",
          }}
        />
        <div className="flex h-9 min-w-[4.5rem] items-center justify-center rounded-sm bg-white px-3 font-mono text-sm font-semibold tabular-nums text-black">
          {cvc.replace(/\D/g, "").slice(0, 4) || t.booking.cardCvcPlaceholder}
        </div>
      </div>

      <p className="absolute inset-x-6 bottom-5 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-white/55">
        {t.booking.cardBackTagline}
      </p>
    </div>
  );
}

// ============================================================
// Chip — ornamental SVG
// ============================================================

function Chip() {
  return (
    <svg
      width="38"
      height="28"
      viewBox="0 0 38 28"
      fill="none"
      aria-hidden
      className="drop-shadow-[0_1px_0_oklch(0_0_0/0.35)]"
    >
      <defs>
        <linearGradient id="chip-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.86 0.08 90)" />
          <stop offset="55%" stopColor="oklch(0.72 0.12 80)" />
          <stop offset="100%" stopColor="oklch(0.55 0.08 70)" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="36"
        height="26"
        rx="4"
        fill="url(#chip-g)"
        stroke="oklch(0.40 0.05 70)"
        strokeWidth="0.5"
      />
      <path
        d="M10 6v16M28 6v16M1 10h9M1 18h9M28 10h9M28 18h9M14 1v6M24 1v6M14 21v6M24 21v6"
        stroke="oklch(0.30 0.04 70)"
        strokeWidth="0.6"
      />
      <rect
        x="11"
        y="9"
        width="16"
        height="10"
        rx="1.5"
        fill="none"
        stroke="oklch(0.35 0.05 70)"
        strokeWidth="0.6"
      />
    </svg>
  );
}

// ============================================================
// Brand glyph
// ============================================================

function BrandMark({ brand }: { brand: CardBrand }) {
  if (brand === "visa") {
    return (
      <span
        className="font-serif text-base italic font-semibold tracking-wider text-white"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        VISA
      </span>
    );
  }
  if (brand === "mastercard") {
    return (
      <span className="relative inline-flex items-center" aria-hidden>
        <span className="size-5 rounded-full bg-[oklch(0.68_0.20_30)] mix-blend-screen" />
        <span className="-ml-2.5 size-5 rounded-full bg-[oklch(0.78_0.16_70)] mix-blend-screen" />
      </span>
    );
  }
  if (brand === "amex") {
    return (
      <span
        className="rounded-sm bg-white/95 px-1.5 py-0.5 font-sans text-[0.55rem] font-bold uppercase tracking-[0.18em] text-[oklch(0.32_0.08_250)]"
      >
        AMEX
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full bg-white/30",
      )}
    />
  );
}
