/**
 * Landing hero — editorial typography, accent glow, mono eyebrow.
 * Reference: BRANDING.md §3.4, §11
 */

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { t } from "@/messages/tr";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px]"
      >
        <div className="absolute left-1/2 top-[-260px] h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-accent/12 blur-3xl" />
        <div className="absolute right-[-120px] top-[100px] h-[400px] w-[400px] rounded-full bg-accent/8 blur-3xl" />
      </div>

      {/* Decorative grid (right side, subtle) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-1/3 lg:block"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--color-border) 100%, transparent) 1px, transparent 1px)",
          backgroundSize: "80px 100%",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 40%, black 90%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 md:px-6 md:pb-24 md:pt-28 lg:px-8 lg:pb-32 lg:pt-36">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 backdrop-blur">
          <Sparkles className="size-3 text-accent" aria-hidden />
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            Premium Araç Kiralama · İstanbul
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] md:text-6xl lg:text-[5.5rem]">
          Lüksü kirala.
          <br />
          <span className="text-muted-foreground">Anında yola çık.</span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {t.cars.heroSubhead}
        </p>

        {/* Inline stats — premium feel without being shouty */}
        <dl className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
          {[
            { v: "120+", l: "araç" },
            { v: "24", l: "marka" },
            { v: "4.9", l: "müşteri puanı" },
          ].map((s) => (
            <div key={s.l} className="flex items-baseline gap-2">
              <dt
                className="font-mono text-2xl font-semibold tracking-tight text-foreground"
                data-numeric
              >
                {s.v}
              </dt>
              <dd className="text-xs uppercase tracking-widest text-muted-foreground">
                {s.l}
              </dd>
            </div>
          ))}
        </dl>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/cars"
            className="group/cta inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110 active:translate-y-px"
          >
            {t.cars.heroCta}
            <ArrowRight
              className="size-4 transition-transform group-hover/cta:translate-x-0.5"
              aria-hidden
            />
          </Link>
          <Link
            href="/brands"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Markalar
          </Link>
        </div>
      </div>
    </section>
  );
}
