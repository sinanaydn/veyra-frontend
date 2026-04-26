# Veyra RentACar Frontend — Tasks

> **The Work.** Ordered, dependency-respecting work items. Each task is single-session-completable by Claude Code with full context.

Legend: ▢ pending · ✓ done · 🔴 blocking · 🟡 unblocks parallel work

---

## Phase 0 — Scaffolding (foundation)

### T-001 ▢ 🔴 Initialize Next.js 15 project
- `cd C:\Veyra-RentACar\veyra-frontend`
- `pnpm create next-app@latest . --ts --app --tailwind --eslint --src-dir --import-alias "@/*" --no-turbopack`
- Choose: App Router yes, TypeScript yes, Tailwind yes, ESLint yes, src/ yes, App Router yes, custom alias `@/*`
- Verify `pnpm dev` boots at :3000
- **Deliverable:** scaffolded app with Tailwind v4

### T-002 ▢ 🔴 Install all dependencies
```
pnpm add @tanstack/react-query @tanstack/react-query-devtools @tanstack/react-table \
  zustand nuqs axios react-hook-form @hookform/resolvers zod framer-motion \
  lucide-react date-fns @dnd-kit/core @dnd-kit/sortable sonner uuid \
  class-variance-authority clsx tailwind-merge
pnpm add -D @types/uuid
```
- Verify `package.json` lockfile updated
- **Deliverable:** all runtime deps present

### T-003 ▢ Configure shadcn/ui
- `pnpm dlx shadcn@latest init` (style: default, base color: slate, css vars: yes)
- `pnpm dlx shadcn@latest add button input label card dialog sheet dropdown-menu select \
  table badge skeleton separator tabs accordion avatar tooltip switch checkbox \
  radio-group textarea form alert-dialog command popover calendar`
- **Deliverable:** `src/components/ui/*` populated

### T-004 ▢ Configure global styles & theme tokens
- Replace `src/app/globals.css` with the `@theme` block from IMPLEMENTATION.md §5.1
- Add `prefers-reduced-motion` rule
- Set `<html>` default `data-theme="dark"` in `src/app/layout.tsx`
- Inter via `next/font/google`, Geist Mono self-host (`@next/font/local`) or via `geist` package
- **Deliverable:** dark default with tokens applied; toggling `data-theme="light"` flips colors

### T-005 ▢ Environment & config
- Create `.env.local` with `BACKEND_URL=http://localhost:8080`
- Create `.env.example` mirroring
- Update `next.config.ts` with `images.remotePatterns` for backend storage host (placeholder: `localhost`, `*.amazonaws.com`)
- **Deliverable:** env vars work in route handlers

---

## Phase 1 — Core libraries (no UI yet)

### T-010 ▢ 🔴 API envelope + types + errors
- Create `src/lib/api/envelope.ts` from IMPL §4.1
- Create `src/lib/api/types.ts` from IMPL §4.2 (full types — auth, brand, model, car, image, rental, payment, user, page response)
- Create `src/lib/api/errors.ts` from IMPL §4.3 with full TR map
- Create `src/lib/utils.ts` with `cn()` helper
- **Deliverable:** types compile, no runtime yet

### T-011 ▢ 🔴 Axios client
- Create `src/lib/api/client.ts` from IMPL §4.4 (refresh queue interceptor)
- **Deliverable:** `http` instance ready

### T-012 ▢ 🔴 Resource modules
Create one file per resource under `src/lib/api/resources/`:
- `auth.ts` — register, login, refresh, logout (call `/api/auth/*` not `/api/proxy`)
- `brands.ts` — list, byId, create, update, remove
- `models.ts` — list (with brandId filter), byId, create, update, remove
- `cars.ts` — list, byId, create, update, remove
- `carImages.ts` — listByCar, upload (FormData), reorder, setPrimary, remove
- `rentals.ts` — list (admin), my, byId, create, cancel, complete
- `payments.ts` — list (admin), my, byId, pay (with idempotency header param)
- `users.ts` — list (admin), byId, update, remove (admin), deleteSelf
- `admin.ts` — changeRole
- **Deliverable:** all endpoints typed and callable

