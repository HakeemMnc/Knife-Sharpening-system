---
name: init-project
description: Deep interactive project planning — 5 rounds of questions, then generates CLAUDE.md, PRD, session log, architecture rules, and code style
---

# Init Project — Deep Planning & Setup

Run this skill at the very start of a new project (created from the template). It walks through 5 rounds of detailed questions, then generates all project context files. **80% of the work is done here.**

## Rules

- Use `AskUserQuestion` for EVERY round — never assume answers
- Let the user refine, go back, and iterate on any round before moving on
- After each round, summarize what you captured and confirm before proceeding
- Be thorough — ask about edge cases, blind spots, and things the user might not have considered
- The output must be detailed enough that a fresh Claude session can build the entire project from these files alone
- Do NOT write any application code — this skill only produces planning and context documents

## Process

### Round 1 — Vision & Scope

Use `AskUserQuestion` to ask:

1. **Project name**: What is this project called?
2. **One-line description**: Describe the project in one sentence.
3. **Problem**: What problem does this solve? Who has this problem?
4. **Target user**: Who is the primary user? (consumers, businesses, developers, internal team?)
5. **Success criteria**: What does "done" look like? How do you measure success?
6. **Scale**: Solo project, small team, or open-source? How many users expected?

After capturing answers, summarize Round 1 back to the user. Ask: "Anything to change or add before we move to tech stack?"

### Round 2 — Tech Stack

Use `AskUserQuestion` to ask:

1. **Frontend**: Framework preference? (Next.js, React, Vue, Svelte, none, etc.)
2. **Backend/API**: Server approach? (Next.js API routes, Express, FastAPI, Django, serverless, etc.)
3. **Database**: Data store? (Supabase/PostgreSQL, MongoDB, Firebase, PlanetScale, SQLite, etc.)
4. **Auth**: Authentication? (Supabase Auth, NextAuth, Clerk, Auth0, custom, etc.)
5. **Hosting**: Deployment target? (Vercel, AWS, Railway, Fly.io, self-hosted, etc.)
6. **Key services**: Any must-use third-party services? (Stripe, Twilio, SendGrid, S3, Redis, etc.)
7. **Language**: TypeScript, JavaScript, Python, Go, etc.?

After capturing, summarize. Ask: "Any services I missed? Anything you're unsure about — I can help weigh trade-offs."

### Round 3 — Architecture & Data Model

Use `AskUserQuestion` to ask:

1. **Core entities**: What are the main things the app manages? (users, products, orders, etc.) List them all.
2. **Relationships**: How do these entities relate? (user has many orders, order has many items, etc.)
3. **User roles**: What different types of users exist? What can each role do?
4. **API style**: REST, GraphQL, tRPC, or server actions?
5. **Key pages/views**: What are the main screens or pages?
6. **File structure**: Any preferred directory organization?

After capturing, propose a data model (entities + fields + relationships) and a directory structure. Ask the user to review and refine.

### Round 4 — Features & Roadmap

Use `AskUserQuestion` to ask:

1. **MVP features**: What are the absolute minimum features for launch? List them.
2. **Phase 2 features**: What comes next after MVP?
3. **Phase 3 features**: Long-term vision features?
4. **Priority order**: Which MVP features should be built first?
5. **Hardest parts**: What do you think will be the most difficult to build?
6. **Integrations**: Any external APIs or services that need integration?

After capturing, organize features into numbered stages (like the Knife Sharpening project's Stage 0-6 pattern). Present the roadmap and ask for approval.

### Round 5 — Blind Spots & Edge Cases

This round is Claude-driven. Based on everything gathered, PROACTIVELY identify and ask about:

1. **Security**: Authentication edge cases, authorization holes, input validation, rate limiting, CORS, secrets management
2. **Error handling**: What happens when third-party services fail? Network errors? Invalid data?
3. **Scalability**: Will the architecture handle growth? Database indexing? Caching needs?
4. **Data edge cases**: Empty states, duplicate data, concurrent modifications, data migration
5. **User experience**: Loading states, offline behavior, mobile responsiveness
6. **Deployment**: Environment variables needed, CI/CD, staging vs production
7. **Legal/compliance**: Data privacy, terms of service, cookie consent (if applicable)

Ask targeted questions about each area that seems relevant. Don't ask about areas that clearly don't apply.

## Output — Generate Files

After all 5 rounds are complete and the user has approved, generate these files:

### 1. `CLAUDE.md`

Fill in the template with ALL information gathered:
- Project name and description
- Tech stack (framework, database, auth, hosting, services)
- Directory structure (proposed in Round 3)
- Commands (npm/yarn/pnpm scripts based on stack)
- Git workflow (with dynamic branch detection)
- Session workflow (reference skills)
- Current state (Stage 0 — Planning complete, ready for Stage 1)
- Key files list

### 2. `docs/PRD.md`

Write a comprehensive Product Requirements Document:
- **Overview**: project description, problem statement, target users
- **User Stories**: as a [role], I want [feature], so that [benefit] — for every MVP feature
- **Data Model**: entities, fields, types, relationships (table format)
- **API Specification**: endpoints, methods, request/response shapes
- **Architecture**: system diagram (ASCII), component breakdown, data flow
- **Feature Roadmap**: staged breakdown with clear scope per stage
- **UI/UX**: key screens description, user flows
- **Edge Cases & Error Handling**: from Round 5
- **Security Considerations**: from Round 5
- **Non-Functional Requirements**: performance, scalability, accessibility

### 3. `docs/session-log.md`

Initialize with:
- **Stage Progress** table (all stages from roadmap, Stage 0 at 100%)
- **Current State**: branch (main), build status (not started), Stage 1 ready
- **Next Session Pickup Instructions**: "Begin Stage 1 — [first stage description]"
- **Session 0 entry**: summary of planning session, decisions made, files created

### 4. `.claude/rules/architecture.md`

Write:
- Stage roadmap table (from Round 4)
- Key decisions locked in (from all rounds)
- Current architecture description
- Target architecture description

### 5. `.claude/rules/code-style.md`

Write stack-specific rules:
- Language-specific style rules (TypeScript strict mode, Python type hints, etc.)
- Framework conventions (App Router vs Pages, etc.)
- Linting/formatting rules
- File naming conventions
- Import patterns
- Database access patterns

### 6. Commit and push

```
git add -A
git commit -m "Session 0: Project planning and initialization"
git push -u origin $(git branch --show-current)
```

Tell the user: "Planning complete. All context files generated. Run `/start-session` to begin Stage 1, or review the PRD first at `docs/PRD.md`."
