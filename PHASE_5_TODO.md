# Phase 5 — Live Integration TODO

Tracker for everything that must change when ClubEssential API access is granted and the platform graduates from demo to production. Each item has the file path(s), the current shortcut, and what the real fix looks like.

This file is updated as new risks emerge during the build. Do not delete entries — mark them `RESOLVED` with a date and PR link instead.

---

## Critical (must address before any real member touches the system)

### 1. Audit log is in-memory ring buffer

- **Files**: `lib/audit.ts`
- **Current**: 500-entry RAM ring. Resets on every Vercel cold start.
- **Phase 5 fix**: Prisma `audit_log` table (schema TBD). Same `recordAudit()` API; storage swaps from array to `prisma.auditLog.create`. `recentAudits()` becomes a `findMany` query.

### 2. Demo cookie session bypasses Supabase

- **Files**: `lib/session.ts`, `app/(auth)/login/page.tsx`, `app/callback/route.ts`
- **Current**: Signed httpOnly cookie `chcc_demo_member` maps to a Member ID. Magic-link UI is wired but unused.
- **Phase 5 fix**: Flip `getCurrentMember()` to read Supabase session, drop demo cookie path. Confirm `/callback` exchanges magic-link token correctly.

### 3. Mock adapter writes are RAM-only

- **Files**: `lib/adapter/mock.ts`
- **Current**: All `create*` / `update*` / `cancel*` methods push to in-memory buffers. Cold starts wipe them.
- **Phase 5 fix**: LiveAdapter persists via ClubEssential API. MockAdapter stays as-is for local dev.

### 4. LiveAdapter is all `notImpl()` stubs

- **Files**: `lib/adapter/live.ts`
- **Current**: `CeHttpClient` scaffold (bearer auth, X-Club-Id header) is real, but every adapter method throws `NotImplementedError`.
- **Phase 5 fix**: Implement each method against the documented ClubEssential REST endpoints. Set `NEXT_PUBLIC_ADAPTER_MODE=live` only after every method is filled.

### 5. No Prisma schema

- **Files**: `prisma/` (does not exist)
- **Current**: `@prisma/client` and `prisma` are installed; `db:push` would fail with no schema.
- **Phase 5 fix**: Author schema for `audit_log`, `buddy_link`, `notification_pref`, `member_note` (staff-only), `feedback_response`. Generate client, run migrations.

---

## High (production polish)

### 6. Stripe webhook handler is empty

- **Files**: `app/api/webhooks/stripe/route.ts`
- **Current**: Route exists, signature verification scaffolded, but no event handlers.
- **Phase 5 fix**: Implement `checkout.session.completed` → mark RSVP paid + record audit. Implement `payment_intent.payment_failed` → notify member.

### 7. Resend email skips `@example.com`

- **Files**: `lib/email.ts`
- **Current**: Demo addresses are skipped to avoid sending real mail to fake recipients.
- **Phase 5 fix**: Keep skip-list logic but configure real Resend API key. Confirm SPF/DKIM for the club's sending domain.

### 8. Concierge falls back when no `ANTHROPIC_API_KEY`

- **Files**: `lib/concierge/run.ts`
- **Current**: Pattern-matched fallback replies when key missing.
- **Phase 5 fix**: Set real key in production env; remove or downgrade fallback to a "service unavailable" graceful state.

### 9. Voice input is placeholder UI only (Phase 6K)

- **Files**: `app/(member)/concierge/page.tsx` (when 6K lands)
- **Current**: Mic icon + waveform UI, no actual transcription wired.
- **Phase 5 fix**: Wire OpenAI Whisper API. Add `OPENAI_API_KEY` env var. Stream transcription back into the message composer.

### 10. Weather, course conditions, dining service status are mock

- **Files**: TBD when 6C lands (home screen banner)
- **Current**: Hardcoded values for the demo.
- **Phase 5 fix**: Wire real weather API (OpenWeather or NOAA), grounds-keeper input feed for course status, F&B dashboard for service status.

---

## Medium (nice-to-haves on the live path)

### 11. PWA push notifications scaffold only

- **Files**: PWA manifest exists, service-worker push subscribe flow does not
- **Phase 5 fix**: Wire web-push protocol. Add `notification_pref` schema entries.

### 12. Pre-dining and post-dining email cron is placeholder

- **Files**: TBD when 6D.8 / 6D.9 land
- **Current**: Email templates designed; no scheduler.
- **Phase 5 fix**: Vercel Cron job hits an internal endpoint that batches reminders/feedback prompts.

### 13. Statement PDF download is mock

- **Files**: TBD when 6H.7 lands
- **Phase 5 fix**: Generate real PDF via React-PDF or server-side rendering.

---

## Resolved

_(none yet)_
