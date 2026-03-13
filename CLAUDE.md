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
  api/                # API route handlers (payments, sms, cron, analytics, b2b/)
  onboarding/         # Operator onboarding flow (3-step)
  operator/           # B2B operator dashboard (clients, contracts, schedule, routes, settings)
    components/       # Operator tab components
  knife-sharpening-*/ # 12 location-specific SEO landing pages
  login/              # Admin login page
src/components/       # Shared UI components (booking, payments, SMS)
src/lib/              # Core services (database, auth, stripe, sms, rate-limiter, b2b-database)
src/types/            # TypeScript types (b2b.ts)
src/utils/            # Utilities (scheduling, route optimization)
database/migrations/  # Supabase SQL migrations (001-010)
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

**CRITICAL — Branch Detection**:
1. Read `docs/session-log.md` → find **"Branch"** in the "Current State" section
2. That is the **active development branch**. Switch to it before doing ANY work.
3. If you are on `main` or any other branch, you are NOT on the right branch.
4. To switch: `git fetch origin <branch-name> && git checkout <branch-name>`

**Rules**:
- Never force push
- Never commit `.env`, credentials, or `node_modules`
- Commit frequently with descriptive messages
- Push with `git push -u origin <current-branch-name>`

## Session Workflow

**MANDATORY on every new session** — do this BEFORE any work:
1. Read `docs/session-log.md` — this is the **source of truth** for project state
2. Find the **active branch** in the "Current State" section
3. If not on that branch: `git fetch origin <branch> && git checkout <branch>`
4. Check `git status` and `git log --oneline -5`
5. Run `npm run build` to verify current build status
6. Brief the user on current state and recommended next steps

**Available skills**:
- `/start-session` — Full context restoration (reads log, switches branch, checks build, briefs user)
- `/checkpoint` — Mid-session save (build, commit, push, update log)
- `/end-session` — Full debrief (log entry, commit, push, **sync context to main**)

The session log at `docs/session-log.md` has: stage progress table, current state, next session pickup instructions, and full session history.

## Current State

- **Stage**: 2 (Core B2B Features) — COMPLETE
- **Build**: PASSING (0 ESLint/TypeScript errors, only Supabase env var runtime issue)
- **Migrations**: 009 + 010 both run successfully on Supabase
- **Priority 1**: Begin Stage 3 — Stripe Express Connect + metered billing
- **Priority 2**: Auto-generate visits from active contracts
- **Priority 3**: Route optimization for daily visits
- See `docs/session-log.md` "Next Session Pickup Instructions" for details

## Key Files

- `docs/session-log.md` — Detailed project tracker and session history
- `src/app/admin/page.tsx` — B2C admin dashboard (113 lines, 6 tabs)
- `src/app/operator/page.tsx` — B2B operator dashboard (5 tabs)
- `src/app/onboarding/page.tsx` — Operator onboarding (3-step form)
- `src/lib/database.ts` — Core database service (Supabase queries, audit logging)
- `src/lib/b2b-database.ts` — B2B CRUD service (tenants, clients, contracts, zones, visits)
- `src/types/b2b.ts` — TypeScript interfaces for all B2B entities
- `src/lib/auth.ts` — Authentication helpers (Supabase Auth, tenant isolation)
- `src/app/api/b2b/` — 10 B2B API routes with auth + tenant isolation
- `database/migrations/010_b2b_data_model.sql` — B2B tables (run on Supabase)
