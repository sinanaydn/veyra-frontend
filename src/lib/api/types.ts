/**
 * Domain types — hand-written to mirror api-docs schemas.
 * Reference: IMPLEMENTATION.md §4.2 + SPECIFICATION.md §3.1
 *
 * If the backend evolves, update here first — every resource module and
 * query/mutation hook depends on these.
 */

// ============================================================
// Enums
// ============================================================

export type FuelType = "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID";
export type Transmission = "MANUAL" | "AUTOMATIC";
export type CarStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE";
/**
 * Per SPEC GAP-3 — backend response enum is the source of truth.
 * Some flows mention PENDING/CONFIRMED states; we accept all five.
 */
export type RentalStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type Role = "ADMIN" | "USER";

export const FUEL_TYPES: FuelType[] = [
  "GASOLINE",
  "DIESEL",
  "ELECTRIC",
  "HYBRID",
];
export const TRANSMISSIONS: Transmission[] = ["MANUAL", "AUTOMATIC"];
export const CAR_STATUSES: CarStatus[] = ["AVAILABLE", "RENTED", "MAINTENANCE"];
export const RENTAL_STATUSES: RentalStatus[] = [
  "PENDING",
  "CONFIRMED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
];
export const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
];

// ============================================================
// Auth
// ============================================================

export interface AuthResponse {
  token: string;
  expiresIn: number; // seconds
  refreshToken: string;
  refreshExpiresIn: number; // seconds
  role: Role;
  userId: number;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

/** Decoded session metadata stored in non-httpOnly `veyra_user` cookie. */
export interface SessionUser {
  userId: number;
  email: string;
  role: Role;
}

// ============================================================
// Brands
// ============================================================

export interface Brand {
  id: number;
  name: string;
  createdAt: string;
}

export interface CreateBrandRequest {
  name: string;
}

export interface UpdateBrandRequest {
  name: string;
}

// ============================================================
// Models
// ============================================================

export interface CarModel {
  id: number;
  name: string;
  brandId: number;
  brandName: string;
  createdAt: string;
}

export interface CreateCarModelRequest {
  name: string;
  brandId: number;
}

export interface UpdateCarModelRequest {
  name: string;
  brandId: number;
}

// ============================================================
// Cars
// ============================================================

export interface CarImage {
  id: number;
  carId: number;
  storageKey: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  displayOrder: number;
  primary: boolean;
}

export interface Car {
  id: number;
  modelId: number;
  modelName: string;
  brandId: number;
  brandName: string;
  year: number;
  doors: number;
  baggages: number;
  dailyPrice: number;
  fuelType: FuelType;
  transmission: Transmission;
  seats: number;
  color?: string;
  mileage?: number;
  description?: string;
  status: CarStatus;
  createdAt: string;
  images: CarImage[];
  primaryImageUrl?: string;
}

export interface CreateCarRequest {
  modelId: number;
  year: number;
  doors: number;
  baggages: number;
  seats: number;
  dailyPrice: number;
  fuelType: FuelType;
  transmission: Transmission;
  color?: string;
  mileage?: number;
  description?: string;
}

/**
 * Backend `UpdateCarRequest` requires: dailyPrice, fuelType, modelId,
 * status, transmission. The remaining fields are optional patches.
 */
export interface UpdateCarRequest {
  modelId: number;
  dailyPrice: number;
  fuelType: FuelType;
  transmission: Transmission;
  status: CarStatus;
  year?: number;
  doors?: number;
  baggages?: number;
  seats?: number;
  color?: string;
  mileage?: number;
  description?: string;
}

export interface CarFilter {
  brandId?: number;
  modelId?: number;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  available?: boolean;
}

// ============================================================
// Car Images (admin)
// ============================================================

export interface ReorderImageItem {
  imageId: number;
  displayOrder: number;
}

export interface ReorderImagesRequest {
  items: ReorderImageItem[];
}

// ============================================================
// Rentals
// ============================================================

export interface Rental {
  id: number;
  carId: number;
  userId: number;
  startDate: string; // ISO date (YYYY-MM-DD)
  endDate: string;
  totalPrice: number;
  status: RentalStatus;
  createdAt: string;
}

export interface CreateRentalRequest {
  carId: number;
  startDate: string; // ISO date
  endDate: string;
}

export interface RentalFilter {
  userId?: number;
  status?: RentalStatus;
  carId?: number;
}

// ============================================================
// Payments
// ============================================================

/**
 * Backend `PaymentResponse` does NOT carry `userId` — admin filter uses
 * `PaymentFilter.userId` query param but the response shape omits it.
 */
export interface Payment {
  id: number;
  rentalId: number;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface CreatePaymentRequest {
  rentalId: number;
}

export interface PaymentFilter {
  userId?: number;
  rentalId?: number;
  status?: PaymentStatus;
}

// ============================================================
// Users
// ============================================================

/**
 * Backend `UserResponse` does NOT include `role` — to display a user's
 * role (admin table) you must change role via PUT /admin/users/{id}/role
 * and refetch, or rely on the session cookie for the current user.
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangeRoleRequest {
  role: Role;
}

// ============================================================
// Pageable (Spring style)
// ============================================================

export interface Pageable {
  page?: number;
  size?: number;
  /** e.g. ['createdAt,desc', 'dailyPrice,asc'] */
  sort?: string[];
}

export const DEFAULT_PAGE_SIZE = 20;
