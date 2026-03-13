---
name: end-session
description: Full session debrief — save all work, write detailed session log, commit, push, sync context to main
disable-model-invocation: true
---

# End Session — Full Session Debrief & Save

Perform a complete session wrap-up: save all work, write a detailed session log entry, commit, push, and **sync context files to main** so the next session starts with correct state.

## Steps

1. **Run checkpoint first**: Build, commit, push all pending work (follow the checkpoint skill steps).

2. **Write session log entry**: Read `docs/session-log.md` and append a new session entry with ALL of:

   ### Session N — [date]

   **Summary**: 1-2 sentences of what was accomplished this session.

   **Files Changed**:
   - Created: list all new files with 1-line descriptions
   - Modified: list all modified files with what changed
   - Deleted: list any deleted files

   **Git Activity**: List commit hashes and messages from this session.

   **Decisions Made**: Any architectural, technical, or business decisions locked in.

   **Blockers & Open Questions**: Anything unresolved.

3. **Update "Current State" section**: Must reflect the EXACT truth:
   - Branch: exact branch name (use `git branch --show-current`)
   - Last commit: hash and message
   - Build status: passing or failing (include specific error if failing)
   - Stage progress: which stage, what percentage
   - What's working: bullet points
   - What's incomplete: bullet points

4. **Update "Next Session Pickup Instructions"**: Specific, actionable priorities for the next session.

5. **Update "Stage Progress" table**: Mark any stage changes.

6. **Update CLAUDE.md "Current State" section**: Keep it in sync with the session log.

7. **Final commit and push on feature branch**:
   ```
   git add docs/session-log.md CLAUDE.md .claude/rules/
   git commit -m "End session N: [summary]"
   git push -u origin $(git branch --show-current)
   ```

8. **CRITICAL — Sync context files to main**:
   This ensures the NEXT session starts with correct, up-to-date context.
   ```
   FEATURE_BRANCH=$(git branch --show-current)
   git checkout main
   git pull origin main
   git checkout $FEATURE_BRANCH -- CLAUDE.md docs/session-log.md .claude/rules/
   git add CLAUDE.md docs/session-log.md .claude/rules/
   git commit -m "Sync session state to main from $FEATURE_BRANCH"
   git push origin main
   git checkout $FEATURE_BRANCH
   ```
   If the push to main fails, retry up to 3 times. If it still fails, warn the user.

9. **Output to user**: Display a formatted summary of:
   - What was accomplished
   - Current build/git state
   - Exact next steps for the next session
   - Confirm: "Context synced to main — next session will auto-detect this branch"

## Rules
- Be HONEST about the state — never say "committed and pushed" if it wasn't
- Be SPECIFIC in next steps — "Fix TypeScript error in sms-service-old.ts line 46" not "Fix errors"
- The session log is the SOURCE OF TRUTH for the next session
- Every session entry must have enough detail that a fresh Claude instance can resume perfectly
- **ALWAYS sync to main** — this is what makes cross-session continuity work
- Never force push to main
