# Claude Code — Single-Shot Build Prompt: Veyra RentACar Frontend

> Paste this prompt into a fresh Claude Code session in `C:\Veyra-RentACar\veyra-frontend\` to build the entire frontend in one go. Self-contained: every constraint, schema, code pattern, and acceptance check inlined.

---

## ROLE

You are a **senior frontend architect + product designer + frontend engineer** building the production frontend for **Veyra RentACar**, a Turkish-market premium car-rental platform. Quality bar: **Apple / Stripe / Airbnb / Linear**. You will create a Next.js 15 application that consumes a finished Spring Boot REST API.

## NON-NEGOTIABLE GROUND RULES

1. **The backend `api-docs.json` (summarized below) is the only source of truth.** Never invent endpoints, fields, error codes, or business rules.
2. **Tokens never live in client storage.** Auth flows through a Next.js BFF that stores JWTs in httpOnly cookies.
3. **Mobile-first responsive.** Every screen designed at 360 px first, then scaled up.
4. **WCAG 2.1 AA accessibility.** Use Radix primitives, focus rings, color-contrast paired with icons/text.
5. **Turkish-only copy.** All UI strings centralized in `src/messages/tr.ts`. No hardcoded English.
6. **Premium visual language.** Dark-first navy + electric-blue accent. Linear/Vercel adjacency, not generic SaaS.
7. **No filler.** Every component has a job; no decorative cruft.

## STACK (LOCKED)

- **Next.js 15.x** App Router + React 19, TypeScript strict
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives)
- **TanStack Query v5** (server state) + **Zustand** (client state) + **nuqs** (URL state)
- **Axios** with refresh-queue interceptor
- **react-hook-form** + **zod**
- **Framer Motion** (balanced — `prefers-reduced-motion` aware)
- **TanStack Table v8** (admin tables)
- **dnd-kit** (image reorder)
- **sonner** (toasts), **lucide-react** (icons), **date-fns** (`tr` locale), **uuid** (idempotency)

## BACKEND CONTRACT (DIGEST)

Base: `http://localhost:8080`. Envelope: `ApiResult<T> { success, status, message, errorCode, data, timestamp }`.

### Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/v1/auth/register` | public | rate 5/min; `RegisterRequest` |
| POST | `/api/v1/auth/login` | public | rate 5/min; 5 fails → `ACCOUNT_LOCKED` |
| POST | `/api/v1/auth/refresh` | public | `{refreshToken}` |
| POST | `/api/v1/auth/logout` | public | `{refreshToken}` |
| GET | `/api/v1/brands` | public | rate 60/min, cached |
| GET | `/api/v1/brands/{id}` | public | |
| POST/PUT/DELETE | `/api/v1/brands**` | ADMIN | |
| GET | `/api/v1/models?brandId=` | public | |
| GET | `/api/v1/models/{id}` | public | |
| POST/PUT/DELETE | `/api/v1/models**` | ADMIN | |
| GET | `/api/v1/cars` | public | flat filter+page; rate 60/min |
| GET | `/api/v1/cars/{id}` | public | includes images |
| POST/PUT/DELETE | `/api/v1/cars**` | ADMIN | |
| GET | `/api/v1/cars/{carId}/images` | public | |
| POST | `/api/v1/cars/{carId}/images` | ADMIN | multipart `file`, max 5 MB, jpeg/png/webp, max 10/car |
| PUT | `/api/v1/cars/{carId}/images/reorder` | ADMIN | `{items:[{imageId,displayOrder}]}` |
| PUT | `/api/v1/cars/{carId}/images/{imageId}/primary` | ADMIN | |
| DELETE | `/api/v1/cars/{carId}/images/{imageId}` | ADMIN | |
| GET | `/api/v1/rentals` | ADMIN | `?userId=` filter |
| POST | `/api/v1/rentals` | auth | 422 `RENTAL_DATE_CONFLICT` possible |
| GET | `/api/v1/rentals/my` | auth | paged |
| GET | `/api/v1/rentals/{id}` | auth | owner or admin |
| POST | `/api/v1/rentals/{id}/cancel` | auth | |
| POST | `/api/v1/rentals/{id}/complete` | ADMIN | |
| GET | `/api/v1/payments` | ADMIN | `?userId=` |
| POST | `/api/v1/payments` | auth | header `X-Idempotency-Key` (UUID) |
| GET | `/api/v1/payments/my` | auth | paged |
| GET | `/api/v1/payments/{id}` | auth | owner or admin |
| GET | `/api/v1/users` | ADMIN | paged |
| GET/PUT/DELETE | `/api/v1/users/{id}` | ADMIN | |
| DELETE | `/api/v1/users/me` | auth | |
| PUT | `/api/v1/admin/users/{userId}/role` | ADMIN | `{role:"ADMIN"\|"USER"}` |

