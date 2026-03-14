# Northern Rivers Knife Sharpening — Product Requirements Document

## Product Vision

**Transform a single-operator B2C knife-sharpening booking app into a globally scalable B2B recurring field service management SaaS.**

The platform enables knife sharpening operators worldwide to:
1. Sign up and self-onboard as a tenant
2. Manage commercial clients (restaurants, butchers, caterers, hotels)
3. Set up recurring service contracts (weekly/fortnightly/monthly)
4. Auto-generate and optimize daily service routes
5. Bill clients automatically via metered usage through Stripe
6. Give clients self-service access to their visit history and invoices

**End goal**: A fully automated, self-running B2B platform — operators sign up, onboard clients, manage routes, and bill automatically. The platform earns revenue through SaaS licensing fees per operator.

---

## Target Users

### 1. Operators (Primary — our paying customers)
- Mobile knife sharpening businesses
- Typically 1-5 person operations
- Service commercial kitchens on recurring schedules
- Need: route planning, client management, automated billing, visit tracking

### 2. Commercial Clients (Operators' customers)
- Restaurants, butchers, caterers, hotels, aged care facilities
- Need regular knife sharpening (weekly to monthly)
- Need: visit history, upcoming schedule visibility, invoice access

### 3. Platform Admin (Internal)
- Manages the overall SaaS platform
- Monitors operators, handles support escalation
- Manages B2C legacy orders (phasing out)

---

## Business Model

- **SaaS licensing**: Monthly fee per operator (pricing TBD)
- **Payment processing**: Stripe Express Connect — each operator has their own Stripe account
- **Billing method**: Usage-based metered billing — operators bill clients per completed visit
- **Revenue flow**: Client pays operator directly via Stripe; platform takes SaaS subscription fee from operator
- **Software-only**: Platform provides software — operators provide physical knife sharpening services

---

## 6-Stage Roadmap

### Stage 0 — Foundation & Security [COMPLETE]

**What was built:**
- Supabase Auth integration with RLS (Row Level Security) policies
- User profiles with role-based access (platform_admin, operator, client)
- Webhook idempotency for Stripe payment processing
- Audit logging for sensitive operations
- Admin dashboard decomposition (3,829 → 113 lines, 6 self-contained tabs)
- All 235 ESLint errors fixed, build passing
- Rate limiting via Upstash Redis (fail-open, sliding window)
- Next.js middleware for route protection
- Admin login page
- Cross-session context system (CLAUDE.md, rules, skills, session log)

**Key files:**
- `src/lib/auth.ts` — Auth helpers (getAuthUser, requireAuth, requireRole)
- `src/lib/rate-limiter.ts` — Upstash Redis rate limiting
- `src/middleware.ts` — Route protection
- `src/app/admin/components/` — 6 extracted admin tabs
- `database/migrations/009_add_profiles_and_rls.sql` — Profiles + RLS

---

### Stage 1 — B2B Data Model [COMPLETE]

**What was built:**
- Full PostgreSQL schema for multi-tenant B2B operations
- 5 core tables: tenants, clients, service_contracts, service_zones, service_visits
- RLS policies enforcing tenant isolation on all B2B tables
- TypeScript interfaces mirroring the database schema
- Complete CRUD service (B2BDatabaseService) with admin client

**Key files:**
- `database/migrations/010_b2b_data_model.sql` — B2B schema + RLS + triggers
- `src/types/b2b.ts` — TypeScript interfaces for all B2B entities
- `src/lib/b2b-database.ts` — B2BDatabaseService (static methods, Supabase admin client)

**Data Model:**

| Entity | Key Fields | Relationships |
|--------|-----------|---------------|
| **Tenant** | name, slug, owner_id, stripe_account_id, stripe_onboarding_complete, timezone, currency, status | Has many Clients, Contracts, Zones, Visits |
| **Client** | business_name, contact_name, address, lat/lng, preferred_day, preferred_time_window, billing_email, payment_terms, status | Belongs to Tenant; Has many Contracts, Visits |
| **ServiceContract** | frequency, day_of_week, price_per_visit, estimated_knives_per_visit, stripe_subscription_id, stripe_price_id, start_date, end_date, status | Belongs to Tenant + Client; Has many Visits |
| **ServiceZone** | name, color, center_lat/lng, radius_km, service_day, is_active | Belongs to Tenant |
| **ServiceVisit** | scheduled_date, scheduled_time_window, route_order, status, knives_sharpened, visit_amount, billed, stripe_usage_record_id | Belongs to Tenant + Client + Contract (optional) + Zone (optional) |

---

### Stage 2 — Core B2B Features [COMPLETE]

**What was built:**
- 10 B2B API routes with auth + tenant isolation
- Operator onboarding at `/onboarding` (3-step form: business → contact → settings)
- Operator dashboard at `/operator` with 5 tabs:
  - **Clients**: Full CRUD, status filtering, modal forms
  - **Contracts**: Create/edit contracts, pause/resume/cancel
  - **Schedule**: Day/week view, visit status workflow (scheduled → en_route → in_progress → completed)
  - **Routes**: Daily route with visual progress tracking
  - **Settings**: Business settings + Stripe Connect integration

