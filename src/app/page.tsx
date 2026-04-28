import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header, HeaderSpacer } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { t } from "@/messages/tr";

/**
 * Placeholder landing — will be replaced by full Hero / SearchBar /
 * FeaturedCars / BrandStrip in Phase 5 (T-050). For now this verifies
 * the layout shell wiring (Header sticky + glass on scroll, Footer
 * hairline accent, theme toggle, mobile nav).
 */
export default function HomePage() {
  return (
    <>
      <Header />
      <HeaderSpacer />

      <main id="main" className="relative">
        {/* Decorative accent glow — BRANDING.md §3.4 (subtle, low opacity) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden"
        >
          <div className="absolute left-1/2 top-[-200px] h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <section className="mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32 lg:px-8 lg:py-40">
          <p
            className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground"
            data-numeric
          >
            VEYRA · 2026
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-6xl lg:text-7xl">
            {t.cars.heroHeadline}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t.cars.heroSubhead}
          </p>
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
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              Markalar
            </Link>
          </div>
        </section>

        {/* Spacer to verify scroll behavior */}
        <section className="mx-auto max-w-7xl px-4 pb-32 md:px-6 lg:px-8">
          <div className="grid gap-px overflow-hidden rounded-2xl bg-border md:grid-cols-3">
            {[
              {
                k: "01",
                h: "Anında rezerve",
                p: "Saniyeler içinde tarih seç, fiyatı gör, kirala.",
              },
              {
                k: "02",
                h: "Premium filo",
                p: "Otomatik vites, düşük km, düzenli bakım garantisi.",
              },
              {
                k: "03",
                h: "Esnek iptal",
                p: "Planın değişirse tek tıkla iptal et, ücret iadesi otomatik.",
              },
            ].map((x) => (
              <div key={x.k} className="bg-background p-8">
                <p
                  className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent"
                  data-numeric
                >
                  {x.k}
                </p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  {x.h}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {x.p}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
