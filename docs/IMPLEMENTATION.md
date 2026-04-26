# Veyra RentACar Frontend — Implementation Guide

> **The How.** Translates SPECIFICATION.md into concrete architecture, file-by-file structure, code sketches for the load-bearing pieces, and dependency choices with rationale.

---

## 1. Stack & rationale

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15.x (App Router)** + React 19 | SSR/RSC for SEO on `/cars`, route handlers as BFF for auth, single deployment artifact |
| Language | **TypeScript strict** | Backend is strongly typed; types eliminate envelope/field drift |
| Styling | **Tailwind v4 + shadcn/ui (Radix)** | Token-driven, fully themeable, accessible primitives, premium look |
| Server state | **TanStack Query v5** | Cache, dedup, background revalidation, mutation lifecycle, devtools |
| Client state | **Zustand** | Tiny, no providers, perfect for auth metadata + UI flags |
| URL state | **nuqs** | Type-safe URL sync for catalog filters — back button works, links are shareable |
| Forms | **react-hook-form + zod** | Performant, schema-first, mirrors backend validation |
| HTTP | **Axios** | Interceptor ergonomics for refresh-queue & idempotency header |
| Animation | **Framer Motion** | Declarative spring/keyframe, `prefers-reduced-motion` aware |
| Tables (admin) | **TanStack Table v8** | Headless, server-pagination friendly |
| Drag & drop | **dnd-kit** | A11y-first, touch + keyboard, perfect for image reorder |
| Toasts | **sonner** | Stackable, accessible, themeable |
| Icons | **lucide-react** | Tree-shakeable, consistent stroke |
| Dates | **date-fns + tr locale** | Tree-shakeable; `Intl` for currency |
| IDs | **uuid v9** | Idempotency keys |

## 2. Design patterns applied

### 2.1 Backend-for-Frontend (BFF) — *for auth & proxying*
**Why:** Tokens never touch client storage. Browser only ever talks to `/api/proxy/*` and `/api/auth/*`; the Next runtime holds the JWT and forwards to Spring.
**Where:** `src/app/api/auth/*/route.ts` and `src/app/api/proxy/[...path]/route.ts`.

### 2.2 Repository / Resource module — *for API surface*
**Why:** One file per backend resource, narrow typed function per operation. Components never call axios directly.
**Where:** `src/lib/api/resources/*.ts`.
```ts
// resources/cars.ts (sketch)
export const carsApi = {
  list: (params: CarFilter & Pageable) => http.get<ApiResult<PageResponse<Car>>>('/cars', { params }),
  byId: (id: number) => http.get<ApiResult<Car>>(`/cars/${id}`),
  create: (body: CreateCarRequest) => http.post<ApiResult<Car>>('/cars', body),
  update: (id: number, body: UpdateCarRequest) => http.put<ApiResult<Car>>(`/cars/${id}`, body),
  remove: (id: number) => http.delete<void>(`/cars/${id}`),
};
```

### 2.3 Query/Mutation hooks — *for component-level data access*
**Why:** Components don't know about Axios or query keys. They consume domain hooks.
```ts
// queries/useCars.ts
export const useCars = (filter: CarFilter, pageable: Pageable) =>
  useQuery({
    queryKey: ['cars', filter, pageable],
    queryFn: () => carsApi.list({ ...filter, ...pageable }).then(r => r.data.data),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
```

### 2.4 Compound components — *for booking widget, gallery, data table*
Header + Body + Footer subcomponents share context. Used for `<BookingWidget>`, `<CarGallery>`, `<DataTable>`.

### 2.5 Server-side guards via middleware — *for /account, /admin*
Middleware reads `veyra_role` cookie and short-circuits with a 307 redirect — no flash of unauthorized content.

### 2.6 Optimistic updates — *for cancel rental, reorder images, set primary*
TanStack Query `onMutate`/`onError` rollback. Latency feels zero, errors revert.