### Critical types (TypeScript)

```ts
export type FuelType = 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
export type Transmission = 'MANUAL' | 'AUTOMATIC';
export type CarStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
export type RentalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PENDING' | 'CONFIRMED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type Role = 'ADMIN' | 'USER';

export interface ApiResult<T> { success: boolean; status: number; message?: string; errorCode?: string; data: T; timestamp: string; }
export interface PageResponse<T> { content: T[]; pageNumber: number; pageSize: number; totalElements: number; totalPages: number; first: boolean; last: boolean; }

export interface Brand { id: number; name: string; createdAt: string; }
export interface CarModel { id: number; name: string; brandId: number; brandName: string; createdAt: string; }
export interface CarImage { id: number; carId: number; storageKey: string; url: string; contentType: string; sizeBytes: number; displayOrder: number; primary: boolean; }
export interface Car {
  id: number; modelId: number; modelName: string; brandId: number; brandName: string;
  year: number; doors: number; baggages: number; dailyPrice: number;
  fuelType: FuelType; transmission: Transmission; seats: number;
  color?: string; mileage?: number; description?: string; status: CarStatus;
  createdAt: string; images: CarImage[]; primaryImageUrl?: string;
}
export interface CarFilter { brandId?: number; modelId?: number; minPrice?: number; maxPrice?: number; minYear?: number; maxYear?: number; fuelType?: FuelType; transmission?: Transmission; available?: boolean; }
export interface Pageable { page?: number; size?: number; sort?: string[]; }

export interface AuthResponse { token: string; expiresIn: number; refreshToken: string; refreshExpiresIn: number; role: Role; userId: number; email: string; }
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { firstName: string; lastName: string; email: string; password: string; phone?: string; }

export interface Rental { id: number; carId: number; userId: number; startDate: string; endDate: string; totalPrice: number; status: RentalStatus; createdAt: string; }
export interface CreateRentalRequest { carId: number; startDate: string; endDate: string; }
export interface Payment { id: number; rentalId: number; amount: number; status: PaymentStatus; createdAt: string; }
export interface CreatePaymentRequest { rentalId: number; }
export interface User { id: number; firstName: string; lastName: string; email: string; phone?: string; createdAt: string; }
export interface UpdateUserRequest { firstName?: string; lastName?: string; phone?: string; }
export interface CreateBrandRequest { name: string; }
export type UpdateBrandRequest = CreateBrandRequest;
export interface CreateCarModelRequest { name: string; brandId: number; }
export type UpdateCarModelRequest = CreateCarModelRequest;
export interface CreateCarRequest {
  modelId: number; year?: number; doors?: number; baggages?: number;
  dailyPrice: number; fuelType: FuelType; transmission: Transmission;
  seats?: number; color?: string; mileage?: number; description?: string;
}
export interface UpdateCarRequest extends CreateCarRequest { status: CarStatus; }
export interface ReorderImageItem { imageId: number; displayOrder: number; }
export interface ReorderImagesRequest { items: ReorderImageItem[]; }
export interface ChangeRoleRequest { role: 'ADMIN' | 'USER'; }
```

### Error codes → Turkish UI (full map)

```ts
export const ERROR_TR: Record<string, string> = {
  INVALID_CREDENTIALS: 'E-posta veya şifre hatalı.',
  ACCOUNT_LOCKED: 'Hesabınız 5 başarısız denemenin ardından kilitlendi. Lütfen daha sonra tekrar deneyin.',
  EMAIL_ALREADY_EXISTS: 'Bu e-posta adresi zaten kayıtlı.',
  USER_NOT_FOUND: 'Kullanıcı bulunamadı.',
  TOKEN_INVALID: 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.',
  ACCESS_DENIED: 'Bu işlem için yetkiniz yok.',
  VALIDATION_ERROR: 'Lütfen formdaki hataları düzeltin.',
  RATE_LIMIT_EXCEEDED: 'Çok fazla istek gönderdiniz. Lütfen bir dakika bekleyin.',
  RENTAL_DATE_CONFLICT: 'Seçtiğiniz tarihler bu araç için dolu. Başka tarihler deneyin.',
  RENTAL_DATE_INVALID: 'Geçersiz tarih aralığı.',
};
```

