# Veyra RentACar Frontend — Specification

> **The What.** Audience, surfaces, behaviors, success criteria. Implementation-agnostic but contract-aware.

---

## 1. Elevator pitch

Veyra RentACar is a Turkish-market premium car rental platform. The frontend is a single Next.js 15 application that serves three distinct surfaces from one codebase:

1. **Public catalog** — discover, filter, and inspect rental cars (no auth required).
2. **Customer account** — sign up, book, pay, manage rentals and profile.
3. **Admin console** — manage brands, models, cars, images, rentals, payments, and users.

Quality bar: **Apple / Stripe / Airbnb / Linear**. Premium dark-first identity, motion-rich but never noisy, mobile-first responsive, AA-accessible.

## 2. Audience

| Persona | Primary surface | Devices | Key jobs |
|---|---|---|---|
| **Visitor** (unauthenticated) | Marketing + catalog | Mobile-first | Browse cars, compare prices, decide whether to register |
| **Customer** (ROLE_USER) | Account + booking | Mobile + desktop | Book a car for a date range, pay, manage active rentals |
| **Admin** (ROLE_ADMIN) | Admin console | Desktop-first (tables) | Maintain catalog, moderate rentals, audit payments |

## 3. Source of truth

The Spring Boot backend at `http://localhost:8080`, fully described in `api-docs.json`. **No endpoint, field, or business rule may be invented.** This document references API operations directly when defining behavior.

### 3.1 Domains in scope

| Domain | Read | Write |
|---|---|---|
| Auth | — | `register`, `login`, `refresh`, `logout` |
| Brands | `GET /brands`, `GET /brands/{id}` (public) | admin CRUD |
| Models | `GET /models?brandId=`, `GET /models/{id}` (public) | admin CRUD |
| Cars | `GET /cars?filter+page`, `GET /cars/{id}` (public) | admin CRUD |
| Car Images | `GET /cars/{carId}/images` (public) | admin upload, reorder, set-primary, delete |
| Rentals | `GET /rentals/my`, `GET /rentals/{id}` (auth); `GET /rentals` (admin) | `POST /rentals` (auth), cancel (auth), complete (admin) |
| Payments | `GET /payments/my`, `GET /payments/{id}` (auth); `GET /payments` (admin) | `POST /payments` (auth, X-Idempotency-Key) |
| Users | `DELETE /users/me` (auth); `GET/PUT/DELETE /users/{id}`, `GET /users` (admin) | `PUT /admin/users/{userId}/role` (admin) |

### 3.2 Out of scope (no backend support)

- Email verification
- Password reset
- Reviews / ratings
- Map / pickup-location selection
- Real payment gateway (`POST /payments` is a simulation — UI mirrors that)
- Multi-currency / multi-language (Turkish only, TRY only)

## 4. Surface map

### 4.1 Public (marketing)

| Route | Purpose |
|---|---|
| `/` | Landing — hero, search bar, featured cars, brand strip, value props, footer CTA |
| `/cars` | Catalog with filters (brand, model, price range, year range, fuel, transmission, availability), sort, pagination — all URL-synced |
| `/cars/[id]` | Car detail — gallery, specs grid, description, sticky booking widget |
| `/brands` | Brand directory |
| `/brands/[id]` | Brand → list of models → cars under that brand |

### 4.2 Auth

