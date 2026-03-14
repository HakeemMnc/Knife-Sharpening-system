---
name: start-session
description: Restore context from previous session — read logs, switch to active branch, check build, brief user
disable-model-invocation: true
---

# Start Session — Context Restoration

Restore full context from the previous session and brief the user on the current state.

## Steps

1. **Read the session log**: Read `docs/session-log.md` completely. Pay special attention to:
   - The **"Current State"** section — this is the source of truth
   - The **"Branch"** field — this is the active development branch
   - The most recent session entry
   - The **"Next Session Pickup Instructions"** section
   - The **"Stage Progress"** table

2. **Switch to the active branch**:
   - Get the branch name from "Current State" → "Branch" in the session log
   - Check current branch: `git branch --show-current`
   - If you are NOT on the active branch:
     ```
     git fetch origin <active-branch>
     git checkout <active-branch>
     ```
   - If the branch doesn't exist locally, create it tracking remote:
     ```
     git checkout -b <active-branch> origin/<active-branch>
     ```
   - **IMPORTANT**: If you are on `main` or any auto-created branch, you MUST switch. The real work is on the active branch.
   - **Fallback**: If the branch from session-log does NOT exist on remote:
     1. Run: `git branch -r --sort=-committerdate | grep claude/ | head -5`
     2. Show the user the most recent branches and ask which to use
     3. Check out the selected branch
   - **Re-read after switch**: After switching branches, re-read `docs/session-log.md` again from the new branch — it may be newer than what `main` had. Use the re-read version for the rest of this workflow.

3. **Check git state**:
   - `git status` — any uncommitted changes?
   - `git log --oneline -5` — recent commits match what session log says?
   - Verify branch matches the session log

4. **Check build state**: Run `npm run build` to verify current build status. Note any errors.

5. **Output a structured briefing to the user**:

   ```
   ## Session Briefing

   **Project**: [1-line summary]
   **Branch**: [branch name] ✓ (switched from main)
   **Build**: passing/failing
   **Stage**: [current stage] — [percentage complete]

   ### Last Session Summary
   [1-2 sentences from last session]

   ### What's Working
   - [bullet points]

   ### What Needs Attention
   - [bullet points]

   ### Recommended Next Steps
   1. [from session log "Next Session Pickup Instructions"]
   2. [from session log]
   3. [from session log]
   ```

6. **Ask the user**: "Ready to continue with step 1, or do you want to work on something else?"

## Rules
- ALWAYS read the session log FIRST — it is the source of truth
- ALWAYS switch to the active branch — never work on main
- NEVER start working on code until the user confirms what to work on
- If there are uncommitted changes from a previous session, flag this immediately
- If the build is failing, flag this as the first priority
- If the session log is missing or empty, flag this and ask the user for context
- If the active branch from the session log doesn't exist, inform the user and ask what to do