## DESIGN TOKENS (PASTE INTO `src/app/globals.css`)

```css
@import "tailwindcss";

@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui;
  --font-mono: 'Geist Mono', ui-monospace;
  --radius-sm: 0.5rem; --radius-md: 0.75rem; --radius-lg: 1rem; --radius-xl: 1.25rem;
  --color-bg: oklch(0.13 0.02 250);
  --color-surface: oklch(0.17 0.02 250);
  --color-surface-2: oklch(0.21 0.02 250);
  --color-border: oklch(0.27 0.02 250 / 0.6);
  --color-fg: oklch(0.98 0.01 250);
  --color-muted: oklch(0.65 0.02 250);
  --color-primary: oklch(0.22 0.06 250);
  --color-accent: oklch(0.65 0.18 255);
  --color-accent-fg: oklch(0.99 0 0);
  --color-success: oklch(0.74 0.18 150);
  --color-danger: oklch(0.65 0.22 25);
  --color-warning: oklch(0.78 0.16 80);
}
[data-theme='light'] {
  --color-bg: oklch(0.99 0 0); --color-surface: oklch(0.97 0 0);
  --color-surface-2: oklch(0.95 0 0); --color-border: oklch(0.85 0.005 250);
  --color-fg: oklch(0.15 0.02 250); --color-muted: oklch(0.45 0.02 250);
  --color-accent: oklch(0.55 0.20 255);
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
html { background: var(--color-bg); color: var(--color-fg); }
```

## DIRECTORY STRUCTURE TO CREATE

```
src/
├─ app/
│  ├─ (marketing)/{layout.tsx, page.tsx, cars/{page.tsx,[id]/page.tsx}, brands/{page.tsx,[id]/page.tsx}}
│  ├─ (auth)/{layout.tsx, login/page.tsx, register/page.tsx}
│  ├─ (account)/account/{layout.tsx, page.tsx, rentals/{page.tsx,[id]/page.tsx}, payments/{page.tsx,[id]/page.tsx}, settings/page.tsx}
│  ├─ (booking)/{checkout/[rentalId]/page.tsx, booking/[rentalId]/confirmation/page.tsx}
│  ├─ (admin)/admin/{layout.tsx, page.tsx, users/page.tsx, brands/page.tsx, models/page.tsx,
│  │                 cars/{page.tsx,new/page.tsx,[id]/edit/page.tsx,[id]/images/page.tsx},
│  │                 rentals/page.tsx, payments/page.tsx}
│  ├─ api/
│  │  ├─ auth/{login,register,refresh,logout}/route.ts
│  │  └─ proxy/[...path]/route.ts
│  ├─ layout.tsx, globals.css, not-found.tsx, error.tsx
├─ components/
│  ├─ ui/                       # shadcn primitives
│  ├─ layout/{Header,Footer,MobileNav,AccountShell,AdminShell,ThemeToggle}.tsx
│  ├─ marketing/{Hero,SearchBar,FeaturedCars,BrandStrip,ValueProps}.tsx
│  ├─ cars/{CarCard,CarGrid,CarFilterPanel,CarFilterChips,CarSort,CarGallery,CarSpecsGrid,CarStatusBadge,EmptyCars}.tsx
│  ├─ booking/{DateRangePicker,BookingWidget,BookingSummary,RentalStatusBadge,PaymentReceipt,MockCardForm}.tsx
│  ├─ admin/{DataTable,ImageDropzone,ImageReorderGrid,RoleSwitch,ConfirmDialog,AdminStatCard}.tsx
│  └─ common/{Skeleton,EmptyState,ErrorState,RateLimitBanner,Pagination}.tsx
├─ lib/
│  ├─ api/{envelope,types,errors,client}.ts
│  ├─ api/resources/{auth,brands,models,cars,carImages,rentals,payments,users,admin}.ts
│  ├─ queries/*.ts, mutations/*.ts
│  ├─ {rbac,format,validators,utils,constants}.ts
├─ store/{auth,theme}.ts
├─ hooks/{useDebounce,useMediaQuery,useIdempotencyKey,useCountdown}.ts
├─ providers/{QueryProvider,ThemeProvider,AppProviders}.tsx
├─ messages/tr.ts
└─ middleware.ts
```

