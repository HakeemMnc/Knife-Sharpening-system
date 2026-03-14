---
name: end-session
description: Save all work, update session log, commit, push — GitHub Action auto-merges to main
disable-model-invocation: true
---

# End Session — Save & Sync

Save all work, write a session log entry, commit, push. A GitHub Action automatically merges everything to `main`.

## Steps

1. **Build check**: Run `npm run build`. Note if passing or failing.

2. **Commit all pending work**:
   - `git status` — check for uncommitted changes
   - Stage relevant files (never commit `.env`, credentials, or `node_modules`)
   - Commit with descriptive message

3. **Write session log entry**: Update `docs/session-log.md` — append a new entry:

   ### Session N — [date]

   **Summary**: 1-2 sentences of what was accomplished.

   **Files Changed**: List created/modified/deleted files.

   **Git Activity**: Commit hashes and messages from this session.

   **Decisions Made**: Any decisions locked in.

   **Blockers & Open Questions**: Anything unresolved.

4. **Update "Current State" section** in `docs/session-log.md`:
   - Last commit: hash and message
   - Build status: passing or failing
   - Stage progress
   - What's working (bullet points)
   - What's incomplete (bullet points)

5. **Update "Next Session Pickup Instructions"**: Specific, actionable priorities.

6. **Update CLAUDE.md "Current State" section**: Keep in sync with session log.

7. **Final commit and push**:
   ```bash
   git add docs/session-log.md CLAUDE.md .claude/rules/ .claude/skills/
   git commit -m "End session N: [summary]"
   git push -u origin $(git branch --show-current)
   ```
   The GitHub Action will automatically merge this branch into `main`.

8. **Output to user**:
   - What was accomplished
   - Current build/git state
   - Next steps for next session
   - Confirm: "Pushed — GitHub Action will auto-merge to main"

## Rules
- Be HONEST about the state — never say "committed and pushed" if it wasn't
- Be SPECIFIC in next steps — "Fix TypeScript error in X file" not "Fix errors"
- The session log is the SOURCE OF TRUTH for the next session
- Never force push
- Never commit .env or credentials
- You do NOT need to push to main — the GitHub Action handles that automatically
