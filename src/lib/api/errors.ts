/**
 * Error handling primitives.
 * Reference: IMPLEMENTATION.md §4.3
 *
 * Backend errorCodes are translated here. UI components should display
 * `apiError.tr` (Turkish copy) — never raw errorCode or `message`.
 */

/** errorCode → Turkish copy. Update when backend adds new codes. */
export const ERROR_TR: Record<string, string> = {
  // Auth
  INVALID_CREDENTIALS: "E-posta veya şifre hatalı.",
  ACCOUNT_LOCKED:
    "Hesabınız 5 başarısız denemenin ardından kilitlendi. Lütfen 30 dakika sonra tekrar deneyin.",
  EMAIL_ALREADY_EXISTS: "Bu e-posta adresi zaten kayıtlı.",
  USER_NOT_FOUND: "Kullanıcı bulunamadı.",
  TOKEN_INVALID: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
  TOKEN_EXPIRED: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
  REFRESH_TOKEN_INVALID:
    "Oturumunuz doğrulanamadı. Lütfen tekrar giriş yapın.",
  ACCESS_DENIED: "Bu işlem için yetkiniz yok.",

  // Validation & rate limit
  VALIDATION_ERROR: "Lütfen formdaki hataları düzeltin.",
  RATE_LIMIT_EXCEEDED:
    "Çok fazla istek gönderdiniz. Lütfen bir dakika bekleyin.",

  // Domain — rentals
  RENTAL_DATE_CONFLICT:
    "Seçtiğiniz tarihler bu araç için dolu. Başka tarihler deneyin.",
  RENTAL_DATE_INVALID: "Geçersiz tarih aralığı.",
  RENTAL_NOT_FOUND: "Kiralama bulunamadı.",
  RENTAL_ALREADY_CANCELLED: "Bu kiralama zaten iptal edilmiş.",
  RENTAL_CANNOT_CANCEL: "Bu kiralama iptal edilemez.",
  RENTAL_CANNOT_COMPLETE: "Bu kiralama tamamlanamaz.",

  // Domain — payments
  PAYMENT_ALREADY_COMPLETED: "Bu ödeme zaten tamamlanmış.",
  PAYMENT_FAILED: "Ödeme alınamadı. Lütfen tekrar deneyin.",
  PAYMENT_NOT_FOUND: "Ödeme bulunamadı.",

  // Domain — cars / brands / models
  CAR_NOT_FOUND: "Araç bulunamadı.",
  CAR_NOT_AVAILABLE: "Bu araç şu anda kiralanabilir değil.",
  BRAND_NOT_FOUND: "Marka bulunamadı.",
  BRAND_NAME_EXISTS: "Bu isimde bir marka zaten var.",
  MODEL_NOT_FOUND: "Model bulunamadı.",
  MODEL_NAME_EXISTS: "Bu marka altında aynı isimde bir model zaten var.",

  // Domain — car images
  IMAGE_TOO_LARGE: "Görsel 5 MB'tan büyük olamaz.",
  IMAGE_TYPE_INVALID:
    "Görsel JPEG, PNG veya WebP formatında olmalıdır.",
  IMAGE_LIMIT_REACHED: "Bir araç için en fazla 10 görsel yükleyebilirsiniz.",
  IMAGE_NOT_FOUND: "Görsel bulunamadı.",

  // Generic
  INTERNAL_SERVER_ERROR: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
  BAD_REQUEST: "Geçersiz istek.",
  NOT_FOUND: "Aradığınız kaynak bulunamadı.",
};

/**
 * Thrown by axios response interceptor (`src/lib/api/client.ts`).
 * Components should `try/catch` and show `err.tr` to the user.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public errorCode?: string,
    public data?: unknown,
    message?: string,
  ) {
    super(message ?? errorCode ?? "API Error");
    this.name = "ApiError";
  }

  /** Localized Turkish message for UI. */
  get tr(): string {
    if (this.errorCode && ERROR_TR[this.errorCode]) {
      return ERROR_TR[this.errorCode];
    }
    return this.message || "Bir hata oluştu.";
  }

  /** True if status is 4xx (client error). */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** True if status is 5xx (server error). */
  get isServerError(): boolean {
    return this.status >= 500;
  }

  /** True if response carried a field-level validation map. */
  get hasFieldErrors(): boolean {
    return (
      this.errorCode === "VALIDATION_ERROR" &&
      typeof this.data === "object" &&
      this.data !== null
    );
  }

  /** Field-level validation errors as a Record<field, message[]>. */
  get fieldErrors(): Record<string, string[]> {
    if (!this.hasFieldErrors) return {};
    return this.data as Record<string, string[]>;
  }
}

/** Type guard — discriminates ApiError from generic Error. */
export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
