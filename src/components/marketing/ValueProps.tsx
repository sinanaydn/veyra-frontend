/**
 * Three-cell value proposition grid.
 * Mono "01/02/03" eyebrow, accent-colored, restrained Apple-ish layout.
 */

import { CalendarCheck2, ShieldCheck, Sparkles } from "lucide-react";

const PROPS = [
  {
    n: "01",
    icon: CalendarCheck2,
    h: "Anında rezerve",
    p: "Saniyeler içinde tarih seç, fiyatı gör, kirala. Bekleme yok, sürpriz yok.",
  },
  {
    n: "02",
    icon: Sparkles,
    h: "Premium filo",
    p: "Otomatik vites, düşük kilometre, periyodik bakım garantisi. Her araç kendi sınıfının zirvesinde.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    h: "Esnek iptal",
    p: "Planın değişirse tek tıkla iptal et. Tutar otomatik iade — sorgu yok, ekstra adım yok.",
  },
] as const;

export function ValueProps() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-28">
      <header className="mb-12 max-w-2xl">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          Neden Veyra
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Detayları biz halledelim,
          <br className="hidden md:block" />
          <span className="text-muted-foreground">sen sürüşe odaklan.</span>
        </h2>
      </header>

      <ul className="grid gap-px overflow-hidden rounded-2xl bg-border/60 md:grid-cols-3">
        {PROPS.map(({ n, icon: Icon, h, p }) => (
          <li
            key={n}
            className="group/prop flex flex-col bg-background p-8 transition-colors hover:bg-surface"
          >
            <div className="flex items-center justify-between">
              <span
                className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent"
                data-numeric
              >
                {n}
              </span>
              <Icon
                className="size-5 text-muted-foreground/60 transition-colors group-hover/prop:text-accent"
                aria-hidden
              />
            </div>
            <h3 className="mt-12 text-xl font-semibold tracking-tight">{h}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {p}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
