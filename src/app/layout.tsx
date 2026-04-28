import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { AppProviders } from "@/providers/AppProviders";
import { ThemeScript } from "@/providers/ThemeProvider";
import { t } from "@/messages/tr";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Veyra RentACar — Lüksü kirala. Anında yola çık.",
    template: "%s · Veyra RentACar",
  },
  description:
    "Premium araç filomuzda saniyeler içinde rezerve et, kapına teslim al.",
  applicationName: "Veyra RentACar",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0E14" },
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Must run before paint — sets `class="dark"` on <html> */}
        <ThemeScript />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground focus:shadow-lg"
        >
          {t.common.skipToContent}
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
