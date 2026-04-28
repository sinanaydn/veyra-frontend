/**
 * Formatting helpers — currency, dates, durations.
 * Reference: SPECIFICATION.md FR-X-5, FR-X-6
 *
 * Every price and date in the UI must go through these.
 * Locale is hardcoded to tr-TR (single-locale app, NFR-I18N-1).
 */

import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  parseISO,
} from "date-fns";
import { tr } from "date-fns/locale";

// ============================================================
// Currency
// ============================================================

const tryFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const tryFormatterFractional = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a TRY amount. Whole numbers by default. Pass `{ fractional: true }` for kuruş. */
export function currencyTRY(
  amount: number | null | undefined,
  opts: { fractional?: boolean } = {},
): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  const f = opts.fractional ? tryFormatterFractional : tryFormatter;
  return f.format(amount);
}

const numberFormatter = new Intl.NumberFormat("tr-TR");

/** Format a plain number (e.g. mileage, count) with TR thousands separator. */
export function formatNumber(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return numberFormatter.format(n);
}

// ============================================================
// Dates
// ============================================================

/** Accepts ISO string, Date, or null. Returns a Date or null. */
function toDate(input: string | Date | null | undefined): Date | null {
  if (input == null) return null;
  if (input instanceof Date) return input;
  const parsed = parseISO(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** "12 Haziran 2024" */
export function formatDate(input: string | Date | null | undefined): string {
  const d = toDate(input);
  return d ? format(d, "d MMMM yyyy", { locale: tr }) : "—";
}

/** "12 Haziran 2024, 14:32" */
export function formatDateTime(
  input: string | Date | null | undefined,
): string {
  const d = toDate(input);
  return d ? format(d, "d MMMM yyyy, HH:mm", { locale: tr }) : "—";
}

/** "12.06.2024" — compact, table-friendly */
export function formatDateShort(
  input: string | Date | null | undefined,
): string {
  const d = toDate(input);
  return d ? format(d, "dd.MM.yyyy", { locale: tr }) : "—";
}

/** ISO date "2024-06-12" — server-bound payloads */
export function toIsoDate(input: Date): string {
  return format(input, "yyyy-MM-dd");
}

/** "12 Haz 2024 – 18 Haz 2024" or "12–18 Haziran 2024" if same month */
export function formatDateRange(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
): string {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return "—";
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${format(s, "d", { locale: tr })}–${format(e, "d MMMM yyyy", { locale: tr })}`;
  }
  if (s.getFullYear() === e.getFullYear()) {
    return `${format(s, "d MMM", { locale: tr })} – ${format(e, "d MMM yyyy", { locale: tr })}`;
  }
  return `${format(s, "d MMM yyyy", { locale: tr })} – ${format(e, "d MMM yyyy", { locale: tr })}`;
}

/** Inclusive day count, min 1. Used by booking widget price math (IMPL §4.11). */
export function daysBetween(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
): number {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return 0;
  return Math.max(1, differenceInCalendarDays(e, s));
}

/** "3 dakika önce", "2 saat sonra" */
export function formatRelative(
  input: string | Date | null | undefined,
): string {
  const d = toDate(input);
  if (!d) return "—";
  return formatDistanceToNow(d, { addSuffix: true, locale: tr });
}

// ============================================================
// Misc
// ============================================================

/** "5 MB" — for file size displays in image dropzone. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