### 2.7 Idempotency-key memoization — *for payment*
`useMemo(() => crypto.randomUUID(), [rentalId])` ensures repeated submits within the same checkout session reuse the key.

## 3. Directory layout

```
veyra-frontend/
├─ docs/                          # This skill's outputs
├─ public/                        # Static assets, favicons, og image
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/
│  │  │  ├─ layout.tsx           # Marketing shell (Header + Footer)
│  │  │  ├─ page.tsx             # Landing
│  │  │  ├─ cars/
│  │  │  │  ├─ page.tsx          # Catalog
│  │  │  │  └─ [id]/page.tsx     # Detail
│  │  │  └─ brands/{page.tsx,[id]/page.tsx}
│  │  ├─ (auth)/
│  │  │  ├─ layout.tsx           # Centered auth shell
│  │  │  ├─ login/page.tsx
│  │  │  └─ register/page.tsx
│  │  ├─ (account)/account/
│  │  │  ├─ layout.tsx           # AccountShell
│  │  │  ├─ page.tsx
│  │  │  ├─ rentals/{page.tsx,[id]/page.tsx}
│  │  │  ├─ payments/{page.tsx,[id]/page.tsx}
│  │  │  └─ settings/page.tsx
│  │  ├─ (booking)/
│  │  │  ├─ checkout/[rentalId]/page.tsx
│  │  │  └─ booking/[rentalId]/confirmation/page.tsx
│  │  ├─ (admin)/admin/
│  │  │  ├─ layout.tsx           # AdminShell
│  │  │  ├─ page.tsx             # Dashboard
│  │  │  ├─ users/page.tsx
│  │  │  ├─ brands/page.tsx
│  │  │  ├─ models/page.tsx
│  │  │  ├─ cars/{page.tsx,new/page.tsx,[id]/edit/page.tsx,[id]/images/page.tsx}
│  │  │  ├─ rentals/page.tsx
│  │  │  └─ payments/page.tsx
│  │  ├─ api/
│  │  │  ├─ auth/{login,register,refresh,logout}/route.ts
│  │  │  └─ proxy/[...path]/route.ts
│  │  ├─ layout.tsx              # Root: providers, fonts, theme
│  │  ├─ globals.css             # Tailwind v4 @theme tokens
│  │  ├─ not-found.tsx
│  │  └─ error.tsx               # Root error boundary
│  ├─ components/
│  │  ├─ ui/                     # shadcn primitives (button, sheet, dialog, dropdown, table, input, toast, …)
│  │  ├─ layout/{Header,Footer,MobileNav,AccountShell,AdminShell,ThemeToggle}.tsx
│  │  ├─ marketing/{Hero,SearchBar,FeaturedCars,BrandStrip,ValueProps,Testimonial}.tsx
│  │  ├─ cars/{CarCard,CarGrid,CarFilterPanel,CarFilterChips,CarSort,CarGallery,CarSpecsGrid,CarStatusBadge,EmptyCars}.tsx
│  │  ├─ booking/{DateRangePicker,BookingWidget,BookingSummary,RentalStatusBadge,PaymentReceipt,MockCardForm}.tsx
│  │  ├─ admin/{DataTable,ImageDropzone,ImageReorderGrid,RoleSwitch,ConfirmDialog,AdminStatCard}.tsx
│  │  └─ common/{Skeleton,EmptyState,ErrorState,RateLimitBanner,Pagination}.tsx
│  ├─ lib/
│  │  ├─ api/
│  │  │  ├─ types.ts             # Hand-written TS mirroring api-docs schemas
│  │  │  ├─ envelope.ts          # ApiResult<T>, PageResponse<T>, ApiErrorResponse
│  │  │  ├─ errors.ts            # ApiError class + errorCode → TR map
│  │  │  ├─ client.ts            # Axios instance (baseURL=/api/proxy, csrf header)
│  │  │  └─ resources/{auth,brands,models,cars,carImages,rentals,payments,users,admin}.ts
│  │  ├─ queries/                # All useXxxQuery hooks
│  │  ├─ mutations/              # All useXxxMutation hooks
│  │  ├─ rbac.ts                 # readSession() (server), useSession() (client)
│  │  ├─ format.ts               # currencyTRY, formatDate, formatDateRange, daysBetween
│  │  ├─ validators.ts           # zod schemas (loginSchema, registerSchema, carFormSchema, …)
│  │  ├─ utils.ts                # cn() (tailwind-merge), sleep, qs helpers
│  │  └─ constants.ts            # FUEL_TYPES, TRANSMISSIONS, RENTAL_STATUSES, etc.
│  ├─ store/
│  │  ├─ auth.ts                 # Zustand: { user, role, hydrated, hydrate(), clear() }
│  │  └─ theme.ts                # Zustand: { theme, setTheme() } persisted
│  ├─ messages/
│  │  └─ tr.ts                   # All UI strings (object tree)
│  ├─ providers/
│  │  ├─ QueryProvider.tsx       # TanStack Query client + devtools
│  │  ├─ ThemeProvider.tsx
│  │  └─ AppProviders.tsx        # Composes all providers
│  ├─ hooks/                     # useDebounce, useMediaQuery, useIdempotencyKey, useCountdown
│  └─ middleware.ts              # Edge guards
├─ .env.local                    # BACKEND_URL=http://localhost:8080
├─ .env.example
├─ next.config.ts
├─ tailwind.config.ts            # (Tailwind v4 — minimal; tokens in CSS)
├─ postcss.config.mjs
├─ tsconfig.json
├─ eslint.config.mjs
├─ package.json
└─ README.md
```

