# Northern Rivers Knife Sharpening — B2B SaaS Transformation

A mobile knife-sharpening booking app (B2C) being transformed into a **recurring field service management SaaS** (B2B). Commercial clients sign recurring contracts, operators manage routes/visits/billing, platform licensed to multiple operators worldwide.

**End goal**: Fully automated, self-running B2B platform — operators sign up, onboard clients, manage routes, bill automatically via Stripe Express Connect.

**Master PRD**: `docs/prd.md` — Full product vision, 6-stage roadmap with detailed requirements, architectural decisions, user flows, and security analysis. **Read this to understand the bigger picture.**

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
  onboarding/         # Operator onboarding flow (4-step: plan, business, contact, settings)
  signup/             # Operator self-signup (public)
  operator/           # B2B operator dashboard (clients, contracts, schedule, routes, settings)
    components/       # Operator tab components
  platform-admin/     # Platform admin dashboard (analytics, tenant management)
    components/       # Platform admin tab components
  knife-sharpening-*/ # 12 location-specific SEO landing pages
  login/              # Admin login page
src/components/       # Shared UI components (booking, payments, SMS)
src/lib/              # Core services (database, auth, stripe, stripe-platform, sms, rate-limiter, b2b-database)
src/types/            # TypeScript types (b2b.ts)
src/utils/            # Utilities (scheduling, route optimization)
database/migrations/  # Supabase SQL migrations (001-012)
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

- Work on whatever branch you're on (Claude Code auto-creates branches — that's fine)
- A GitHub Action auto-merges every push to `main`, so `main` always has the latest code
- Never force push
- Never commit `.env`, credentials, or `node_modules`
- Commit frequently with descriptive messages
- Push with `git push -u origin $(git branch --show-current)`

## Session Workflow

**On every new session** — do this BEFORE any work:
1. Read `docs/session-log.md` — this is the **source of truth** for project state
2. Check `git status` and `git log --oneline -5`
3. Run `npm run build` to verify current build status
4. Brief the user on current state and recommended next steps

**Available skills**:
- `/start-session` — Full context restoration (reads log, checks build, briefs user)
- `/checkpoint` — Mid-session save (build, commit, push, update log)
- `/end-session` — Full debrief (log entry, commit, push — GitHub Action merges to main)

The session log at `docs/session-log.md` has: stage progress table, current state, next session pickup instructions, and full session history.

## Current State

- **Stage**: 6 (SaaS Multi-Tenancy) — COMPLETE
- **Build**: PASSING on Vercel
- **Deployed**: YES — live at `knife-sharpening-system.vercel.app`
- **Migrations**: All run (009-012)
- **All 6 stages complete** — platform is feature-complete
- **Priority 1**: Post-deploy config (webhooks, remaining env vars, key rotation)
- **Priority 2**: Route optimization enhancement (nearest-neighbor, auto route_order)
- **Priority 3**: PWA support for mobile view (offline, push notifications)
- See `docs/session-log.md` "Next Session Pickup Instructions" for details

## Key Files

- `docs/prd.md` — **Master PRD** (product vision, full roadmap, requirements, decisions, security)
- `docs/session-log.md` — Detailed project tracker and session history
- `src/app/admin/page.tsx` — B2C admin dashboard (113 lines, 6 tabs)
- `src/app/operator/page.tsx` — B2B operator dashboard (5 tabs)
- `src/app/signup/page.tsx` — Operator self-signup (public)
- `src/app/onboarding/page.tsx` — Operator onboarding (4-step: plan, business, contact, settings)
- `src/app/platform-admin/page.tsx` — Platform admin dashboard (analytics, tenant management)
- `src/lib/database.ts` — Core database service (Supabase queries, audit logging)
- `src/lib/b2b-database.ts` — B2B CRUD service (tenants, clients, contracts, zones, visits)
- `src/lib/stripe-platform.ts` — Platform SaaS billing service (subscriptions, plan management)
- `src/types/b2b.ts` — TypeScript interfaces for all B2B + platform entities
- `src/lib/auth.ts` — Auth helpers (Supabase Auth, tenant isolation, requireActiveSubscription)
- `src/app/api/b2b/` — 20+ B2B API routes with auth + tenant isolation
- `src/app/api/b2b/platform/` — Platform API routes (analytics, subscription, webhook)
- `database/migrations/012_saas_multi_tenancy.sql` — SaaS tables + tenant isolation hardening
