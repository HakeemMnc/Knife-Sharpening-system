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
- `/end-session` — full debrief at end of session (push triggers GitHub Action to merge to main)

## Stage Completion Checkpoint (MANDATORY)

After completing any roadmap stage, ALWAYS perform these steps before moving on:

1. **Update `docs/prd.md`** — Mark the completed stage as `[COMPLETE]`
2. **Update `.claude/rules/architecture.md`** — Mark the stage as `**100%**` in the progress table
3. **Update `CLAUDE.md`** — Update current stage number and priorities to reflect the next stage
4. **Update `docs/session-log.md`** — All of the following:
   - Update the Stage Progress table (mark stage 100%)
   - Update Current State (last commit, stage, what's working, what's incomplete)
   - Add full details to the session entry (files created/modified, git activity, milestones, decisions)
   - Update Next Session Pickup Instructions to point to the next stage
5. **Commit** all context file updates with message: `Checkpoint: Stage N complete — update session log, PRD, and context files`
6. **Push** to the active branch

Do NOT ask the user whether to checkpoint — just do it automatically after every stage completion.

## Git Rules
- Work on whatever branch you're on (Claude Code auto-creates branches)
- A GitHub Action auto-merges every push to `main`
- Never force push
- Never commit .env, credentials, or node_modules
- Commit frequently with descriptive messages
- Push with `git push -u origin $(git branch --show-current)`
