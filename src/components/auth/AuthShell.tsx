/**
 * Editorial split shell for /login and /register.
 *
 * Layout:
 *   • Mobile: form-only, 100svh, top brand band, compact footer
 *   • lg+: 2 cols — drive panel left (AuthAside) + form panel right
 *
 * The form children are rendered inside an asymmetric "card-on-canvas"
 * panel: no hard card edges, but a subtle inner accent glow & a hairline
 * top accent for compositional weight.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthAside } from "./AuthAside";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { t } from "@/messages/tr";

interface AuthShellProps {
  /** Eyebrow stamp — e.g. "01 — GİRİŞ" */
  eyebrow?: string;
  title: string;
  subtitle: string;
  /** Footer link — e.g. login ↔ register */
  footerPrompt: string;
  footerLinkText: string;
  footerLinkHref: string;
  children: React.ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  footerPrompt,
  footerLinkText,
  footerLinkHref,
  children,
}: AuthShellProps) {
  return (
    <div className="relative grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
      <AuthAside />

      {/* Form panel */}
      <main
        id="main"
        className="relative flex min-h-svh flex-col bg-background"
      >
        {/* Mobile-only top band — chevron + Veyra + theme toggle */}
        <div className="flex items-center justify-between border-b border-border/50 bg-surface/30 px-4 py-3 lg:hidden">
          <Logo />
          <ThemeToggle />
        </div>

        {/* Desktop top bar — back link + theme toggle */}
        <div className="hidden items-center justify-between px-10 py-6 xl:px-14 lg:flex">
          <Link
            href="/"
            className="group/back inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft
              className="size-3.5 transition-transform group-hover/back:-translate-x-0.5"
              aria-hidden
            />
            {t.common.back}
          </Link>
          <ThemeToggle />
        </div>

        {/* Form column */}
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            {/* Eyebrow */}
            {eyebrow && (
              <div className="mb-6 inline-flex items-center gap-2.5">
                <span className="h-px w-6 bg-accent/70" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {eyebrow}
                </span>
              </div>
            )}

            {/* Headline */}
            <h1 className="text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[2.4rem]">
              {title}
            </h1>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
              {subtitle}
            </p>

            {/* Form slot */}
            <div className="mt-9">{children}</div>

            {/* Switch link */}
            <p className="mt-8 text-center text-[0.88rem] text-muted-foreground">
              {footerPrompt}{" "}
              <Link
                href={footerLinkHref}
                className="relative font-medium text-foreground transition-colors hover:text-accent"
              >
                {footerLinkText}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-100 bg-accent/70 transition-transform" />
              </Link>
            </p>
          </div>
        </div>

        {/* Page footer — locale stamp */}
        <footer className="border-t border-border/50 px-5 py-4 sm:px-8 lg:px-12 xl:px-20">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            © 2026 Veyra · TR
          </p>
        </footer>
      </main>
    </div>
  );
}