## 4. Critical code sketches

### 4.1 `src/lib/api/envelope.ts`
```ts
export interface ApiResult<T> {
  success: boolean;
  status: number;
  message?: string;
  errorCode?: string;
  data: T;
  timestamp: string;
}
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
export interface ApiErrorResponse {
  success: false;
  status: number;
  message: string;
  errorCode: string;
  data: unknown;
  timestamp: string;
}
```

### 4.2 `src/lib/api/types.ts` — domain types
```ts
export type FuelType = 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
export type Transmission = 'MANUAL' | 'AUTOMATIC';
export type CarStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
export type RentalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PENDING' | 'CONFIRMED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type Role = 'ADMIN' | 'USER';

export interface Brand { id: number; name: string; createdAt: string; }
export interface CarModel { id: number; name: string; brandId: number; brandName: string; createdAt: string; }
export interface CarImage { id: number; carId: number; storageKey: string; url: string; contentType: string; sizeBytes: number; displayOrder: number; primary: boolean; }
export interface Car {
  id: number; modelId: number; modelName: string; brandId: number; brandName: string;
  year: number; doors: number; baggages: number; dailyPrice: number;
  fuelType: FuelType; transmission: Transmission; seats: number;
  color?: string; mileage?: number; description?: string;
  status: CarStatus; createdAt: string;
  images: CarImage[]; primaryImageUrl?: string;
}
export interface CarFilter {
  brandId?: number; modelId?: number;
  minPrice?: number; maxPrice?: number;
  minYear?: number; maxYear?: number;
  fuelType?: FuelType; transmission?: Transmission;
  available?: boolean;
}
export interface Pageable { page?: number; size?: number; sort?: string[]; }

export interface AuthResponse { token: string; expiresIn: number; refreshToken: string; refreshExpiresIn: number; role: Role; userId: number; email: string; }
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { firstName: string; lastName: string; email: string; password: string; phone?: string; }

export interface Rental { id: number; carId: number; userId: number; startDate: string; endDate: string; totalPrice: number; status: RentalStatus; createdAt: string; }
export interface CreateRentalRequest { carId: number; startDate: string; endDate: string; }
export interface Payment { id: number; rentalId: number; amount: number; status: PaymentStatus; createdAt: string; }
export interface CreatePaymentRequest { rentalId: number; }
// … (others mirrored from api-docs)
```

