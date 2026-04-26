# Veyra RentACar — Brand & Visual Identity

> **Identity.** Voice, type, color, motion. The system everything in the UI snaps to.

---

## 1. Brand essence

**Veyra** — clean, modern, slightly Latin (*vera* → "true"). Premium without being ostentatious. The Turkish luxury-mobility brand for people who care about how things feel, not just what they cost.

| Trait | Yes | No |
|---|---|---|
| Tone | Confident, precise, warm | Loud, salesy, clichéd |
| Aesthetic | Minimal, deep, luminous | Skeuomorphic, glossy, busy |
| Pace | Measured, deliberate | Twitchy, parallax-heavy |
| Voice | Knowing, helpful, plain | Corporate, jargony, formal |

**Mood reference:** Linear · Vercel · Stripe · Porsche.com · Range Rover digital · Apple Wallet

## 2. Logo & wordmark

(No final logo yet — placeholder treatment)

- **Wordmark:** "Veyra" set in **Inter Display Tight** (or Inter with `letter-spacing: -0.04em`), weight 600, optical alignment with chevron mark
- **Mark:** small custom chevron (`>`) angled 65° suggesting forward motion
- **Lockup:** mark + wordmark with 8 px gap on a 32 px height grid
- **Clear space:** 1× wordmark x-height on all sides
- **Min size:** wordmark only ≥ 80 px wide; lockup ≥ 24 px tall

## 3. Color system

### 3.1 Dark theme (default)

| Token | Value (oklch) | Hex approx | Use |
|---|---|---|---|
| `--color-bg` | `oklch(0.13 0.02 250)` | `#0A0E14` | Page background |
| `--color-surface` | `oklch(0.17 0.02 250)` | `#11161E` | Cards, surfaces |
| `--color-surface-2` | `oklch(0.21 0.02 250)` | `#181E28` | Elevated surfaces, popovers |
| `--color-border` | `oklch(0.27 0.02 250 / 0.6)` | `#262E3B99` | Subtle dividers |
| `--color-fg` | `oklch(0.98 0.01 250)` | `#F7F8FA` | Primary text |
| `--color-muted` | `oklch(0.65 0.02 250)` | `#8A93A4` | Secondary text |
| `--color-primary` | `oklch(0.22 0.06 250)` | `#0F1B33` | Deep navy — buttons, dark surfaces |
| `--color-accent` | `oklch(0.65 0.18 255)` | `#3D7BFF` | Electric blue — CTAs, focus rings |
| `--color-accent-fg` | `oklch(0.99 0 0)` | `#FFFFFF` | Text on accent |
| `--color-success` | `oklch(0.74 0.18 150)` | `#22C770` | Confirmations |
| `--color-danger` | `oklch(0.65 0.22 25)` | `#EE4A3A` | Errors, destructive |
| `--color-warning` | `oklch(0.78 0.16 80)` | `#F0B400` | Warnings, rate limits |

### 3.2 Light theme

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `oklch(0.99 0 0)` | Page background |
| `--color-surface` | `oklch(0.97 0 0)` | Cards |
| `--color-surface-2` | `oklch(0.95 0 0)` | Elevated |
| `--color-border` | `oklch(0.85 0.005 250)` | Dividers |
| `--color-fg` | `oklch(0.15 0.02 250)` | Primary text |
| `--color-muted` | `oklch(0.45 0.02 250)` | Secondary text |
| `--color-primary` | `oklch(0.22 0.06 250)` | Same — brand consistency |
| `--color-accent` | `oklch(0.55 0.20 255)` | Slightly deeper for AA on white |

### 3.3 Contrast guarantees (AA)

- fg / bg: ≥ 14:1 dark, ≥ 14:1 light
- muted / bg: ≥ 4.5:1 in both themes
- accent-fg / accent: ≥ 4.5:1
- All status colors paired with icon + text (never color alone)

### 3.4 Usage rules

- **One accent color.** Never two competing brand hues. Status colors are functional, not decorative.
- **80/15/5:** ~80% surface neutrals, ~15% navy primary, ~5% electric accent. Accent draws the eye to ONE thing per view (the primary CTA).
- **No gradients on text.** Use solid `--color-fg` always.
- **Subtle accent gradients OK** for hero glow / decorative blobs (10–15% opacity).

## 4. Typography

### 4.1 Type stack

| Role | Family | Weights |
|---|---|---|
| UI / body | **Inter** (variable) | 400, 500, 600, 700 |
| Display (optional) | **Inter Display** (or Inter @ tight tracking) | 600, 700 |
| Numerical (prices, IDs, dates) | **Geist Mono** | 400, 500 |