**Key files:**
- `src/app/api/b2b/` — 10 API route files (tenants, clients, contracts, zones, visits)
- `src/app/onboarding/page.tsx` — 3-step operator onboarding
- `src/app/operator/page.tsx` — Dashboard shell
- `src/app/operator/components/` — 5 tab components

---

### Stage 3 — Billing & Subscriptions [COMPLETE]

**What was built:**
- Stripe Express Connect service — account creation, onboarding links, status checks
- Metered billing — price creation, subscription management, usage reporting
- 5 new API routes: connect, callback, subscriptions, usage, webhook
- Settings tab upgraded with real Connect UI (3 states: not connected, incomplete, connected)
- Contract status changes auto-sync to Stripe (pause/resume/cancel subscriptions)
- Visit completion auto-reports usage to Stripe for metered billing
- Visit auto-generation from active contracts (weekly/fortnightly/monthly with deduplication)
- Schedule tab: "Generate Visits" button + billing status on completed visits
- Contracts tab: billing status display

**End-to-end billing flow:**
1. Operator connects Stripe in Settings → redirected to Stripe Express onboarding
2. Operator creates contract for client → metered subscription created on Stripe
3. Operator clicks "Generate Visits" → visits auto-scheduled from contracts
4. Operator completes visit → usage auto-reported to Stripe
5. Stripe generates monthly invoice → client pays → operator receives payout

**Key files:**
- `src/lib/stripe-connect.ts` — StripeConnectService
- `src/app/api/b2b/stripe/` — 5 Stripe API routes
- `src/utils/visit-generator.ts` — Visit date generation logic

---

### Stage 4 — Client Portal [COMPLETE]

**Goal**: Self-service portal for B2B clients (restaurants, butchers) to view their service history, upcoming visits, and billing.

**Requirements:**

1. **Client Authentication**
   - Separate login flow for clients (not operators)
   - Magic link or email/password via Supabase Auth
   - Client role in profiles table, linked to client record via email
   - RLS policies: clients see only their own data

2. **Client Dashboard** (`/client`)
   - Overview: next scheduled visit, total visits this month, billing summary
   - Tabs or sections:
     - **Upcoming Visits**: List of scheduled visits with dates, time windows
     - **Visit History**: Past visits with details (knives sharpened, completion time, notes)
     - **Billing**: Invoice list, payment status, total spend
     - **Profile**: Update contact info, access instructions, preferred day/time

3. **API Routes**
   - `GET /api/b2b/client/visits` — Client's own visits (upcoming + history)
   - `GET /api/b2b/client/invoices` — Client's invoices from Stripe
   - `PATCH /api/b2b/client/profile` — Update own client record (limited fields)
   - All routes enforce client-level auth (not tenant-level)

4. **Operator Visibility**
   - Operators can see which clients have portal access
   - Operators can invite clients to the portal (send magic link)

---

### Stage 5 — Mobile Admin [NOT STARTED]

**Goal**: Mobile-optimized operator interface for daily route execution in the field.

**Requirements:**

1. **Mobile Route View** (`/operator/mobile` or responsive `/operator`)
   - Today's route as a sequential card list
   - Swipe or tap to advance visit status (scheduled → en_route → in_progress → completed)
   - Large touch targets for gloved/dirty hands
   - Works offline (PWA with service worker)

2. **Navigation Integration**
   - "Navigate" button per visit → opens Google Maps/Apple Maps with client address
   - Route overview showing all stops on a map
   - Estimated drive time between stops

3. **Quick Data Entry**
   - Knives sharpened count (number input)
   - Quick notes (voice-to-text or short text)
   - Photo capture for before/after (optional, future)

4. **Notifications**
   - Push notifications for upcoming visits
   - SMS reminders to clients (via existing Twilio integration)
   - Completion confirmation SMS to client

---

### Stage 6 — SaaS Multi-Tenancy [NOT STARTED]

**Goal**: Enable any knife sharpening operator worldwide to sign up, onboard, and start using the platform independently.

**Requirements:**

1. **Operator Self-Signup**
   - Public signup page (`/signup`)
   - Email verification via Supabase Auth
   - Onboarding flow: business details → Stripe Connect → first client setup
   - Free trial period (duration TBD)

2. **SaaS Subscription Management**
   - Platform charges operators a monthly SaaS fee
   - Stripe Billing for platform-level subscriptions (separate from operator-to-client billing)
   - Usage tiers: free (up to X clients), pro (unlimited), enterprise (custom)
   - Dunning management for failed payments

3. **Tenant Isolation Hardening**
   - Comprehensive RLS audit — every query is tenant-scoped
   - API route middleware enforcing tenant boundaries
   - Data export per tenant (GDPR compliance)
   - Tenant suspension/cancellation workflow