| Route | Purpose |
|---|---|
| `/login` | Email + password. Surfaces `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `RATE_LIMIT_EXCEEDED` (5/min) |
| `/register` | Full form mirroring `RegisterRequest` validation (password regex, phone pattern). Surfaces `EMAIL_ALREADY_EXISTS`, `RATE_LIMIT_EXCEEDED` |

### 4.3 Customer account

| Route | Purpose |
|---|---|
| `/account` | Profile snapshot |
| `/account/rentals` | Paged list of `GET /rentals/my`. Status badges (PENDING/CONFIRMED/ACTIVE/COMPLETED/CANCELLED) |
| `/account/rentals/[id]` | Detail + pay-now (if PENDING) + cancel (if not COMPLETED/CANCELLED) |
| `/account/payments` | Paged `GET /payments/my` |
| `/account/payments/[id]` | Receipt view |
| `/account/settings` | Edit firstName/lastName/phone (none editable via current API → see §10 gap), danger zone for `DELETE /users/me` |

### 4.4 Booking

| Route | Purpose |
|---|---|
| `/checkout/[rentalId]` | Mock card form → `POST /payments` with `X-Idempotency-Key` |
| `/booking/[rentalId]/confirmation` | Polls `GET /rentals/{id}` until `CONFIRMED`, then receipt + next steps |

### 4.5 Admin (ROLE_ADMIN)

| Route | Purpose |
|---|---|
| `/admin` | Dashboard — total rentals, payments, recent activity tables |
| `/admin/users` | DataTable, role change (`PUT /admin/users/{id}/role`), soft delete |
| `/admin/brands` | CRUD list |
| `/admin/models` | CRUD list with brand filter |
| `/admin/cars` | DataTable with filter |
| `/admin/cars/new`, `/admin/cars/[id]/edit` | Forms mirroring `Create/UpdateCarRequest` |
| `/admin/cars/[id]/images` | Upload (multipart, 5 MB, jpeg/png/webp, max 10), reorder (dnd), set primary, delete |
| `/admin/rentals` | All rentals (filter by userId), complete + cancel actions |
| `/admin/payments` | All payments (filter by userId) |

## 5. Functional requirements

### 5.1 Authentication (FR-AUTH)

- **FR-AUTH-1** Login form sends `{ email, password }` to `POST /api/v1/auth/login`. On success, store tokens server-side via httpOnly cookies (see Implementation §BFF). Redirect to `?redirect=` param or `/account`.
- **FR-AUTH-2** Login surfaces these errorCodes with TR copy: `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED` (persistent banner), `RATE_LIMIT_EXCEEDED` (toast with 60-s countdown).
- **FR-AUTH-3** Register form validates client-side per `RegisterRequest` schema (password regex `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!.,?_-]).+$`, length 10–128; phone `^$|^[0-9+()\-\s]{10,15}$`).
- **FR-AUTH-4** Refresh: any 401 with `TOKEN_INVALID` from a proxied call triggers a single `/auth/refresh`. Concurrent 401s queue on the in-flight refresh promise.
- **FR-AUTH-5** Logout: `POST /api/v1/auth/logout` with refresh token, clears cookies, redirects to `/`.
- **FR-AUTH-6** Authenticated routes (`/account/**`, `/admin/**`, `/checkout/**`) protected at the edge by Next middleware checking `veyra_role` cookie.
- **FR-AUTH-7** Admin routes additionally check role === `ADMIN`; unauthorized → 404 (do not leak existence).

### 5.2 Catalog (FR-CAT)

- **FR-CAT-1** `/cars` reads filter from URL (`brandId, modelId, minPrice, maxPrice, minYear, maxYear, fuelType, transmission, available, page, size, sort`) and calls `GET /cars` with the same flat structure.
- **FR-CAT-2** Filter changes update URL (push), trigger refetch. Browser back restores prior result.
- **FR-CAT-3** Active filter chips at top — clicking × removes that filter and updates URL.
- **FR-CAT-4** Sort: dailyPrice asc, dailyPrice desc, year desc, createdAt desc (newest). Default: createdAt desc.
- **FR-CAT-5** Mobile filter UI: bottom sheet. Desktop: persistent left sidebar.
- **FR-CAT-6** Empty state when 0 results: "Bu kriterlere uygun araç bulunamadı" + "Filtreleri sıfırla" CTA.
- **FR-CAT-7** 429 from public catalog (60/min): inline banner "Çok hızlı geziniyorsunuz, bir dakika bekleyin" with auto-retry timer.

### 5.3 Car detail (FR-CD)

- **FR-CD-1** Gallery shows images sorted by `displayOrder`, `primary` first if not already #1. Lightbox on desktop, swipe on mobile.
- **FR-CD-2** Specs grid renders: year, transmission, fuelType, seats, doors, baggages, mileage, color (omit if null).
- **FR-CD-3** Booking widget: date range picker (`startDate`, `endDate`, no past dates, endDate ≥ startDate+1), shows `dailyPrice × days = total` live (TRY formatted).
- **FR-CD-4** "Kirala" CTA → if not authenticated, redirect to `/login?redirect=/cars/[id]`. Else `POST /api/v1/rentals` with `{ carId, startDate, endDate }`.
- **FR-CD-5** Surface 422 `RENTAL_DATE_CONFLICT` inline ("Seçtiğiniz tarihler bu araç için dolu — başka tarihler deneyin"). 422 `RENTAL_DATE_INVALID` similarly.
- **FR-CD-6** Successful create → push `/checkout/[rentalId]` (rental status PENDING).

### 5.4 Booking & payment (FR-PAY)

- **FR-PAY-1** Checkout page generates a single UUID via `useMemo(() => crypto.randomUUID(), [rentalId])`. Same key for any retry of the same rental's payment.
- **FR-PAY-2** Mock card form (number, expiry, CVC, name) — purely cosmetic; submit calls `POST /api/v1/payments` with `{ rentalId }` and `X-Idempotency-Key` header.
- **FR-PAY-3** On success, redirect `/booking/[rentalId]/confirmation`.
- **FR-PAY-4** Confirmation page polls `GET /rentals/{id}` every 2 s (max 15 s) until status moves to `CONFIRMED` or `ACTIVE`; then renders receipt linking to `GET /payments/{id}`.

### 5.5 Account self-service (FR-ACCT)

- **FR-ACCT-1** `/account/rentals` paginated list, default sort `createdAt,desc`. Each row shows car name (resolved via cached `GET /cars/{id}`), date range, total, status badge.
- **FR-ACCT-2** Cancel rental: `POST /api/v1/rentals/{id}/cancel`. Optimistic update (status → CANCELLED), rollback on error. Confirm dialog required.
- **FR-ACCT-3** Delete account: confirm with email re-entry → `DELETE /users/me` → clear cookies → redirect `/`.

### 5.6 Admin (FR-ADM)

- **FR-ADM-1** All admin tables use server-side pagination matching `Pageable` (`page, size, sort`). Default `size=20`.
- **FR-ADM-2** Brand/Model CRUD via dialog form. Surface 409 Conflict (`EMAIL_ALREADY_EXISTS` analog for unique name) inline on field.
- **FR-ADM-3** Car create/edit form: all fields from `Create/UpdateCarRequest`. Brand selector → models filtered by brand.
- **FR-ADM-4** Image management page: dropzone with per-file progress, queue retry on failure. Reject client-side > 5 MB or wrong MIME with friendly message before upload. Server is final authority (magic-byte).
- **FR-ADM-5** Reorder: dnd-kit grid, drop triggers `PUT /cars/{carId}/images/reorder` with new ordering. Optimistic update.
- **FR-ADM-6** Set primary: click on image → `PUT /cars/{carId}/images/{imageId}/primary`. Visual indicator updates immediately.
- **FR-ADM-7** Rentals admin table: filter by userId, complete (only if status ACTIVE), cancel (any non-terminal). Confirm dialog for both.
- **FR-ADM-8** Role change: dropdown → `PUT /admin/users/{id}/role`. Cannot demote self — UI blocks if userId === current user.

### 5.7 Cross-cutting (FR-X)

- **FR-X-1** Theme: dark default, light alternative, persisted in `localStorage('veyra-theme')`. Respect `prefers-color-scheme` on first visit.
- **FR-X-2** Toast system: success (green), error (red), info (blue). Auto-dismiss 4 s except errors (manual).
- **FR-X-3** Loading: route segment skeletons (Suspense), per-component skeletons for lists.
- **FR-X-4** All forms: react-hook-form + zod. Field-level errors mapped from `VALIDATION_ERROR` `data` object if backend returns field map.
- **FR-X-5** All amounts shown TRY-formatted: `Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })`.
- **FR-X-6** All dates shown via `date-fns` with `tr` locale.

## 6. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-PERF-1 | Lighthouse mobile Performance ≥ 85 on `/cars`, ≥ 90 on `/`, ≥ 80 on `/cars/[id]` |
| NFR-PERF-2 | LCP ≤ 2.5 s on cable; images via `next/image` with explicit dimensions |
| NFR-A11Y-1 | WCAG 2.1 AA contrast in both themes; tested with axe |
| NFR-A11Y-2 | Full keyboard navigation: tab order, focus rings, skip-to-content link |
| NFR-A11Y-3 | All interactive elements ≥ 44×44 px tap target on mobile |
| NFR-A11Y-4 | `prefers-reduced-motion` disables Framer Motion springs/parallax |
| NFR-SEC-1 | No tokens in `localStorage`/`sessionStorage`. JWT in httpOnly Secure SameSite=Lax cookie only |
| NFR-SEC-2 | All proxy calls happen via Next route handler — Spring host never visible to browser |
| NFR-SEC-3 | CSRF: SameSite=Lax + custom `X-Veyra-Csrf` header on mutating proxy calls |
| NFR-RES-1 | Mobile-first design, breakpoints: 360, 640, 768, 1024, 1280, 1536 |
| NFR-RES-2 | Tested on iPhone 13 (390), iPad (820), MacBook 13" (1280), QHD (2560) |
| NFR-I18N-1 | All user-facing strings come from `src/messages/tr.ts` — no hardcoded literals in components |
| NFR-OBS-1 | Sentry-style error boundary at root, logs to console in dev, swallows in prod |

## 7. Information architecture

- **Header** (public + customer): logo, primary nav (`Araçlar`, `Markalar`), theme toggle, auth CTA (Login/Register or avatar dropdown)
- **Mobile nav**: bottom sheet drawer
- **Footer**: brand, contact (placeholder), legal (placeholder), social
- **Account shell**: left sidebar (Profil, Kiralamalarım, Ödemelerim, Ayarlar), main content
- **Admin shell**: collapsible sidebar (Panel, Markalar, Modeller, Araçlar, Kiralamalar, Ödemeler, Kullanıcılar), top bar with user info

## 8. Visual identity (overview — full in BRANDING.md)

- **Mood**: Premium dark-first, deep navy + electric accent. Linear/Vercel adjacency.
- **Type**: Inter (UI/body), Geist Mono (numerals)
- **Tokens**: oklch-based, dark default
- **Motion**: 200–280 ms ease-out, springs only for sheets/dialogs

## 9. Acceptance criteria (per surface)

### `/cars` — catalog
- ✅ Loads with default filter, page 0, size 20
- ✅ Selecting brand filter updates URL `?brandId=…`, refetches
- ✅ Combining brand + price range works (server filters server-side)
- ✅ Pagination preserves filters in URL
- ✅ Empty result state shows reset CTA
- ✅ 429 banner with countdown
- ✅ Skeleton grid before data lands
- ✅ Mobile: bottom-sheet filter opens with backdrop

### `/cars/[id]` — detail
- ✅ Gallery renders all images, primary first
- ✅ Lightbox opens on click, closes on Esc + click outside
- ✅ Date picker rejects past dates, requires endDate > startDate
- ✅ Live price computes correctly
- ✅ Unauthenticated CTA redirects to `/login?redirect=…`
- ✅ Authenticated CTA creates rental, redirects to `/checkout`
- ✅ 422 conflict surfaced inline

### Booking flow
- ✅ Idempotency UUID stable across retries within same checkout session
- ✅ Confirmation polls and updates without refresh
- ✅ Receipt links to payment detail

### Admin image management
- ✅ Drag to reorder works on desktop and mobile (touch + mouse)
- ✅ Upload > 5 MB rejected client-side with friendly message
- ✅ Wrong MIME rejected client-side
- ✅ Server-side magic-byte rejection surfaced if it slips through
- ✅ Set primary updates UI immediately

## 10. Known gaps & assumptions

| ID | Gap | Resolution |
|---|---|---|
| GAP-1 | `PUT /users/{id}` exists but is admin-only (`UpdateUserRequest`). No customer self-update endpoint. | `/account/settings` profile fields shown read-only with "Bilgilerinizi güncellemek için destek ekibi" message until backend adds it. |
| GAP-2 | No `/auth/me` endpoint. | Decode user metadata from JWT payload at login response (`AuthResponse` includes `userId, email, role`). Store decoded values in non-httpOnly `veyra_user` cookie (id+email+role only — no token). |
| GAP-3 | Rental status enum mismatch — `RentalResponse.status` enum is `ACTIVE|COMPLETED|CANCELLED` but description mentions `PENDING` and `CONFIRMED`. | Treat backend response as truth; UI displays whatever status is returned. Confirmation page polls until status transitions away from initial value. |
| GAP-4 | No way to fetch a single user by self. | Use cached `AuthResponse.userId/email` for profile display. |

## 11. Success metrics

- **Activation**: % of visitors who reach `/cars/[id]` from `/`
- **Booking funnel**: detail → checkout → confirmation conversion
- **Admin efficiency**: time-to-create-car (< 90 s for full form)
- **Tech**: 0 console errors in production, 0 axe critical issues
