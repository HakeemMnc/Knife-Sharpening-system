# Northern Rivers Knife Sharpening — B2B SaaS Transformation

A mobile knife-sharpening booking app (B2C) being transformed into a **recurring field service management SaaS** (B2B). Commercial clients sign recurring contracts, operators manage routes/visits/billing, platform licensed to multiple operators worldwide.

**End goal**: Fully automated, self-running B2B platform — operators sign up, onboard clients, manage routes, bill automatically via Stripe Express Connect.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack), TypeScript
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Payments**: Stripe Express Connect (usage-based metered billing)
- **SMS**: Twilio (automated reminders, follow-ups, conversations)
- **Rate Limiting**: Upstash Redis (fail-open sliding window)
- **Hosting**: Vercel
- **Email**: Resend

## Directory Structure

```
src/app/              # Next.js App Router pages and API routes
  (main)/             # Main customer-facing booking page
  admin/              # Admin dashboard (orders, analytics, SMS, coupons)
    components/       # Extracted admin tab components
  api/                # API route handlers (payments, sms, cron, analytics)
  knife-sharpening-*/ # 12 location-specific SEO landing pages
  login/              # Admin login page
src/components/       # Shared UI components (booking, payments, SMS)
src/lib/              # Core services (database, auth, stripe, sms, rate-limiter)
src/utils/            # Utilities (scheduling, route optimization)
database/migrations/  # Supabase SQL migrations (001-009)
docs/                 # Session log (source of truth for continuity)
.claude/skills/       # Custom slash commands (/checkpoint, /end-session, /start-session)
```

## Commands

```bash
npm run dev           # Start dev server (Turbopack)
npm run build         # Production build (ESLint + TypeScript enforced)
npm run lint          # Run ESLint
npm run start         # Start production server
```

No test framework configured yet.

## Git Workflow

**CRITICAL**: Always work on branch `claude/audit-sharpening-saas-4bB0H`.
- Never create new branches without explicit permission
- Never force push
- Never commit `.env`, credentials, or `node_modules`
- Commit frequently with descriptive messages
- Push with `git push -u origin claude/audit-sharpening-saas-4bB0H`

## Session Workflow

**On every new session**, before doing ANY work:
1. Read `docs/session-log.md` — this is the **source of truth** for project state
2. Check `git status` and `git log --oneline -5`
3. Run `npm run build` to verify current build status
4. Brief the user on current state and recommended next steps

**Available skills**:
- `/start-session` — Full context restoration + briefing
- `/checkpoint` — Mid-session save (build, commit, push, update log)
- `/end-session` — Full debrief (detailed log entry, commit, push)

The session log at `docs/session-log.md` has: stage progress table, current state, build error breakdown, next session pickup instructions, and full session history.

## Current State

- **Stage**: 0 (Foundation & Security) — ~90% complete
- **Build**: FAILING — 235 ESLint errors across 35 files (unescaped entities, `any` types, `prefer-const`)
- **Priority 1**: Fix ESLint errors to get build passing
- **Priority 2**: Extract OrdersTab from admin page.tsx (~1,800 lines still inline)
- **Priority 3**: Begin Stage 1 — B2B data model (tenants, clients, contracts, zones, visits)
- See `docs/session-log.md` "Next Session Pickup Instructions" for detailed fix strategy

## Key Files

- `docs/session-log.md` — Detailed project tracker and session history
- `src/app/admin/page.tsx` — Main admin dashboard (2,509 lines, needs OrdersTab extraction)
- `src/lib/database.ts` — Core database service (Supabase queries, audit logging, pagination)
- `src/lib/auth.ts` — Authentication helpers (Supabase Auth)
- `src/lib/sms-service.ts` — Twilio SMS service
- `src/lib/stripe-service.ts` — Stripe payment service
- `database/migrations/009_add_profiles_and_rls.sql` — Latest migration (not yet run on prod)
