/**
 * Marketing footer.
 * Reference: TASKS.md T-041, BRANDING.md §11
 *
 * Editorial layout — large wordmark, tight columns, mono section heads,
 * top hairline border. Server component (no interactivity).
 */

import Link from "next/link";
import { Logo } from "./Logo";
import { t } from "@/messages/tr";

interface FooterLink {
  href: string;
  label: string;
}

interface FooterColumn {
  heading: string;
  links: ReadonlyArray<FooterLink>;
}

const COLUMNS: ReadonlyArray<FooterColumn> = [
  {
    heading: "Keşfet",
    links: [
      { href: "/cars", label: "Araçlar" },
      { href: "/brands", label: "Markalar" },
    ],
  },
  {
    heading: "Hesap",
    links: [
      { href: "/login", label: "Giriş Yap" },
      { href: "/register", label: "Kayıt Ol" },
      { href: "/account/rentals", label: "Kiralamalarım" },
    ],
  },
  {
    heading: "Destek",
    links: [
      { href: "#", label: "Yardım Merkezi" },
      { href: "#", label: "İletişim" },
      { href: "#", label: "SSS" },
    ],
  },
  {
    heading: "Yasal",
    links: [
      { href: "#", label: "Gizlilik" },
      { href: "#", label: "Kullanım Koşulları" },
      { href: "#", label: "KVKK" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-border/60 bg-background">
      {/* Subtle top accent line — decorative gradient hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-12">
          {/* Brand block */}
          <div className="col-span-2 md:col-span-4">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t.cars.heroSubhead}
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading} className="md:col-span-2">
              <h3 className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {col.heading}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/85 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col gap-3 border-t border-border/60 pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            <span
              className="font-mono tracking-tight"
              data-numeric
            >
              © {year}
            </span>{" "}
            <span className="ml-1">{t.common.appName}</span>
            <span className="mx-2 text-border">·</span>
            <span>Tüm hakları saklıdır.</span>
          </p>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">
            İstanbul · Türkiye
          </p>
        </div>
      </div>
    </footer>
  );
}