### T-013 ▢ Validators (zod)
- Create `src/lib/validators.ts` with: `loginSchema`, `registerSchema`, `carFormSchema`, `brandFormSchema`, `modelFormSchema`, `rentalDateSchema`, `userUpdateSchema`
- Mirror exact backend constraints (password regex, phone, lengths, mins/maxes)
- **Deliverable:** schemas exported, used later in forms

### T-014 ▢ Format helpers
- Create `src/lib/format.ts` — `currencyTRY`, `formatDate`, `formatDateRange`, `daysBetween`, `formatDateTime`
- Use `Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })`
- date-fns with `tr` locale
- **Deliverable:** unit-testable helpers

### T-015 ▢ TR messages catalog
- Create `src/messages/tr.ts` with namespaced UI strings: `common`, `nav`, `auth`, `cars`, `booking`, `account`, `admin`, `errors`
- All hardcoded strings in components must reference this file
- **Deliverable:** central copy source

### T-016 ▢ RBAC helpers
- Create `src/lib/rbac.ts`:
  - `readSession()` — server-side helper using `cookies()`
  - `requireRole(role)` — server-side throw
- **Deliverable:** server components can guard role

---

## Phase 2 — BFF (auth proxy + middleware)

### T-020 ▢ 🔴 Auth route handlers
- `src/app/api/auth/login/route.ts` — IMPL §4.6
- `src/app/api/auth/register/route.ts` — same pattern, set cookies on success
- `src/app/api/auth/refresh/route.ts` — read `veyra_rt`, call upstream, rotate cookies
- `src/app/api/auth/logout/route.ts` — call upstream with refresh token, clear all `veyra_*` cookies
- **Deliverable:** auth flow works without exposing tokens to JS

### T-021 ▢ 🔴 Proxy route handler
- `src/app/api/proxy/[...path]/route.ts` — IMPL §4.5
- Add 401-with-TOKEN_INVALID retry: refresh and re-call upstream once
- **Deliverable:** any backend call works via `/api/proxy/cars`, `/api/proxy/rentals/my`, etc.

### T-022 ▢ 🔴 Middleware (edge guards)
- `src/middleware.ts` — IMPL §4.7
- **Deliverable:** unauthorized hits redirect; admin routes 404 for non-admins

### T-023 ▢ Auth store + hydration
- `src/store/auth.ts` from IMPL §4.8
- Create `<AuthHydrator>` component that calls `useAuth.hydrate()` on mount
- **Deliverable:** client-side knows user identity post-login

---

## Phase 3 — Providers & root layout

### T-030 ▢ 🔴 QueryProvider
- `src/providers/QueryProvider.tsx` with QueryClient, default retry: 1, staleTime: 30 s
- Mount Devtools in dev only
- **Deliverable:** TanStack Query available everywhere

### T-031 ▢ ThemeProvider
- `src/providers/ThemeProvider.tsx` — read localStorage on mount, set `<html data-theme>`, expose `useTheme()`
- Avoid SSR flash: inline script in `<head>` to set `data-theme` before paint
- **Deliverable:** theme persists, no flash

### T-032 ▢ AppProviders + root layout
- `src/providers/AppProviders.tsx` composes Query + Theme + Sonner toaster + AuthHydrator + nuqs adapter
- `src/app/layout.tsx` — root: html lang="tr", body, fonts, providers, skip-to-content
- **Deliverable:** root layout renders providers correctly

### T-033 ▢ Root error.tsx + not-found.tsx
- `src/app/error.tsx` — generic error with retry
- `src/app/not-found.tsx` — branded 404 page
- **Deliverable:** error UX baseline

---

## Phase 4 — Layout shells

