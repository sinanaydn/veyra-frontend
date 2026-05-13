# Veyra RentACar — Frontend

Premium araç kiralama platformu için Next.js 16 + React 19 frontend uygulaması. Spring Boot REST API'sini tüketir, üç ayrı yüzeyi tek bir uygulamadan servis eder:

1. **Public katalog** — keşif, filtre, araç detay (auth gerekmez)
2. **Müşteri hesabı** — kayıt, rezervasyon, ödeme, profil yönetimi (ROLE_USER)
3. **Yönetim paneli** — marka/model/araç/görsel/kiralama/kullanıcı yönetimi (ROLE_ADMIN)

Tasarım çıtası: Apple / Stripe / Airbnb / Linear. Premium dark-first, mobile-first responsive, WCAG 2.1 AA erişilebilir, Türkçe.

---

## Hızlı başlangıç

```bash
# 1. Bağımlılıklar
pnpm install

# 2. Environment
cp .env.example .env.local
# .env.local içindeki BACKEND_URL'in çalışan Spring backend'i göstermesine emin ol

# 3. Backend (ayrı terminal) — :8080
# 4. Frontend — :3000
pnpm dev
```

Tarayıcıda http://localhost:3000

### Scripts

| Komut | İş |
|---|---|
| `pnpm dev` | Development server (Turbopack, hot reload) |
| `pnpm build` | Production build |
| `pnpm start` | Production server (`pnpm build` sonrası) |
| `pnpm lint` | ESLint kontrolü |
| `npx tsc --noEmit` | TypeScript type check |

---

## Environment variables

| Anahtar | Zorunlu | Açıklama |
|---|---|---|
| `BACKEND_URL` | ✓ | Spring backend base URL — server-side only, browser'a sızmaz |
| `NEXT_PUBLIC_APP_NAME` | — | Marka adı override (opsiyonel) |

`BACKEND_URL` **server-side**: tüm browser çağrıları `/api/proxy/*` üzerinden geçer, JWT httpOnly cookie'de tutulur.

---

## Mimari

### Stack

| Katman | Seçim |
|---|---|
| Framework | **Next.js 16** (App Router) + React 19 |
| Dil | TypeScript strict |
| Stil | **Tailwind v4** + **shadcn/ui** (Base UI primitives) |
| Server state | **TanStack Query v5** |
| Client state | **Zustand** |
| URL state | **nuqs** (catalog filtreleri) |
| Form | **react-hook-form** + **zod** |
| HTTP | **Axios** (refresh-queue interceptor) |
| Tablolar | **TanStack Table v8** |
| Drag & drop | **dnd-kit** (görsel yeniden sıralama) |
| Toast | **sonner** |
| İkon | **lucide-react** |
| Tarih | **date-fns** + `tr` locale |
| Animasyon | **Framer Motion** (motion-reduce farkında) |

### Klasör yapısı

```
src/
├─ app/
│  ├─ (marketing)/        # Landing, /cars, /brands — public
│  ├─ (auth)/             # /login, /register
│  ├─ (account)/account/  # Müşteri hesabı (auth required)
│  ├─ (booking)/          # /checkout, /confirmation (auth required)
│  ├─ (admin)/admin/      # Yönetim paneli (ADMIN required)
│  ├─ api/
│  │  ├─ auth/{login,register,refresh,logout}/
│  │  └─ proxy/[...path]/  # BFF — JWT'yi cookie'den okur, Spring'e iletir
│  ├─ layout.tsx, error.tsx, not-found.tsx, globals.css
├─ components/
│  ├─ ui/                 # shadcn primitives
│  ├─ layout/             # Header, Footer, AccountShell, AdminShell, ThemeToggle
│  ├─ marketing/          # Hero, SearchBar, FeaturedCars, BrandStrip
│  ├─ cars/               # CarCard, CarGrid, CarGallery, CarFilterPanel
│  ├─ booking/            # BookingWidget, DateRangePicker, MockCardForm
│  ├─ account/            # RentalCard, PaymentReceipt, RentalTimeline
│  ├─ admin/              # DataTable, ConfirmDialog, ImageDropzone, CarForm
│  ├─ auth/               # AuthShell, FloatingField, PasswordMeter
│  └─ common/             # SegmentError, SafeImage, Pagination
├─ lib/
│  ├─ api/                # envelope, types, errors, client, server, resources/*
│  ├─ queries/            # useCars, useRentals, useUsers, … (TanStack Query)
│  ├─ mutations/          # useCreateBrand, usePay, useImageMutations, …
│  ├─ rbac.ts             # readSession, requireRole (server)
│  ├─ format.ts           # currencyTRY, formatDate, daysBetween
│  ├─ validators.ts       # zod schemas (login, register, carForm, …)
├─ store/                 # Zustand stores (auth)
├─ messages/tr.ts         # Tüm UI metinleri (NFR-I18N-1)
├─ providers/             # QueryProvider, ThemeProvider, AppProviders
├─ hooks/                 # useDebounce, useIdempotencyKey, useMediaQuery
└─ middleware.ts          # Edge RBAC guards
```

### Auth akışı