### 4.2 Scale (Tailwind tokens)

| Token | px | Use |
|---|---|---|
| `text-xs` | 12 | Captions, microcopy |
| `text-sm` | 14 | Secondary UI |
| `text-base` | 16 | Body |
| `text-lg` | 18 | Lead paragraph |
| `text-xl` | 20 | Section sub-heading |
| `text-2xl` | 24 | Card title |
| `text-3xl` | 30 | Page title |
| `text-4xl` | 36 | Hero subhead |
| `text-5xl` | 48 | Hero |
| `text-6xl` | 60 | Hero (desktop) |
| `text-7xl` | 72 | Marketing display |

### 4.3 Tracking

- Display ≥ 36 px → `tracking-tight` (-0.02em)
- Display ≥ 60 px → `tracking-tighter` (-0.04em)
- Mono prices → `tracking-tight` for compact look
- All caps eyebrow labels → `tracking-widest` (0.1em), `text-xs`, `font-medium`, uppercase

### 4.4 Line height

- Display: `leading-[1.05]`
- Body: `leading-relaxed` (1.625)
- Dense data (tables): `leading-tight`

## 5. Spacing & layout

- **Base unit:** 4 px (Tailwind default)
- **Section padding:** `py-16 md:py-24 lg:py-32` for marketing
- **Card padding:** `p-6` default, `p-8` for hero cards
- **Page max-width:** `max-w-7xl` (1280) center; marketing hero `max-w-screen-2xl`
- **Gutter:** `px-4 md:px-6 lg:px-8`
- **Grid:** 12-col on desktop, 4-col on tablet, fluid stack on mobile

## 6. Radius & elevation

| Element | Radius |
|---|---|
| Buttons, inputs | `rounded-md` (10 px) |
| Cards | `rounded-xl` (16 px) |
| Hero cards, dialogs | `rounded-2xl` (20 px) |
| Pills, chips | `rounded-full` |

**Shadows in dark:** rely on borders + surface-2 layering. Use shadow only on dialogs/popovers:
- `shadow-xl shadow-black/40`

**Shadows in light:**
- Cards: `shadow-sm` (subtle)
- Hover: `shadow-md`
- Dialogs: `shadow-2xl`

## 7. Motion language

### 7.1 Principles

1. **Earn every animation.** Each motion has a functional reason (state change, hierarchy reveal, spatial continuity).
2. **Spring for surfaces, ease for content.** Sheets, dialogs, tooltips → spring. Fade/slide → `ease-out`.
3. **Reduced motion is default for some users.** All non-essential motion gated behind `prefers-reduced-motion`.

### 7.2 Tokens

| Purpose | Easing | Duration |
|---|---|---|
| Hover | `ease-out` | 150 ms |
| Focus ring | `ease-out` | 120 ms |
| Modal/Sheet enter | spring `(stiffness: 300, damping: 30)` | — |
| Page transition | `ease-out` + view transitions API | 280 ms |
| Skeleton shimmer | linear | 1500 ms loop |
| Card hover lift | `ease-out` | 200 ms |
| Toast | spring `(stiffness: 350, damping: 32)` | — |

### 7.3 Patterns

- **Card hover (cars):** `translateY(-2px)`, accent border opacity 0.4 → 1, no shadow change in dark
- **Image gallery:** Framer Motion `layoutId` for thumbnail → lightbox transition
- **Booking widget price:** `<motion.span key={total}>` with fade-up on change
- **Confirmation success:** SVG checkmark stroke draw + scale spring

## 8. Iconography

- **Library:** lucide-react
- **Stroke:** 1.5 px (default in lucide)
- **Size scale:** 14, 16, 18, 20, 24, 32 px
- **Color:** inherits text color; never colored except status (success/danger/warning)
- **Pairing:** always with text label (a11y — screen-reader users)

## 9. Imagery

### 9.1 Car photography

- **Mode:** clean studio or environmental (clean garage, urban backdrop). No clichéd "winding road" stock.
- **Crop:** 3:4 portrait for cards, 16:9 for hero, square for thumbnails
- **Treatment:** subtle vignette in dark theme (`linear-gradient(to bottom, transparent 60%, var(--color-bg) 100%)`)
- **Format:** AVIF preferred, WebP fallback (handled by `next/image`)

### 9.2 Brand illustrations

