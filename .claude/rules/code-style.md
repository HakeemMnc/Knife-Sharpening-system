# Code Style

## TypeScript
- Strict mode. No `any` types — use `unknown` or proper interfaces.
- Named exports preferred over default exports.
- Use `const` over `let` wherever possible.

## React / Next.js
- Function components only. No class components.
- Admin tabs are self-contained components with own state management.
- Each tab in `src/app/admin/components/` manages its own data fetching.
- Use `'use client'` directive for client components.

## ESLint Rules (enforced in build)
- `react/no-unescaped-entities`: Use `&apos;` for `'` and `&quot;` for `"` in JSX text.
- `@typescript-eslint/no-explicit-any`: No `any` — use typed alternatives.
- `prefer-const`: Use `const` for variables that aren't reassigned.
- Build fails on ESLint errors (`next.config.ts` has `ignoreDuringBuilds: false`).

## Supabase Client Pattern
- Server-side: `createServerClient()` from `@supabase/ssr` in API routes.
- Client-side: `createBrowserClient()` from `@supabase/ssr` in components.
- Auth helpers in `src/lib/auth.ts`: `getAuthUser()`, `requireAuth()`, `requireRole()`.

## Database Pattern
- All DB operations go through `DatabaseService` class in `src/lib/database.ts`.
- Uses Supabase client methods, not raw SQL.
- Migrations in `database/migrations/` with numbered prefixes (001-009).

## Naming
- Files: `kebab-case.ts` for lib, `PascalCase.tsx` for components.
- API routes: `src/app/api/{resource}/route.ts`.
