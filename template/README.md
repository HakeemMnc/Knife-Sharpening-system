# Claude Project Template

A reusable project template with built-in Claude Code workflow: deep planning, session management, and automatic context sync.

## Quick Start

1. **Create your repo**: Click "Use this template" on GitHub
2. **Clone and open**: `git clone <your-repo>` → open in Claude Code
3. **Plan your project**: Run `/init-project` — Claude walks you through 5 rounds of detailed questions about your project vision, tech stack, architecture, features, and edge cases
4. **Review the output**: Check `docs/PRD.md` and `CLAUDE.md` — refine until the plan is solid
5. **Start building**: Run `/start-session` to begin implementation

## What's Included

### Skills (slash commands)

| Skill | When to use |
|-------|-------------|
| `/init-project` | Once, at the very start. Deep planning session (5 rounds of questions). |
| `/plan-feature` | Before each significant feature. Detailed feature-level planning. |
| `/start-session` | Every session start. Restores context, switches to active branch. |
| `/checkpoint` | Mid-session. Builds, commits, pushes, updates session log. |
| `/end-session` | End of session. Full debrief, commit, push. Context auto-syncs to main. |

### Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context — auto-loaded every session |
| `docs/session-log.md` | Session history and project state (source of truth) |
| `docs/PRD.md` | Product Requirements Document |
| `.claude/rules/` | Architecture, code style, and workflow rules |
| `.github/workflows/sync-context-to-main.yml` | Auto-syncs context files to main |

### GitHub Action: Auto-Sync

When you push to a `claude/*` branch, the GitHub Action automatically copies context files (CLAUDE.md, session-log, rules, skills) to `main`. This means every new Claude session starts with up-to-date context — no manual merging needed.

## Workflow

```
/init-project → Plan deeply (80% of the work)
     ↓
/start-session → Pick up where you left off
     ↓
/plan-feature → Plan before building each feature
     ↓
  Build → Write code, iterate
     ↓
/checkpoint → Save mid-session
     ↓
/end-session → Wrap up, auto-sync to main
     ↓
  New session → /start-session → seamless pickup
```

## Philosophy

- **80% planning, 20% execution**: The `/init-project` skill produces a comprehensive PRD, architecture rules, and session log before any code is written
- **Session continuity**: Every session ends with a detailed log entry. Every session starts by reading that log. No context is ever lost.
- **Automatic sync**: GitHub Actions handle syncing context to main — no manual steps, no stale sessions