- Avoid generic "delivery truck" mascots
- Use abstract geometric motion lines for empty states (single-color SVG, accent at 60% opacity)

## 10. Component visual specs (highlights)

### CarCard
- Surface: `bg-surface border border-border rounded-xl p-0 overflow-hidden`
- Image: aspect-[4/3], object-cover
- Hover: `hover:border-accent/40 hover:-translate-y-0.5 transition`
- Body: `p-5` — brand·model in `text-base font-semibold`, specs row in `text-xs text-muted`
- Price: `font-mono text-xl font-semibold` + " ₺ / gün" in `text-sm text-muted`
- Status badge: top-right absolute, frosted bg

### Button (primary)
- `bg-accent text-accent-fg`
- `hover:brightness-110 active:brightness-95`
- `focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-bg`
- `h-10 px-5 rounded-md font-medium`
- Disabled: 40% opacity, cursor-not-allowed

### Status badges
| Status | bg | fg |
|---|---|---|
| AVAILABLE / CONFIRMED | `success/15` | `success` |
| RENTED / ACTIVE | `accent/15` | `accent` |
| MAINTENANCE / PENDING | `warning/15` | `warning` |
| CANCELLED / FAILED | `danger/15` | `danger` |
| COMPLETED | `muted/15` | `muted` |

### Form field
- Label: `text-sm font-medium`
- Input: `bg-surface-2 border border-border h-10 rounded-md px-3 focus:border-accent focus:ring-2 ring-accent/20`
- Error: `border-danger`, helper text `text-xs text-danger mt-1`
- Required: subtle `text-danger` asterisk after label

## 11. Voice & copy

### 11.1 Voice principles

- **Plain Turkish, not formal.** "Hesabını sil" not "Hesabınızı silmek üzeresiniz".
- **Imperative for CTAs.** "Kirala", "Ara", "Devam et" — direct verbs.
- **Specific, not breathless.** "Toyota Corolla 2024 — günlük 1.200 ₺" beats "İnanılmaz fırsat!".
- **Numerals where it counts.** "5 dk içinde rezerve et" not "beş dakika".

### 11.2 Reusable copy patterns

| Surface | Copy |
|---|---|
| Hero headline | "Lüksü kirala. Anında yola çık." |
| Hero sub | "Premium araç filomuzda saniyeler içinde rezerve et, kapına teslim al." |
| CTA primary | "Aracını seç" / "Kirala" / "Ödemeyi tamamla" |
| Empty cars | "Bu kriterlere uygun araç bulunamadı." + "Filtreleri sıfırla" |
| Rate limit | "Çok hızlı geziniyorsun. {n} sn sonra tekrar dene." |
| Login error | "E-posta veya şifre hatalı." |
| Account locked | "Hesabın 5 hatalı denemenin ardından kilitlendi. 30 dk sonra tekrar dene." |
| Date conflict | "Seçtiğin tarihler bu araç için dolu. Başka tarihler dene." |
| Confirmation | "Hazır! Anahtarın seni bekliyor." |

### 11.3 Tone matrix

| Context | Tone | Example |
|---|---|---|
| Marketing | Confident, aspirational | "Yola çıkmaya hazır mısın?" |
| Transactional | Clear, neutral | "Ödemen onaylandı." |
| Error | Helpful, no-blame | "Bu tarihler dolu — başka tarih dene." |
| Admin | Functional, terse | "3 görsel yüklendi." |

## 12. Accessibility brand commitment

- Every visual decision validated against AA (text), AAA where possible (icons paired with labels)
- Focus visible, never removed
- No color-only signals (always icon + text + color)
- Motion respects `prefers-reduced-motion`
- Touch targets ≥ 44 px

## 13. Asset inventory (to produce)

- [ ] favicon (light + dark)
- [ ] og:image (1200×630) — hero with wordmark + accent gradient
- [ ] apple-touch-icon (180)
- [ ] PWA icons (192, 512)
- [ ] Empty-state illustrations (cars/rentals/payments) — single-color SVG
- [ ] 404 illustration
- [ ] Favicons via realfavicongenerator pattern

## 14. Don'ts

- ❌ Multiple accent colors competing for attention
- ❌ Drop shadows on text
- ❌ Italic body copy (Inter italics are technically fine but break the modernist feel)
- ❌ Page-wide gradients
- ❌ Auto-playing video on landing
- ❌ Animated gradient text on CTAs
- ❌ Stock photography of "happy diverse business people"
- ❌ Skeuomorphic shadows under cards in dark mode