### 4.3 `src/lib/api/errors.ts` — errorCode → TR
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
export class ApiError extends Error {
  constructor(public status: number, public errorCode?: string, public data?: unknown, message?: string) {
    super(message ?? errorCode ?? 'API Error');
  }
  get tr() { return this.errorCode && ERROR_TR[this.errorCode] || this.message || 'Bir hata oluştu.'; }
}
```

### 4.4 `src/lib/api/client.ts` — axios with refresh queue
```ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { ApiError, ApiErrorResponse } from './errors';

export const http = axios.create({ baseURL: '/api/proxy', headers: { 'X-Veyra-Csrf': '1' } });

let refreshing: Promise<void> | null = null;
async function refresh() {
  refreshing ??= fetch('/api/auth/refresh', { method: 'POST' }).then(r => {
    refreshing = null;
    if (!r.ok) throw new ApiError(401, 'TOKEN_INVALID');
  });
  return refreshing;
}

http.interceptors.response.use(
  r => r,
  async (err: AxiosError<ApiErrorResponse>) => {
    const cfg = err.config as AxiosRequestConfig & { _retried?: boolean };
    if (err.response?.status === 401 && err.response.data?.errorCode === 'TOKEN_INVALID' && !cfg._retried) {
      cfg._retried = true;
      try { await refresh(); return http(cfg); }
      catch { window.location.href = '/login'; throw err; }
    }
    const data = err.response?.data;
    throw new ApiError(err.response?.status ?? 0, data?.errorCode, data?.data, data?.message);
  }
);
```

### 4.5 `src/app/api/proxy/[...path]/route.ts`
```ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080';
const ALLOWED_HEADERS = ['content-type', 'accept', 'x-idempotency-key'];

async function handle(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BACKEND}/api/v1/${path.join('/')}${req.nextUrl.search}`;
  const jar = await cookies();
  const at = jar.get('veyra_at')?.value;

  const headers = new Headers();
  for (const [k, v] of req.headers) if (ALLOWED_HEADERS.includes(k.toLowerCase())) headers.set(k, v);
  if (at) headers.set('Authorization', `Bearer ${at}`);

  const init: RequestInit = { method: req.method, headers, redirect: 'manual' };
  if (!['GET', 'HEAD'].includes(req.method)) init.body = req.body as any;
  // @ts-expect-error duplex required for streaming bodies in Node 18+
  if (init.body) init.duplex = 'half';

  const upstream = await fetch(url, init);
  const resHeaders = new Headers();
  upstream.headers.forEach((v, k) => { if (k !== 'set-cookie') resHeaders.set(k, v); });
  return new NextResponse(upstream.body, { status: upstream.status, headers: resHeaders });
}

export { handle as GET, handle as POST, handle as PUT, handle as DELETE, handle as PATCH };
```

### 4.6 `src/app/api/auth/login/route.ts`
```ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL!;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const upstream = await fetch(`${BACKEND}/api/v1/auth/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
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

### 4.7 `src/middleware.ts`
```ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const userCookie = req.cookies.get('veyra_user')?.value;
  const session = userCookie ? JSON.parse(userCookie) as { role: 'ADMIN' | 'USER' } : null;

  if (path.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login?redirect=' + path, req.url));
    if (session.role !== 'ADMIN') return NextResponse.rewrite(new URL('/not-found', req.url));
  }
  if ((path.startsWith('/account') || path.startsWith('/checkout') || path.startsWith('/booking')) && !session) {
    return NextResponse.redirect(new URL('/login?redirect=' + path, req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/account/:path*', '/checkout/:path*', '/booking/:path*'] };
```

