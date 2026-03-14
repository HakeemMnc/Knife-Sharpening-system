---
name: start-session
description: Restore context from previous session — read session log, check build, brief user
disable-model-invocation: true
---

# Start Session — Context Restoration

Read the session log, check the build, and brief the user on current state.

## Steps

1. **Read the session log**: Read `docs/session-log.md` completely. Pay attention to:
   - The **"Current State"** section — source of truth
   - The most recent session entry
   - The **"Next Session Pickup Instructions"** section
   - The **"Stage Progress"** table

2. **Check git state**:
   - `git status` — any uncommitted changes?
   - `git log --oneline -5` — recent commits
   - Note: you may be on an auto-created `claude/...` branch. That's fine — just work on it. The GitHub Action will merge to main when you push.

3. **Check build state**: Run `npm run build` to verify current build status. Note any errors.

4. **Output a structured briefing**:

   ```
   ## Session Briefing

   **Project**: [1-line summary]
   **Build**: passing/failing
   **Stage**: [current stage] — [status]

   ### Last Session Summary
   [1-2 sentences from last session]

   ### What's Working
   - [bullet points]

   ### What Needs Attention
   - [bullet points]

   ### Recommended Next Steps
   1. [from "Next Session Pickup Instructions"]
   2. ...
   3. ...
   ```

5. **Ask the user**: "Ready to continue with step 1, or do you want to work on something else?"

## Rules
- ALWAYS read the session log FIRST — it is the source of truth
- Don't worry about branch names — work on whatever branch you're on
- NEVER start working on code until the user confirms what to work on
- If there are uncommitted changes from a previous session, flag this immediately
- If the build is failing, flag this as the first priority
- If the session log is missing or empty, flag this and ask the user for context
