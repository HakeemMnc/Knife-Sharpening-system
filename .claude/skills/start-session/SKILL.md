---
name: start-session
description: Restore context from previous session — read logs, check git/build state, brief user
disable-model-invocation: true
---

# Start Session — Context Restoration

Restore full context from the previous session and brief the user on the current state.

## Steps

1. **Read the session log**: Read `docs/session-log.md` completely. Pay special attention to:
   - The **"Current State"** section (source of truth)
   - The most recent session entry's **"Next Steps"** section
   - The **"Stage Progress"** table

2. **Read the plan file**: Read the plan file at `/root/.claude/plans/dreamy-scribbling-sunset.md` for the overall 6-stage roadmap context. If this file doesn't exist, skip — the session log has enough context.

3. **Check git state**:
   - `git status` — any uncommitted changes?
   - `git log --oneline -5` — recent commits
   - `git branch` — which branch are we on?
   - Verify we're on the correct feature branch (`claude/audit-sharpening-saas-4bB0H`)

4. **Check build state**: Run `npm run build` to verify current build status. Note any errors.

5. **Output a structured briefing to the user**:

   ```
   ## Session Briefing

   **Project**: [1-line summary]
   **Branch**: [branch name]
   **Build**: passing/failing
   **Stage**: [current stage] — [percentage complete]

   ### Last Session Summary
   [1-2 sentences from last session]

   ### What's Working
   - [bullet points]

   ### What Needs Attention
   - [bullet points]

   ### Recommended Next Steps
   1. [from session log]
   2. [from session log]
   3. [from session log]
   ```

6. **Ask the user**: "Ready to continue with step 1, or do you want to work on something else?"

## Rules
- ALWAYS read the session log before doing anything else
- NEVER start working on code until the user confirms what to work on
- If there are uncommitted changes from a previous session, flag this immediately
- If the build is failing, flag this as the first priority
- If the session log is missing or empty, flag this and ask the user for context