### 4.8 `src/store/auth.ts`
```ts
import { create } from 'zustand';
import type { Role } from '@/lib/api/types';

interface AuthState {
  user: { userId: number; email: string } | null;
  role: Role | null;
  hydrated: boolean;
  hydrate: () => void;
  clear: () => void;
}
export const useAuth = create<AuthState>((set) => ({
  user: null, role: null, hydrated: false,
  hydrate: () => {
    const raw = document.cookie.split('; ').find(c => c.startsWith('veyra_user='))?.split('=')[1];
    if (!raw) return set({ hydrated: true });
    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      set({ user: { userId: parsed.userId, email: parsed.email }, role: parsed.role, hydrated: true });
    } catch { set({ hydrated: true }); }
  },
  clear: () => set({ user: null, role: null }),
}));
```

### 4.9 `src/lib/queries/useCars.ts`
```ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { carsApi } from '@/lib/api/resources/cars';
import type { CarFilter, Pageable } from '@/lib/api/types';

export const carsKeys = {
  all: ['cars'] as const,
  list: (f: CarFilter, p: Pageable) => [...carsKeys.all, 'list', f, p] as const,
  detail: (id: number) => [...carsKeys.all, 'detail', id] as const,
};
export const useCars = (filter: CarFilter, pageable: Pageable) => useQuery({
  queryKey: carsKeys.list(filter, pageable),
  queryFn: () => carsApi.list({ ...filter, ...pageable }).then(r => r.data.data),
  staleTime: 60_000, placeholderData: keepPreviousData,
});
export const useCar = (id: number) => useQuery({
  queryKey: carsKeys.detail(id), queryFn: () => carsApi.byId(id).then(r => r.data.data), staleTime: 30_000,
});
```

### 4.10 Catalog filters URL-sync (nuqs)
```ts
// (marketing)/cars/page.tsx
'use client';
import { parseAsInteger, parseAsString, parseAsBoolean, useQueryStates } from 'nuqs';

const filterParsers = {
  brandId: parseAsInteger, modelId: parseAsInteger,
  minPrice: parseAsInteger, maxPrice: parseAsInteger,
  minYear: parseAsInteger, maxYear: parseAsInteger,
  fuelType: parseAsString, transmission: parseAsString,
  available: parseAsBoolean,
  page: parseAsInteger.withDefault(0),
  size: parseAsInteger.withDefault(20),
  sort: parseAsString.withDefault('createdAt,desc'),
};
export default function CatalogPage() {
  const [state, setState] = useQueryStates(filterParsers, { history: 'push', shallow: false });
  const { data, isLoading } = useCars(state, { page: state.page, size: state.size, sort: [state.sort] });
  // …
}
```

### 4.11 Booking widget price calc
```ts
const days = Math.max(1, differenceInCalendarDays(endDate, startDate));
const total = car.dailyPrice * days; // server is final authority on submit
```

### 4.12 Idempotent payment hook
```ts
// hooks/useIdempotencyKey.ts
export const useIdempotencyKey = (scope: string | number) =>
  React.useMemo(() => crypto.randomUUID(), [scope]);

// mutations/usePay.ts
export const usePay = (rentalId: number) => {
  const key = useIdempotencyKey(rentalId);
  return useMutation({
    mutationFn: () => paymentsApi.pay({ rentalId }, { headers: { 'X-Idempotency-Key': key } }),
  });
};
```

### 4.13 Image reorder (dnd-kit + optimistic)
```ts
const onDragEnd = (e: DragEndEvent) => {
  const reordered = arrayMove(images, oldIndex, newIndex).map((img, i) => ({ ...img, displayOrder: i + 1 }));
  qc.setQueryData(carImagesKeys.byCar(carId), reordered);
  reorderMutation.mutate({ carId, items: reordered.map(i => ({ imageId: i.id, displayOrder: i.displayOrder })) });
};
```

## 5. Theming (Tailwind v4)