### T-040 ▢ Header (public + customer)
- `src/components/layout/Header.tsx` — logo, nav links, theme toggle, auth state CTA
- Sticky, glass effect on scroll, mobile drawer trigger
- **Deliverable:** header works on all marketing/account routes

### T-041 ▢ Footer
- `src/components/layout/Footer.tsx` — brand, quick links, contact placeholder, copyright
- **Deliverable:** footer renders on marketing routes

### T-042 ▢ MobileNav
- `src/components/layout/MobileNav.tsx` — Sheet-based drawer
- **Deliverable:** mobile navigation accessible

### T-043 ▢ ThemeToggle
- `src/components/layout/ThemeToggle.tsx` — sun/moon icon button, smooth transition
- **Deliverable:** instant theme switch

### T-044 ▢ AccountShell
- `src/components/layout/AccountShell.tsx` — left sidebar (Profil, Kiralamalarım, Ödemelerim, Ayarlar)
- Used by `(account)/account/layout.tsx`
- **Deliverable:** account section shell

### T-045 ▢ AdminShell
- `src/components/layout/AdminShell.tsx` — collapsible sidebar (Panel, Markalar, Modeller, Araçlar, Görseller, Kiralamalar, Ödemeler, Kullanıcılar)
- Top bar with user email + logout
- Used by `(admin)/admin/layout.tsx`
- **Deliverable:** admin shell with active route highlight

---

## Phase 5 — Marketing surfaces

### T-050 ▢ Landing page
- `src/app/(marketing)/page.tsx` + components: `Hero`, `SearchBar`, `FeaturedCars`, `BrandStrip`, `ValueProps`
- Hero: headline "Lüksü kirala. Anında yola çık.", subheadline, CTA → `/cars`
- SearchBar: brand, date range, "Ara" → push `/cars?brandId=…&…`
- FeaturedCars: server-side `cars.list({ size: 6, sort: 'createdAt,desc' })`
- BrandStrip: server-side `brands.list()`, horizontal scroll on mobile
- **Deliverable:** premium landing renders fast

### T-051 ▢ Catalog page (`/cars`)
- `src/app/(marketing)/cars/page.tsx` (client component for filter interactivity)
- Filter sidebar (desktop) / sheet (mobile): brand select, model select (depends on brand), price slider, year slider, fuel chips, transmission chips, availability switch
- Active filter chips bar
- `<CarGrid>` — responsive grid (1/2/3/4 cols)
- `<CarCard>` — image, brand·model, year/transmission/fuel pills, daily price, availability badge, hover lift
- `<Pagination>` — first/prev/next/last + page select
- Sort dropdown
- Skeleton state, empty state, 429 banner
- URL-synced via nuqs (IMPL §4.10)
- **Deliverable:** working catalog with all filters

### T-052 ▢ Car detail (`/cars/[id]`)
- `src/app/(marketing)/cars/[id]/page.tsx`
- `<CarGallery>` — primary first, lightbox (Dialog), swipe (Framer Motion)
- `<CarSpecsGrid>` — labeled icons + values
- Description block
- `<BookingWidget>` (sticky right rail / sticky bottom on mobile)
  - `<DateRangePicker>` (Calendar component, range mode, disable past)
  - Live total: `dailyPrice × days`
  - "Kirala" CTA → unauth → `/login?redirect=…`; auth → `POST /rentals` → push `/checkout/[rentalId]`
  - Surface 422 inline
- Similar cars row (same brand)
- **Deliverable:** end-to-end booking initiation works

### T-053 ▢ Brands index + detail
- `/brands/page.tsx` — grid of brand tiles
- `/brands/[id]/page.tsx` — brand info + models list + cars grid filtered by brandId
- **Deliverable:** brand browse path works

---

## Phase 6 — Auth surfaces

### T-060 ▢ Login page
- `src/app/(auth)/layout.tsx` — centered card layout
- `src/app/(auth)/login/page.tsx` — email + password form (RHF + zod)
- Surface `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED` (persistent banner), `RATE_LIMIT_EXCEEDED` (toast + 60-s countdown)
- "Şifremi unuttum" link → `/login` (no backend; tooltip "Yakında")
- Redirect to `?redirect=` or `/account` on success
- **Deliverable:** login flow works

