/**
 * Editorial drive panel — the cinematic left column on /login & /register.
 *
 * Composition:
 *   • Decorative grid pattern + accent glow (atmosphere)
 *   • Mono eyebrow tag stamp
 *   • Display headline (tracking-[-0.045em], two-tone)
 *   • Pull quote (italic? — no, kept upright per BRANDING §14)
 *   • Stat ticker (mono numerals)
 *   • Footer meta strip
 *
 * Hidden on mobile (form gets full attention).
 */

import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { t } from "@/messages/tr";

export function AuthAside() {
  return (
    <aside
      aria-hidden
      className="relative isolate hidden overflow-hidden border-r border-border/60 bg-surface/40 lg:block"
    >
      {/* Accent glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-160px] top-[-200px] h-[520px] w-[520px] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-accent/8 blur-3xl" />
      </div>

      {/* Decorative grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--color-border) 100%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--color-border) 100%, transparent) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse at 30% 30%, black 30%, transparent 75%)",
        }}
      />

      {/* Diagonal hairline accent */}
      <div className="pointer-events-none absolute left-0 right-0 top-[42%] h-px -rotate-[1.5deg] bg-gradient-to-r from-transparent via-accent/35 to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
        {/* Top — brand + meta */}
        <div className="flex items-start justify-between">
          <Logo />
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t.auth.asideEyebrow}
          </span>
        </div>

        {/* Middle — display headline + supporting */}
        <div className="max-w-lg space-y-8">
          <h2 className="text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.045em] xl:text-[3.2rem]">
            {t.auth.asideHeadline}
            <br />
            <span className="text-muted-foreground">
              {t.auth.asideHeadlineDim}
            </span>
          </h2>

          <figure className="border-l-2 border-accent/60 pl-5">
            <blockquote className="text-[0.95rem] leading-relaxed text-muted-foreground">
              {t.auth.asideQuote}
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-px w-6 bg-border" />
              <span>Auto Trader · 2026</span>
            </figcaption>
          </figure>
        </div>

        {/* Stats + footer meta */}
        <div className="space-y-8">
          <dl className="grid grid-cols-3 gap-6 border-t border-border/50 pt-8">
            {[
              { v: "120+", l: t.auth.asideStatFleet },
              { v: "24", l: t.auth.asideStatBrands },
              { v: "9", l: t.auth.asideStatCities },
            ].map((s) => (
              <div key={s.l} className="flex flex-col gap-1.5">
                <dt
                  className="font-mono text-2xl font-semibold tracking-tight text-foreground"
                  data-numeric
                >
                  {s.v}
                </dt>
                <dd className="text-[0.7rem] uppercase tracking-[0.14em] leading-snug text-muted-foreground">
                  {s.l}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="font-mono">{t.auth.asideMeta}</span>
            <span className="inline-flex items-center gap-1">
              veyra.com
              <ArrowUpRight className="size-3" aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
