---
name: checkpoint
description: Mid-session save point — build, commit, push, update session log
disable-model-invocation: true
---

# Checkpoint — Mid-Session Save Point

Save current work, commit, push, and update the session tracker.

## Steps

1. **Verify build**: Run `npm run build`. If it fails, report the error and ask the user whether to commit anyway or fix first.

2. **Commit and push**:
   - Run `git status` to see all changes
   - Stage all relevant files (avoid .env, credentials, node_modules)
   - Commit with a descriptive message summarizing what changed since the last commit
   - Push to the current feature branch with `git push -u origin <branch-name>`
   - If push fails due to network, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

3. **Update session log**: Read `docs/session-log.md` and update the **"Current State"** section to reflect reality:
   - Branch name and last commit hash
   - Build status (passing/failing)
   - What's working now
   - What's broken or incomplete
   - Immediate next step

4. **Commit the session log update**: Make a second commit for the session log update and push.

5. **Confirm to user**: Output a short summary:
   - Commit hash
   - Files changed count
   - Build status
   - Branch name

## Rules
- ALWAYS run the build before committing
- NEVER commit .env files or credentials
- NEVER force push
- If build fails, ask user before proceeding with the commit
- Keep commit messages concise but descriptive