## EXECUTION ORDER (FOLLOW STRICTLY)

Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10. After phase 3, phases 5/6/7/9 may interleave.

### Phase 0 — Scaffold

1. `pnpm create next-app@latest . --ts --app --tailwind --eslint --src-dir --import-alias "@/*"` (no turbopack flag, App Router)
2. Install deps:
   ```
   pnpm add @tanstack/react-query @tanstack/react-query-devtools @tanstack/react-table zustand nuqs axios react-hook-form @hookform/resolvers zod framer-motion lucide-react date-fns @dnd-kit/core @dnd-kit/sortable sonner uuid class-variance-authority clsx tailwind-merge
   pnpm add -D @types/uuid
   ```
3. `pnpm dlx shadcn@latest init` (default style, slate base, css vars)
4. `pnpm dlx shadcn@latest add button input label card dialog sheet dropdown-menu select table badge skeleton separator tabs accordion avatar tooltip switch checkbox radio-group textarea form alert-dialog command popover calendar`
5. Replace `src/app/globals.css` with the design tokens block above.
6. `.env.local`: `BACKEND_URL=http://localhost:8080`
7. `next.config.ts`: add `images.remotePatterns` for `localhost` and `*.amazonaws.com`.

### Phase 1 — Core libs

Create the following files. Use the exact code patterns shown.

**`src/lib/api/envelope.ts`** — `ApiResult<T>`, `PageResponse<T>`, `ApiErrorResponse` types.

**`src/lib/api/types.ts`** — full type set from "Critical types" above.

**`src/lib/api/errors.ts`** — `ApiError` class + `ERROR_TR` map above.

**`src/lib/api/client.ts`**:
```ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { ApiError } from './errors';
export const http = axios.create({ baseURL: '/api/proxy', headers: { 'X-Veyra-Csrf': '1' } });
let refreshing: Promise<void> | null = null;
async function refresh() {
  refreshing ??= fetch('/api/auth/refresh', { method: 'POST' }).then(r => { refreshing = null; if (!r.ok) throw new ApiError(401, 'TOKEN_INVALID'); });
  return refreshing;
}
http.interceptors.response.use(r => r, async (err: AxiosError<any>) => {
  const cfg = err.config as AxiosRequestConfig & { _retried?: boolean };
  if (err.response?.status === 401 && err.response.data?.errorCode === 'TOKEN_INVALID' && !cfg._retried) {
    cfg._retried = true;
    try { await refresh(); return http(cfg); } catch { window.location.href = '/login'; throw err; }
  }
  const d = err.response?.data;
  throw new ApiError(err.response?.status ?? 0, d?.errorCode, d?.data, d?.message);
});
```

**`src/lib/api/resources/*.ts`** — one resource file each. Pattern:
```ts
// resources/cars.ts
import { http } from '../client';
import type { Car, CarFilter, Pageable, ApiResult, PageResponse, CreateCarRequest, UpdateCarRequest } from '../types';
export const carsApi = {
  list: (params: CarFilter & Pageable) => http.get<ApiResult<PageResponse<Car>>>('/cars', { params }),
  byId: (id: number) => http.get<ApiResult<Car>>(`/cars/${id}`),
  create: (b: CreateCarRequest) => http.post<ApiResult<Car>>('/cars', b),
  update: (id: number, b: UpdateCarRequest) => http.put<ApiResult<Car>>(`/cars/${id}`, b),
  remove: (id: number) => http.delete(`/cars/${id}`),
};
```
Repeat for: `auth, brands, models, carImages, rentals, payments, users, admin`. `auth` calls `/api/auth/*` directly via `fetch`, not `http`.

**`src/lib/validators.ts`** — zod schemas mirroring backend constraints (passwordRule with regex, phoneRule, registerSchema, loginSchema, carFormSchema, brandFormSchema, modelFormSchema, rentalDateSchema).

**`src/lib/format.ts`**:
```ts
import { format, differenceInCalendarDays } from 'date-fns'; import { tr } from 'date-fns/locale';
const TRY = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
export const currencyTRY = (n: number) => TRY.format(n);
export const formatDate = (d: string | Date) => format(new Date(d), 'd MMM yyyy', { locale: tr });
export const formatDateRange = (a: string, b: string) => `${formatDate(a)} – ${formatDate(b)}`;
export const daysBetween = (a: Date, b: Date) => Math.max(1, differenceInCalendarDays(b, a));
```