### T-061 ▢ Register page
- `src/app/(auth)/register/page.tsx` — full form per `RegisterRequest`
- Password meter (live regex satisfaction)
- Phone optional, format hint
- Surface `EMAIL_ALREADY_EXISTS` inline on field
- **Deliverable:** registration works, auto-logs in

---

## Phase 7 — Customer account

### T-070 ▢ Account layout + profile
- `src/app/(account)/account/layout.tsx` (server component, reads session)
- `src/app/(account)/account/page.tsx` — profile snapshot from session
- **Deliverable:** /account renders for logged-in user

### T-071 ▢ My rentals
- `src/app/(account)/account/rentals/page.tsx` — paged list (page, size, sort)
- `<RentalRow>` — car name (cached `useCar(carId)`), date range, total, status badge, actions
- Empty state, loading skeleton
- **Deliverable:** customer sees their rentals

### T-072 ▢ Rental detail + cancel
- `src/app/(account)/account/rentals/[id]/page.tsx` — full rental info + car snapshot + payment status (`useMyPayments` filtered by rentalId)
- "İptal Et" with `<ConfirmDialog>` → `useCancelRental` (optimistic)
- "Şimdi Öde" if PENDING → push `/checkout/[id]`
- **Deliverable:** cancel + pay-now flows work

### T-073 ▢ Payments list + receipt
- `src/app/(account)/account/payments/page.tsx` — paged list
- `src/app/(account)/account/payments/[id]/page.tsx` — receipt view via `<PaymentReceipt>`
- **Deliverable:** payment history works

### T-074 ▢ Settings + delete account
- `src/app/(account)/account/settings/page.tsx` — read-only profile (per GAP-1) + "Hesabımı sil" danger zone
- Email re-entry confirm → `users.deleteSelf()` → clear cookies → push `/`
- **Deliverable:** account deletion works

---

## Phase 8 — Booking flow

### T-080 ▢ Checkout page
- `src/app/(booking)/checkout/[rentalId]/page.tsx`
- Fetch rental detail; if not PENDING, redirect to confirmation
- `<MockCardForm>` (cosmetic): card number, exp, CVC, name (no validation beyond format)
- "Ödemeyi Tamamla" → `usePay(rentalId)` with idempotency UUID → push confirmation
- Booking summary card (car, dates, total)
- **Deliverable:** payment submits with idempotency

### T-081 ▢ Confirmation page
- `src/app/(booking)/booking/[rentalId]/confirmation/page.tsx`
- Poll `useCar(rental.carId)` + `useRental(rentalId)` every 2 s, max 15 s
- Animated success state (Framer Motion checkmark)
- Receipt link, "Kiralamalarıma git" CTA
- **Deliverable:** confirmation completes UX loop

---

## Phase 9 — Admin console

### T-090 ▢ Admin dashboard
- `src/app/(admin)/admin/page.tsx` — stat cards (totalRentals, totalPayments, recentActivity)
- Use `rentals.list({ size: 5 })` + `payments.list({ size: 5 })`
- **Deliverable:** admin home with snapshot

### T-091 ▢ Admin DataTable primitive
- `src/components/admin/DataTable.tsx` — TanStack Table headless wrapper
- Server-side pagination (controlled state synced to nuqs)
- Column-defined cells, row actions slot, loading skeleton, empty state
- **Deliverable:** reusable admin table

### T-092 ▢ Admin Brands
- `src/app/(admin)/admin/brands/page.tsx` — DataTable
- "Marka Ekle" → Dialog with form
- Row actions: Düzenle (Dialog), Sil (ConfirmDialog)
- **Deliverable:** brand CRUD works

### T-093 ▢ Admin Models
- `src/app/(admin)/admin/models/page.tsx` — DataTable
- Brand filter dropdown (cascades to model list)
- Create/Edit Dialog — brand select + name
- **Deliverable:** model CRUD works