```
Browser                 Next.js BFF                    Spring API
   │   POST /api/auth/login {email, pw}                    │
   │ ────────────────────► │                               │
   │                       │ POST /api/v1/auth/login       │
   │                       │ ────────────────────────────► │
   │                       │ ◄─────────── AuthResponse     │
   │                       │ Set-Cookie: veyra_at (httpOnly)│
   │                       │ Set-Cookie: veyra_rt (httpOnly)│
   │                       │ Set-Cookie: veyra_user (role) │
   │ ◄──── 200 OK          │                               │
   │                                                       │
   │ GET /api/proxy/cars  (X-Veyra-Csrf: 1)                │
   │ ────────────────────► │ + Authorization: Bearer ...   │
   │                       │ ────────────────────────────► │
   │ ◄────────── data ──── │ ◄────────────── data ──────── │
```

- JWT **browser'a hiç dokunmaz** — sadece httpOnly cookie + proxy
- 401 + `TOKEN_INVALID` → axios interceptor tek seferlik refresh dener; eşzamanlı 401'ler tek promise'e kuyrukta bekler
- CSRF koruması: SameSite=Lax cookie + custom `X-Veyra-Csrf: 1` header (cross-origin attacker preflight olmadan ekleyemez)
- Edge middleware `/admin/*` için ROLE_ADMIN, diğer korumalı route'lar için login kontrolü yapar

### Veri akışı

```
Page (Server Component)
  └─ Resource fetch via serverApi (SSR/RSC)

Page (Client Component)
  └─ useQuery / useMutation
       └─ Resource module (axios http instance)
            └─ /api/proxy/...  (BFF)
                 └─ Spring backend
```

- Tüm endpoint'ler `src/lib/api/resources/*.ts` altında tek dosya = tek resource
- Tüm sorgu key'leri `src/lib/queries/keys.ts` factory'sinde tanımlı
- Mutation'lar optimistic update kullanır (rental cancel, image reorder/setPrimary/delete)

---

## Test edebileceğin senaryolar

| Akış | Adım |
|---|---|
| **Public katalog** | `/cars` → filtre uygula → URL `?brandId=…` ile sync | back button restore çalışır |
| **Booking** | `/cars/[id]` → tarih seç → "Kirala" → `/checkout` → mock kart → `/confirmation` → CONFIRMED |
| **Idempotency** | Aynı `/checkout` sayfasından iki kez gönder → backend aynı payment'ı döndürür (UUID memoize) |
| **Admin görsel** | `/admin/cars/[id]/images` → 3 görsel yükle → sürükleyerek sırala → kapak seç → birini sil |
| **Self-protect** | Admin kendini demote/delete edemez (`/admin/users` UI engeller) |
| **Theme** | Sağ üst toggle → dark/light geçiş → reload → flash yok |

---

## Backend bağımlılığı

Bu uygulama **standalone değildir** — çalışan bir Spring Boot backend gerektirir:

- Base URL: `BACKEND_URL` env (varsayılan `http://localhost:8080`)
- API envelope: `ApiResult<T> { success, status, message, errorCode, data, timestamp }`
- Endpoint listesi: [docs/SPECIFICATION.md](docs/SPECIFICATION.md) §3
- Görsel servisi: backend `CarImage.url` alanında MinIO/S3 **presigned URL** dönmeli (TTL ~60 dk). Detaylar için backend ekibine danış.

---

## Bilinen sınırlamalar

| GAP | Detay |
|---|---|
| Müşteri self-update yok | Backend `PUT /users/{id}` admin-only — settings sayfası read-only, "destek ekibine ulaş" notu gösterir |
| Email verification yok | Kayıt sonrası direkt giriş (backend desteği yok) |
| Password reset yok | "Şifremi unuttum" linki "Yakında" tooltip'i gösterir |
| Tek dil / tek para birimi | Türkçe + TRY hard-coded |

---

## Geliştirme notları

- **Strings:** Tüm UI metinleri `src/messages/tr.ts`'de — component'lerde literal string yasak (NFR-I18N-1)
- **Yeni endpoint eklerken:**
  1. `src/lib/api/types.ts` — istek/yanıt tipleri
  2. `src/lib/api/resources/<domain>.ts` — fonksiyon
  3. `src/lib/queries/keys.ts` — query key
  4. `src/lib/queries/use<X>.ts` — hook
  5. (mutation ise) `src/lib/mutations/use<X>.ts`
- **Yeni form:** `src/lib/validators.ts`'de zod şeması tanımla, `useForm` + `zodResolver`
- **Yeni hata kodu:** `src/lib/api/errors.ts` `ERROR_TR` haritasına ekle

---

## Dokümantasyon

- [docs/SPECIFICATION.md](docs/SPECIFICATION.md) — Ne (audience, surfaces, behaviors)
- [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) — Nasıl (architecture, code patterns)
- [docs/TASKS.md](docs/TASKS.md) — İş listesi (T-001 → T-105)
- [docs/BRANDING.md](docs/BRANDING.md) — Marka kimliği, type, renk, motion
- [docs/PROMPT.md](docs/PROMPT.md) — Tek seferde build için Claude Code prompt'u