**`src/lib/utils.ts`** — `cn()` via `clsx + tailwind-merge`.

**`src/messages/tr.ts`** — namespaced UI string tree (common, nav, auth, cars, booking, account, admin, errors, status).

**`src/lib/rbac.ts`** — `readSession()` server helper using `cookies()`, `requireRole(role)`.

### Phase 2 — BFF

**`src/app/api/auth/login/route.ts`**:
```ts
import { cookies } from 'next/headers'; import { NextRequest, NextResponse } from 'next/server';
const BACKEND = process.env.BACKEND_URL!;
export async function POST(req: NextRequest) {
  const body = await req.json();
  const upstream = await fetch(`${BACKEND}/api/v1/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const json = await upstream.json();
  if (!upstream.ok) return NextResponse.json(json, { status: upstream.status });
  const { token, expiresIn, refreshToken, refreshExpiresIn, role, userId, email } = json.data;
  const jar = await cookies();
  jar.set('veyra_at', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: expiresIn });
  jar.set('veyra_rt', refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: refreshExpiresIn });
  jar.set('veyra_user', JSON.stringify({ userId, email, role }), { secure: true, sameSite: 'lax', path: '/', maxAge: refreshExpiresIn });
  return NextResponse.json({ success: true, data: { userId, email, role } });
}
```

**`/api/auth/register/route.ts`** — same shape, calls `/auth/register`, sets cookies.
**`/api/auth/refresh/route.ts`** — reads `veyra_rt` cookie, calls `/auth/refresh`, rotates cookies.
**`/api/auth/logout/route.ts`** — calls `/auth/logout` upstream with `veyra_rt`, clears all cookies.

**`src/app/api/proxy/[...path]/route.ts`**:
```ts
import { cookies } from 'next/headers'; import { NextRequest, NextResponse } from 'next/server';
const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080';
const ALLOWED = ['content-type', 'accept', 'x-idempotency-key'];
async function handle(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BACKEND}/api/v1/${path.join('/')}${req.nextUrl.search}`;
  const jar = await cookies(); const at = jar.get('veyra_at')?.value;
  const headers = new Headers();
  for (const [k, v] of req.headers) if (ALLOWED.includes(k.toLowerCase())) headers.set(k, v);
  if (at) headers.set('Authorization', `Bearer ${at}`);
  const init: RequestInit = { method: req.method, headers, redirect: 'manual' };
  if (!['GET','HEAD'].includes(req.method)) init.body = req.body as any;
  // @ts-expect-error duplex required
  if (init.body) init.duplex = 'half';
  const upstream = await fetch(url, init);
  const resHeaders = new Headers();
  upstream.headers.forEach((v, k) => { if (k !== 'set-cookie') resHeaders.set(k, v); });
  return new NextResponse(upstream.body, { status: upstream.status, headers: resHeaders });
}
export { handle as GET, handle as POST, handle as PUT, handle as DELETE, handle as PATCH };
```

**`src/middleware.ts`**:
```ts
import { NextRequest, NextResponse } from 'next/server';
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const c = req.cookies.get('veyra_user')?.value;
  const session = c ? JSON.parse(c) as { role: 'ADMIN' | 'USER' } : null;
  if (path.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login?redirect=' + path, req.url));
    if (session.role !== 'ADMIN') return NextResponse.rewrite(new URL('/not-found', req.url));
  }
  if ((path.startsWith('/account') || path.startsWith('/checkout') || path.startsWith('/booking')) && !session)
    return NextResponse.redirect(new URL('/login?redirect=' + path, req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*', '/account/:path*', '/checkout/:path*', '/booking/:path*'] };
```

**`src/store/auth.ts`** — Zustand store, hydrates from `veyra_user` cookie.

### Phase 3 — Providers + root

**`QueryProvider`, `ThemeProvider`, `AppProviders`**, root `layout.tsx` (lang="tr", fonts, providers, skip-to-content), `not-found.tsx`, `error.tsx`.

### Phase 4 — Layout shells

`Header`, `Footer`, `MobileNav`, `ThemeToggle`, `AccountShell`, `AdminShell`.

### Phase 5 — Marketing

**Landing (`(marketing)/page.tsx`)**: Hero (headline "Lüksü kirala. Anında yola çık."), SearchBar, FeaturedCars (server-fetch 6 latest), BrandStrip, ValueProps (Premium filo / Anında rezervasyon / Esnek iptal / 7-24 destek).

