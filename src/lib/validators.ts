/**
 * Zod schemas — mirror backend validation rules byte-for-byte.
 * Reference: SPECIFICATION.md FR-AUTH-3, IMPLEMENTATION.md §6
 *
 * If the backend regex/length changes, update here first.
 * react-hook-form + @hookform/resolvers/zod consume these directly.
 */

import { z } from "zod";
import {
  FUEL_TYPES,
  TRANSMISSIONS,
  CAR_STATUSES,
  type FuelType,
  type Transmission,
} from "./api/types";

// ============================================================
// Reusable rules
// ============================================================

/** Backend rule — at least one lower, upper, digit, special char; 10–128 chars. */
export const passwordRule = z
  .string()
  .min(10, "Şifre en az 10 karakter olmalıdır.")
  .max(128, "Şifre en fazla 128 karakter olabilir.")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!.,?_\-]).+$/,
    "Şifre en az bir küçük harf, büyük harf, rakam ve özel karakter içermelidir.",
  );

/** Optional phone — empty string allowed; otherwise 10–15 chars of [0-9+()-\s]. */
export const phoneRule = z
  .string()
  .regex(/^$|^[0-9+()\-\s]{10,15}$/, "Geçerli bir telefon numarası girin.")
  .optional()
  .or(z.literal(""));

export const emailRule = z
  .string()
  .min(1, "E-posta zorunlu.")
  .email("Geçerli bir e-posta girin.")
  .max(255, "E-posta en fazla 255 karakter olabilir.");

// ============================================================
// Auth
// ============================================================

export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Şifre zorunlu."),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "Ad zorunlu.")
    .max(50, "Ad en fazla 50 karakter olabilir."),
  lastName: z
    .string()
    .min(1, "Soyad zorunlu.")
    .max(50, "Soyad en fazla 50 karakter olabilir."),
  email: emailRule,
  password: passwordRule,
  phone: phoneRule,
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

// ============================================================
// Cars (admin)
// ============================================================

const currentYear = new Date().getFullYear();

export const carFormSchema = z.object({
  // Transient UI-only — used for the brand→model cascade.
  // Not sent to the backend; we extract `modelId` only.
  brandId: z.coerce
    .number({ message: "Marka seçin." })
    .int()
    .positive("Marka seçin."),
  modelId: z.coerce
    .number({ message: "Model seçin." })
    .int()
    .positive("Model seçin."),
  // Backend min: 2000 — keep aligned to avoid 400 from server.
  year: z.coerce
    .number()
    .int()
    .min(2000, "Yıl 2000 veya sonrası olmalı.")
    .max(currentYear + 1, `Yıl ${currentYear + 1}'den büyük olamaz.`),
  doors: z.coerce.number().int().min(2).max(6),
  baggages: z.coerce.number().int().min(0).max(10),
  seats: z.coerce.number().int().min(1).max(9),
  dailyPrice: z.coerce
    .number()
    .positive("Günlük ücret 0'dan büyük olmalı.")
    .max(1_000_000, "Günlük ücret çok yüksek."),
  fuelType: z.enum(FUEL_TYPES as [FuelType, ...FuelType[]]),
  transmission: z.enum(TRANSMISSIONS as [Transmission, ...Transmission[]]),
  // Backend max: 50 chars
  color: z
    .string()
    .max(50, "Renk en fazla 50 karakter olabilir.")
    .optional()
    .or(z.literal("")),
  mileage: z.coerce
    .number()
    .int()
    .min(0)
    .max(2_000_000)
    .optional(),
  // Backend max: 1000 chars
  description: z
    .string()
    .max(1000, "Açıklama en fazla 1000 karakter olabilir.")
    .optional()
    .or(z.literal("")),
  status: z.enum(CAR_STATUSES).optional(),
});
export type CarFormValues = z.infer<typeof carFormSchema>;

// ============================================================
// Brands & Models (admin)
// ============================================================

// Backend: name min 2, max 50
export const brandFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Marka adı en az 2 karakter olmalı.")
    .max(50, "Marka adı en fazla 50 karakter olabilir."),
});
export type BrandFormValues = z.infer<typeof brandFormSchema>;

// Backend: name min 1, max 50
export const modelFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Model adı zorunlu.")
    .max(50, "Model adı en fazla 50 karakter olabilir."),
  brandId: z.coerce
    .number({ message: "Marka seçin." })
    .int()
    .positive("Marka seçin."),
});
export type ModelFormValues = z.infer<typeof modelFormSchema>;

// ============================================================
// Booking — date range
// ============================================================

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Geçersiz tarih formatı.");

export const rentalDateSchema = z
  .object({
    startDate: isoDate,
    endDate: isoDate,
  })
  .refine((v) => new Date(v.endDate) > new Date(v.startDate), {
    path: ["endDate"],
    message: "Bitiş tarihi başlangıçtan sonra olmalı.",
  })
  .refine(
    (v) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(v.startDate) >= today;
    },
    {
      path: ["startDate"],
      message: "Başlangıç tarihi geçmişte olamaz.",
    },
  );
export type RentalDateValues = z.infer<typeof rentalDateSchema>;

// ============================================================
// User update (admin)
// ============================================================

export const userUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: phoneRule,
});
export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;

// ============================================================
// Mock card form (cosmetic only — FR-PAY-2)
// ============================================================

export const mockCardSchema = z.object({
  number: z
    .string()
    .regex(/^\d{4} ?\d{4} ?\d{4} ?\d{4}$/, "16 haneli kart numarası girin."),
  name: z
    .string()
    .min(2, "Kart üzerindeki ad zorunlu.")
    .max(60, "En fazla 60 karakter."),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Son kullanım tarihi AA/YY formatında."),
  cvc: z.string().regex(/^\d{3,4}$/, "CVC 3 veya 4 haneli olmalı."),
});
export type MockCardFormValues = z.infer<typeof mockCardSchema>;
