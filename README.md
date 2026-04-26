# Chapel Hill Country Club — Member Experience Platform

A 2026-grade member experience platform for **Chapel Hill Country Club** (est. 1922). Built as a fully working demo intended to replace the existing ClubEssential white-label app, then activated against the live ClubEssential backend once the club signs.

This repository contains **Phase 1** — the foundation. Member-facing surfaces, dining and tee-time flows, AI concierge, staff dashboard, and live ClubEssential integration arrive in subsequent phases.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Generate brand icons (one-time, after install)
npm run icons:build

# 3. Configure env (Supabase optional in Phase 1)
cp .env.example .env.local
#   At minimum, leave NEXT_PUBLIC_ADAPTER_MODE=mock to use sample data.
#   For magic-link auth to actually deliver email, set
#   NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.

# 4. Generate the Prisma client (only once Supabase is wired)
npx prisma generate

# 5. Run the dev server
npm run dev
# → http://localhost:3000
```

The marketing landing page is public. `/login` works in mock mode without Supabase — it identifies the member via the adapter and surfaces a clear demo-mode message instead of dispatching email.

---

## Architecture overview

The platform is built around four ideas, in order of importance.

### 1. The adapter pattern

**Every read or write of member data goes through `getAdapter()`** (in `lib/adapter/index.ts`). Components, route handlers, and server actions never read `data/mock/*` directly and never call ClubEssential's HTTP API directly.

Two implementations exist:

| Adapter       | File                  | Used by                                                                                             |
| ------------- | --------------------- | --------------------------------------------------------------------------------------------------- |
| `MockAdapter` | `lib/adapter/mock.ts` | Demo mode. Reads from `data/mock/*.json`. State changes live in memory and reset on cold start.     |
| `LiveAdapter` | `lib/adapter/live.ts` | Production (Phase 5). Stubbed with `NotImplementedError` until ClubEssential API access is granted. |

Both implement the `ClubEssentialAdapter` interface (`lib/adapter/types.ts`). Switching is a single environment variable — see "Switching modes" below. **Adding a new method requires updating the interface and both implementations together.**

### 2. Multi-club ready from day one

Anything that varies between clubs lives in **`club.config.ts`** at the repo root. Brand colors, logo paths, photography, dining venues, course info, courts, pool, staff contacts, integration settings — all here. The same codebase powers additional clubs by swapping this file and dropping new brand assets into `public/club-assets/`.

No file in `app/`, `components/`, or `lib/` (outside `lib/club-config/`) hard-codes anything that belongs in the config.

### 3. Feature flags from day one

`feature-flags.ts` declares every gated capability with a default value and an optional per-club override. `isFeatureEnabled('ai-concierge')` is the only call site needed. Phase 1 ships everything off; phases 2–5 turn on flags as they land.

### 4. Privacy & security

- **Row-level security** on every member-data table in Supabase (policies live in `supabase/` migrations once provisioned — Phase 1 ships only the Prisma schema).
- **Audit log** (`audit_log` table) for every sensitive read/write.
- **No PII in client-side logs** — `lib/analytics.ts` is the single seam for client telemetry, and identification is opt-in.

---

## Switching adapter modes

```bash
# Mock — what every demo / development run uses.
NEXT_PUBLIC_ADAPTER_MODE=mock

# Live — Phase 5 only. Requires ClubEssential credentials.
NEXT_PUBLIC_ADAPTER_MODE=live
CLUBESSENTIAL_API_BASE=https://api.clubessential.com/v1
CLUBESSENTIAL_API_KEY=…
CLUBESSENTIAL_CLUB_ID=…
```

You can confirm the active mode at runtime by hitting `GET /api/adapter`.

If `live` is set without credentials, `getAdapter()` throws with an actionable message — the build won't quietly fall back to mock data in production.

---

## Updating club configuration

Open `club.config.ts` and edit the field. Each section is typed (see `lib/club-config/types.ts`) and the editor will catch mistakes.

To swap brand photography:

1. Drop the new file into `public/club-assets/` using one of these names:
   - `photo-clubhouse.jpg` — used as the hero on marketing + login
   - `photo-golf.jpg` — golf section + about
   - `photo-courts.jpg` — racquets section
   - `photo-pool.jpg` — pool section
   - `photo-dining.jpg` — Main Dining venue card
2. (Optional) override the path in `club.config.ts` → `brand.photography`.
3. Photographs are rendered through `<SmartImage>`, which gracefully falls back to a typographic placeholder if a file is missing — useful while you're collecting final assets.

To swap the logo:

1. Replace `public/club-assets/chcc-monogram.svg`.
2. Run `npm run icons:build` to regenerate the PNG icons (manifest + apple-touch-icon).

---

## Mock data

Generated by `scripts/generate-mock-data.mjs`, deterministic seed `19220926`. Re-run any time:

```bash
node scripts/generate-mock-data.mjs
```

Generated files in `data/mock/`:

| File                | Records | Notes                                                                                                  |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `members.json`      | 200     | Realistic placeholder names (Carolina-flavoured); follow-up will replace with the real club directory. |
| `households.json`   | 130     | Linked to members via `householdId`.                                                                   |
| `reservations.json` | 30      | Spread past / present / future across 3 dining venues.                                                 |
| `events.json`       | 15      | Tournaments, wine dinners, holidays, family events.                                                    |
| `menus.json`        | 70      | Two-week × 3 venues × lunch/dinner. Seasonal items.                                                    |
| `tee-times.json`    | ~550    | Two-week grid, 7:30am–4:30pm, weekend density.                                                         |
| `charges.json`      | 20      | Sample house-account charges for member `M-0001`.                                                      |

The MockAdapter reads these at module load. To customise the demo (e.g. seed a board member's name with reservations), edit the JSON directly — re-running the script regenerates from scratch.

---

## Folder structure

```
chcc/
├── app/
│   ├── (marketing)/        # public landing page
│   ├── (auth)/             # login + magic-link callback
│   ├── (member)/           # member-facing app — Phase 2
│   ├── (staff)/            # staff dashboard — Phase 4
│   ├── api/                # adapter mode probe + auth + webhooks
│   ├── layout.tsx          # root html / fonts / metadata
│   └── manifest.ts         # PWA manifest
├── components/
│   ├── ui/                 # button, input, label — shadcn primitives, restyled
│   ├── brand/              # Wordmark, SmartImage, PhotoFallback
│   └── layouts/
├── lib/
│   ├── adapter/            # interface + MockAdapter + LiveAdapter stub + selector
│   ├── club-config/        # types + loader
│   ├── supabase/           # client / server / middleware
│   ├── prisma.ts
│   ├── auth.ts             # getCurrentUser / getCurrentMember
│   ├── analytics.ts        # PostHog wrapper
│   └── utils.ts
├── prisma/
│   └── schema.prisma       # local-only state — see file header
├── data/
│   └── mock/               # demo data — read by MockAdapter
├── public/
│   ├── club-assets/        # logo + photography
│   └── icons/              # PWA icons (generated by scripts/build-icons.mjs)
├── styles/
│   └── tokens.css          # design tokens — light + dark themes
├── scripts/                # data + icon generators
├── club.config.ts          # active club configuration
├── feature-flags.ts
├── middleware.ts           # auth-gate + Supabase session refresh
└── .env.example
```

---

## Tech stack

| Concern    | Choice                                          |
| ---------- | ----------------------------------------------- |
| Framework  | Next.js 15 (App Router, React 19)               |
| Language   | TypeScript (strict, `noUncheckedIndexedAccess`) |
| Styling    | Tailwind CSS 4 + custom design tokens           |
| Components | shadcn primitives, heavily restyled             |
| Database   | Supabase Postgres + Prisma                      |
| Auth       | Supabase Auth (magic link)                      |
| Storage    | Supabase Storage                                |
| Realtime   | Supabase Realtime                               |
| Animation  | Framer Motion                                   |
| PWA        | Web App Manifest + service worker (next-pwa)    |
| Email      | Resend + React Email                            |
| AI         | Anthropic SDK (Phase 3)                         |
| Errors     | Sentry                                          |
| Analytics  | PostHog                                         |
| Hosting    | Vercel                                          |

---

## What's intentionally not built in Phase 1

Per the project plan, the following land in later phases. Do not add them here:

- Member dashboard / home screen (Phase 2)
- Dining reservation flow (Phase 2)
- Tee time booking (Phase 2)
- Court reservations (Phase 2)
- Member directory UI (Phase 2)
- Events listing + RSVP (Phase 3)
- AI concierge (Phase 3)
- Staff dashboard (Phase 4)
- Payment integration (Phase 5)
- Live ClubEssential API calls (Phase 5)

The adapter interface, mock data, and club config are sized to support all of the above without churn.

---

## Scripts

| Script                | Use                                           |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Start dev server.                             |
| `npm run build`       | Production build.                             |
| `npm run start`       | Run production build.                         |
| `npm run typecheck`   | `tsc --noEmit`.                               |
| `npm run lint`        | Next ESLint.                                  |
| `npm run format`      | Prettier write.                               |
| `npm run db:generate` | Prisma client generation.                     |
| `npm run db:push`     | Push schema to Supabase Postgres.             |
| `npm run icons:build` | Re-rasterise PWA icons from the SVG monogram. |

Husky + lint-staged run Prettier + ESLint on staged `*.ts`/`*.tsx` files at commit.

---

## License

Private. © Chapel Hill Country Club.
