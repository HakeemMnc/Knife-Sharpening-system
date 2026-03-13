# Architecture — B2C to B2B SaaS Transformation

## 6-Stage Roadmap

| Stage | What | Status |
|-------|------|--------|
| 0 | Foundation & Security (auth, RLS, cleanup, admin decomposition) | **100%** |
| 1 | B2B Data Model (tenants, clients, contracts, zones, visits) | **100%** |
| 2 | Core B2B Features (client mgmt, scheduling, route optimization) | **100%** |
| 3 | Billing & Subscriptions (Stripe Express Connect, metered billing) | Not started |
| 4 | Client Portal (self-service for B2B clients) | Not started |
| 5 | Mobile Admin (operator daily route view) | Not started |
| 6 | SaaS Multi-Tenancy (operator signup, tenant isolation) | Not started |

## Key Decisions (locked in)

1. **Stripe Express Connect** for multi-tenant payments (each operator has own Stripe account)
2. **Usage-based metered billing** via Stripe metered subscriptions
3. **B2C phase-out complete** — all future development is B2B SaaS
4. **Supabase Auth** over NextAuth.js (simpler, native RLS integration)
5. **Upstash Redis** for rate limiting (fail-open design — allows requests if Redis is down)
6. **Hybrid onboarding**: outbound sales + self-signup for operators
7. **Software-only SaaS** initially (no physical services)

## Current Architecture

- **Customer flow**: Select services → pick dates → enter address → apply coupon → pay via Stripe
- **Admin dashboard**: 6 tabs (Orders, Analytics, Messages, Templates, SMS Logs, Coupons)
- **SMS automation**: Twilio cron jobs for booking confirmations, reminders, follow-ups
- **Auth**: Supabase Auth with RLS policies. Admin login at `/login`.
- **Rate limiting**: Sliding window via Upstash Redis on public/auth/API routes.

## B2B Target Architecture (Stages 1-6)

- Multi-tenant: each knife sharpening operator is a tenant
- Operators manage commercial clients (restaurants, butchers, etc.)
- Recurring service contracts with scheduled visits
- Route optimization for daily service runs
- Metered billing based on actual service visits
- Client self-service portal for booking/history