4. **Platform Admin Dashboard**
   - Tenant management: view all operators, usage stats, billing status
   - Global analytics: total visits, revenue, operator count, growth metrics
   - Support tools: impersonate tenant (read-only), view audit logs

5. **White-Label / Customization** (future consideration)
   - Custom branding per operator (logo, colors)
   - Custom domain per operator (subdomain or CNAME)

---

## Locked-In Architectural Decisions

These decisions were made in Session 1 with the founder and are not up for debate:

1. **Stripe Express Connect** for multi-tenant payments — each operator has their own Stripe account managed through our platform
2. **Usage-based metered billing** — operators bill clients per completed visit via Stripe metered subscriptions
3. **B2C phase-out complete** — the original B2C booking flow remains but all new development is B2B SaaS
4. **Supabase Auth** over NextAuth.js — simpler integration, native RLS support
5. **Upstash Redis** for rate limiting — fail-open design (allows requests if Redis is unavailable)
6. **Hybrid onboarding** — outbound sales + self-signup for operators
7. **Software-only SaaS** initially — platform provides software, operators provide physical services
8. **Operator assigns service days** — operators control which days they service which clients/zones

---

## End-to-End User Flows

### Operator Onboarding Flow
1. Operator signs up (email/password or magic link)
2. 3-step onboarding form: business identity → contact details → service settings
3. Tenant created, profile linked
4. Connect Stripe Express account (can do later from Settings)
5. Add first commercial client
6. Create service contract for client
7. Generate upcoming visits from contract
8. Start servicing — complete visits, auto-bill

### Daily Service Flow (Operator)
1. Open operator dashboard → Schedule tab
2. View today's visits ordered by route
3. Tap "Start Route" on first visit
4. Navigate to client (via map link)
5. Tap "Arrived" → "Complete"
6. Enter knives sharpened count
7. Usage auto-reported to Stripe
8. Move to next visit
9. End of day: all visits completed, all usage billed

### Client Self-Service Flow (Stage 4)
1. Client receives portal invite from operator
2. Logs in via magic link
3. Views upcoming scheduled visits
4. Reviews past visit history
5. Checks billing/invoices
6. Updates contact info or access instructions

### Billing Cycle
1. Operator creates contract with price_per_visit
2. Metered Stripe subscription created on connected account
3. Visits generated from contract schedule
4. Each completed visit → 1 usage unit reported to Stripe
5. End of billing period → Stripe generates invoice
6. Client pays → funds go to operator's Stripe account
7. Platform charges operator SaaS fee separately

---

## Security & Red-Team Considerations

### Multi-Tenant Isolation
- **RLS on all B2B tables** — queries are tenant-scoped at the database level
- **API route auth** — every B2B route calls `requireAuth()` and checks `tenant_id`
- **Platform admin bypass** — `role === 'platform_admin'` can access all tenants (for support)
- **Risk**: Cross-tenant data leakage if RLS policies are misconfigured or bypassed
- **Mitigation**: Use `supabaseAdmin` (service role) only in server-side code, never expose to client

### Stripe Connect Security
- **Account isolation** — each operator's Stripe account is separate; platform can't move money between operators
- **Webhook verification** — all Stripe webhooks verified via signature before processing
- **Idempotency** — webhook events are deduplicated to prevent double-billing
- **Risk**: Operator creates fake usage records to inflate billing
- **Mitigation**: Usage records tied to actual visit records with status=completed

### Authentication
- **Supabase Auth** handles token management, refresh, and session persistence
- **RLS policies** enforce data access at the database level (defense in depth)
- **Role-based access**: platform_admin > operator > client
- **Risk**: Token leakage or session hijacking
- **Mitigation**: HTTPS only, secure cookie settings, short token expiry

### Rate Limiting
- **Sliding window** algorithm via Upstash Redis
- **Fail-open design** — if Redis is down, requests are allowed (availability over security)
- **Applied to**: public routes, auth endpoints, API routes

### Data Integrity
- **Audit logging** for sensitive operations (payment status changes, order modifications)
- **Webhook idempotency** prevents duplicate payment processing
- **Contract history preservation** — contracts are never deleted, only status-changed
- **Visit history** — visits linked to contracts via nullable FK (SET NULL on delete)

---

## Tech Stack Reference

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router, Turbopack) | Full-stack React framework |
| Language | TypeScript (strict mode) | Type safety |
| Database | Supabase (PostgreSQL) | Data storage, RLS, realtime |
| Auth | Supabase Auth | Authentication, session management |
| Payments | Stripe Express Connect | Multi-tenant payments, metered billing |
| SMS | Twilio | Automated reminders, notifications |
| Rate Limiting | Upstash Redis | API protection |
| Hosting | Vercel | Deployment, edge functions |
| Email | Resend | Transactional email |

---

*This PRD is the master plan for the project. Every session should read this document to understand the bigger picture before starting work. For current implementation status and session-specific context, see `docs/session-log.md`.*
