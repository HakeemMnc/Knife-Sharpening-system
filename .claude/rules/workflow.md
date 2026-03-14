# Workflow Rules — Planning First

## Core Principle
80% planning, 20% execution. Never start coding without a clear plan.

## New Project
- Run `/init-project` before writing any application code
- Complete all 5 rounds of planning questions
- Review the generated PRD before starting implementation
- The PRD and CLAUDE.md are the source of truth for what to build

## New Feature
- Run `/plan-feature` before implementing any significant feature
- Read existing code first — understand before changing
- Identify affected files and edge cases before writing code
- Get user confirmation on the plan before proceeding

## Session Workflow
- `/start-session` — always run at the start of every session
- `/checkpoint` — save progress mid-session (build, commit, push)
- `/end-session` — full debrief at end of session (context auto-syncs to main via GitHub Action)

## Git Rules
- Never force push
- Never commit .env, credentials, or node_modules
- Commit frequently with descriptive messages
- Push with `git push -u origin $(git branch --show-current)`
- Context files auto-sync to main — never manually push to main

## Branch Detection
1. Read `docs/session-log.md` → find "Branch" in "Current State"
2. That is the active development branch — switch to it before any work
3. If on `main`, you are NOT on the right branch