### T-094 ▢ Admin Cars list
- `src/app/(admin)/admin/cars/page.tsx` — DataTable with filters (brand, status)
- Row actions: Düzenle, Görseller, Sil
- **Deliverable:** admin can browse/manage cars

### T-095 ▢ Admin Cars create/edit
- `src/app/(admin)/admin/cars/new/page.tsx` — full `<CarForm>`
- `src/app/(admin)/admin/cars/[id]/edit/page.tsx` — same form, prefilled
- Brand → Model cascade
- All fields per `CreateCarRequest` / `UpdateCarRequest`
- **Deliverable:** car form works create + edit

### T-096 ▢ Admin Car Images
- `src/app/(admin)/admin/cars/[id]/images/page.tsx`
- `<ImageDropzone>` — multipart upload, queue, per-file progress, client-side type+size check, surface server magic-byte error
- `<ImageReorderGrid>` — dnd-kit grid, drag to reorder, click thumbnail menu: "Kapak Yap", "Sil"
- Optimistic state for reorder, setPrimary
- Max 10 / car — disable upload past limit with note
- **Deliverable:** full image management works

### T-097 ▢ Admin Rentals
- `src/app/(admin)/admin/rentals/page.tsx` — DataTable, userId filter input (numeric, debounced)
- Row actions: Tamamla (if appropriate), İptal Et
- **Deliverable:** admin can moderate rentals

### T-098 ▢ Admin Payments
- `src/app/(admin)/admin/payments/page.tsx` — DataTable, userId filter
- Read-only (no actions in API)
- **Deliverable:** payment audit view

### T-099 ▢ Admin Users
- `src/app/(admin)/admin/users/page.tsx` — DataTable
- Row actions: Rol Değiştir (`<RoleSwitch>`), Sil (ConfirmDialog)
- Block self-demote / self-delete via UI
- **Deliverable:** user management works

---

## Phase 10 — Polish

### T-100 ▢ Empty + skeleton + error states audit
- Walk every list/detail surface, ensure all three states present
- **Deliverable:** no blank/loading-spinner anywhere

### T-101 ▢ Error boundaries per route group
- Add `error.tsx` to each `(group)/` and `admin/` segment
- **Deliverable:** localized error UX

### T-102 ▢ A11y pass
- Run axe DevTools on each route
- Fix all critical/serious issues
- Test full keyboard nav: Tab, Shift+Tab, Esc, arrow keys in menus
- **Deliverable:** 0 critical issues

### T-103 ▢ Performance pass
- Run Lighthouse mobile on `/`, `/cars`, `/cars/[id]`, `/login`
- Hit targets from SPEC §6 NFR-PERF
- Verify `next/image` everywhere; lazy-load below-fold
- **Deliverable:** scores documented in PR

### T-104 ▢ Cross-browser smoke
- Chrome, Safari, Firefox, mobile Safari (iPhone simulator)
- **Deliverable:** no major visual regressions

### T-105 ▢ README + dev docs
- `README.md`: setup, env vars, scripts, architecture overview
- **Deliverable:** new contributor can run locally in < 5 min

---

## Parallelization map

After Phase 0–3 complete (must be sequential), the following can run in parallel:
- Phase 5 (marketing) | Phase 6 (auth) | Phase 7 (account) | Phase 9 (admin) — different file sets, low conflict risk
- Phase 8 (booking) needs Phase 5 + 6 first
- Phase 10 (polish) is last

## Summary

- **Total tasks:** ~50
- **Critical path:** T-001 → T-002 → T-003 → T-010 → T-011 → T-012 → T-020 → T-021 → T-022 → T-030 → T-032 → T-051 → T-052 → T-060 → T-080 → T-081
- **Estimated sessions for a single Claude Code agent:** 8–12 working sessions
- **With parallel agents post-Phase 3:** 4–6 sessions