**Catalog (`/cars`)**: nuqs-driven filters, CarFilterPanel (sidebar + sheet on mobile), CarSort, CarFilterChips, CarGrid, Pagination, skeleton/empty/429 states.

**Detail (`/cars/[id]`)**: CarGallery (lightbox), CarSpecsGrid, description, sticky BookingWidget with DateRangePicker, live total. Submit creates rental → redirect `/checkout/[rentalId]`.

### Phase 6 — Auth

`/login`: email + password, surface INVALID_CREDENTIALS, ACCOUNT_LOCKED (banner), RATE_LIMIT_EXCEEDED (countdown).
`/register`: full form, password meter, surface EMAIL_ALREADY_EXISTS.

### Phase 7 — Account

`/account` profile, `/account/rentals` (list + detail + cancel optimistic), `/account/payments` (list + receipt), `/account/settings` (read-only profile + delete account).

### Phase 8 — Booking

`/checkout/[rentalId]`: MockCardForm + booking summary + `usePay(rentalId)` with stable idempotency UUID.
`/booking/[rentalId]/confirmation`: poll rental every 2s up to 15s, animated success, links.

### Phase 9 — Admin

Dashboard, DataTable primitive, Brands CRUD, Models CRUD, Cars list + new + edit, Car Images (upload/reorder/setPrimary/delete), Rentals (filter/complete/cancel), Payments (filter), Users (role change/delete, block self).

### Phase 10 — Polish

Empty/skeleton/error states everywhere, route-segment error boundaries, axe-clean a11y, Lighthouse mobile ≥ 85 perf, README.

## VISUAL & UX RULES

- **CarCard**: `bg-surface border border-border rounded-xl overflow-hidden`, image `aspect-[4/3]`, hover `border-accent/40 -translate-y-0.5`, price `font-mono text-xl`.
- **Primary CTA button**: `bg-accent text-accent-fg h-10 px-5 rounded-md hover:brightness-110 focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-bg`.
- **Status badges**: `{success|accent|warning|danger|muted}/15` bg + same fg.
- **Spacing**: `py-16 md:py-24 lg:py-32` for marketing sections; `max-w-7xl` page width.
- **Type**: hero `text-5xl md:text-6xl tracking-tight`; titles `text-2xl font-semibold`; mono only for prices/IDs/dates.
- **Motion**: card hover `translateY(-2px)` 200ms; sheet/dialog spring; `prefers-reduced-motion` respected.
- **No multiple accent colors**, no gradient text, no auto-play video.

## ACCEPTANCE CHECKS (RUN BEFORE DECLARING DONE)

1. `pnpm dev` boots, no TS/lint errors.
2. **/cars** filters by `brandId`+`fuelType`+`minPrice`+`maxPrice` and the URL stays in sync; back-button restores.
3. **/cars/[id]** gallery + booking widget render; date picker rejects past dates; total updates live.
4. **/login** with bad password 6× shows account-locked banner; rate-limit toast appears with countdown.
5. **Register → Login → Create rental → Checkout → Confirmation → CONFIRMED** end-to-end works against running Spring API.
6. Repeated payment submit (same checkout session) reuses idempotency key — server returns same payment.
7. **Admin (ADMIN role)** uploads 3 images, drags to reorder, sets primary, deletes one.
8. **Admin** completes a rental, role-changes a user, cannot self-demote.
9. **Theme toggle** switches dark/light, persists in localStorage, no flash on reload.
10. **Lighthouse mobile**: `/cars` perf ≥ 85, `/` perf ≥ 90, a11y ≥ 95 across all surfaces.
11. axe DevTools shows **0 critical/serious** issues on `/`, `/cars`, `/cars/[id]`, `/login`.
12. Keyboard-only navigate landing → catalog → detail → booking → checkout — no traps.

## DELIVERABLE

A `veyra-frontend/` folder containing a working Next.js 15 app that:
- Boots with `pnpm dev`
- Renders all 25+ routes listed
- Talks only to `localhost:8080` Spring API via the BFF
- Passes the 12 acceptance checks
- Has 0 console errors in production build
- Includes a README with setup steps

**Begin now with Phase 0, T-001. Work through tasks in order. Mark each phase complete before moving on. Do not skip the BFF/middleware — auth security depends on them.**
