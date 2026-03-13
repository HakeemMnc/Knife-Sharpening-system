---
name: end-session
description: Full session debrief — save all work, write detailed session log, commit, push
disable-model-invocation: true
---

# End Session — Full Session Debrief & Save

Perform a complete session wrap-up: save all work, write a detailed session log entry, commit, and push.

## Steps

1. **Run checkpoint first**: Build, commit, push all pending work (follow the checkpoint skill steps).

2. **Write session log entry**: Read `docs/session-log.md` and append a new session entry (or update the current one) with ALL of the following sections:

   ### Session N — [date]

   **Summary**: 1-2 sentences of what was accomplished this session.

   **Files Changed**:
   - Created: list all new files with 1-line descriptions
   - Modified: list all modified files with what changed
   - Deleted: list any deleted files

   **Decisions Made**: Any architectural, technical, or business decisions locked in.

   **Blockers & Open Questions**: Anything unresolved.

   **Next Steps** (numbered, specific, actionable):
   1. Exact first thing to do next session
   2. Second thing
   3. etc.

3. **Update "Current State" section**: Must reflect the EXACT truth:
   - Branch: exact branch name
   - Last commit: hash and message
   - Build status: passing or failing (include the specific error if failing)
   - Stage progress: which stage, what percentage
   - What's working: bullet points
   - What's incomplete: bullet points
   - Immediate next step: single sentence

4. **Update "Stage Progress" table**: Mark any stage changes.

5. **Final commit and push**: Commit the session log update and push.

6. **Output to user**: Display a formatted summary of:
   - What was accomplished
   - Current build/git state
   - Exact next steps for the next session

## Rules
- Be HONEST about the state — never say "committed and pushed" if it wasn't
- Be SPECIFIC in next steps — "Fix TypeScript error in sms-service-old.ts line 46" not "Fix errors"
- The session log is the SOURCE OF TRUTH for the next session
- Every session entry must have enough detail that a fresh Claude instance can resume perfectly