### 5.1 `src/app/globals.css`
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
  --color-bg: oklch(0.99 0 0);
  --color-surface: oklch(0.97 0 0);
  --color-surface-2: oklch(0.95 0 0);
  --color-border: oklch(0.85 0.005 250);
  --color-fg: oklch(0.15 0.02 250);
  --color-muted: oklch(0.45 0.02 250);
  --color-primary: oklch(0.22 0.06 250);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

### 5.2 Theme toggle
- `<html data-theme={theme}>` set by `ThemeProvider`
- Persists in `localStorage('veyra-theme')`
- Defaults to system on first visit

## 6. Form validation (zod)

```ts
// validators.ts
export const passwordRule = z.string()
  .min(10).max(128)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!.,?_-]).+$/, 'Şifre en az bir küçük harf, büyük harf, rakam ve özel karakter içermelidir.');
export const phoneRule = z.string().regex(/^$|^[0-9+()\-\s]{10,15}$/).optional().or(z.literal(''));
export const registerSchema = z.object({
  firstName: z.string().max(50).min(1, 'Ad zorunlu.'),
  lastName: z.string().max(50).min(1, 'Soyad zorunlu.'),
  email: z.string().email('Geçerli bir e-posta girin.').max(255),
  password: passwordRule,
  phone: phoneRule,
});
```

## 7. Mutation patterns

```ts
// mutations/useCancelRental.ts — optimistic
export const useCancelRental = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rentalsApi.cancel(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['rentals', 'my'] });
      const prev = qc.getQueriesData({ queryKey: ['rentals', 'my'] });
      qc.setQueriesData({ queryKey: ['rentals', 'my'] }, (old: any) => ({
        ...old, content: old?.content?.map((r: Rental) => r.id === id ? { ...r, status: 'CANCELLED' } : r),
      }));
      return { prev };
    },
    onError: (_e, _id, ctx) => ctx?.prev.forEach(([k, v]) => qc.setQueryData(k as any, v)),
    onSettled: () => qc.invalidateQueries({ queryKey: ['rentals', 'my'] }),
  });
};
```

## 8. Performance

- **Images**: `next/image` everywhere; backend returns `url` (likely S3-style); add hostname to `next.config.ts` `images.remotePatterns`.
- **Code splitting**: route-level by default; lazy-load heavy admin features (`ImageReorderGrid` via `next/dynamic`).
- **TanStack Query**: `staleTime` per resource (catalog 60 s, brands 5 min, my-rentals 30 s).
- **Fonts**: `next/font/google` for Inter, self-host Geist Mono.

## 9. A11y commitments

- Semantic HTML: nav, main, aside, section, article
- Radix primitives for dialogs, menus, dropdowns, tooltips, toasts
- Focus rings: `focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-bg`
- Skip-to-content link in root layout
- Color contrast checked in both themes
- `aria-live="polite"` on toasts, `assertive` on form errors
- Reduced-motion query disables Framer Motion variants

## 10. Error boundaries & fallbacks

| Layer | Boundary | Fallback |
|---|---|---|
| Root | `app/error.tsx` | Generic "Bir şeyler ters gitti" + retry |
| Route segment | `app/[group]/error.tsx` | Section-scoped error |
| Suspense | `app/[group]/loading.tsx` | Route-level skeleton |
| Component | Custom `<ErrorBoundary>` | Inline error state |

## 11. Build & deploy

- `pnpm install && pnpm dev` (PORT 3000)
- `pnpm build && pnpm start` for prod
- Env: `BACKEND_URL` (server-only), `NEXT_PUBLIC_APP_NAME`
- Single Docker image (Node 20-alpine), multistage; or Vercel deploy with `BACKEND_URL` set

## 12. Testing strategy (lightweight)

- **Unit**: vitest for `format.ts`, `errors.ts`, `validators.ts`
- **Component**: react testing library for `BookingWidget` price math, `CarFilterPanel` URL sync
- **E2E (optional, Playwright)**: login → create rental → pay → see CONFIRMED on confirmation page; admin upload+reorder

(Tests are **not** in TASKS.md unless explicitly requested — flagged as future work.)
