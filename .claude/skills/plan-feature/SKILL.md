---
name: plan-feature
description: Deep-dive planning for a specific feature — asks detailed questions, analyzes codebase, writes implementation plan before any coding
---

# Plan Feature — Feature-Level Deep Planning

Use this before implementing any significant feature. Gathers requirements, analyzes the existing codebase, identifies affected files, and produces a clear implementation plan.

## Rules

- Use `AskUserQuestion` for gathering requirements — never assume
- Read relevant existing code before proposing changes
- Do NOT write any application code — only produce the plan
- The plan must be specific enough that implementation is straightforward
- Identify edge cases and potential issues BEFORE coding starts

## Process

### Step 1 — Understand the Feature

Use `AskUserQuestion` to ask:

1. **What**: What does this feature do? Describe the user-facing behavior.
2. **Why**: Why is this needed? What problem does it solve?
3. **Who**: Who uses this feature? What user role?
4. **Scope**: What's in scope and what's NOT in scope for this feature?

### Step 2 — Analyze the Codebase

Read existing code to understand:
- Which files and components are related to this feature
- Existing patterns and conventions to follow
- Shared utilities or services that can be reused
- Database tables/schema that are affected

Report findings to the user.

### Step 3 — Design the Implementation

Use `AskUserQuestion` to refine:

1. **Data model**: Any new tables, columns, or schema changes needed?
2. **API endpoints**: New routes? Changes to existing ones?
3. **UI components**: New pages or components? Changes to existing ones?
4. **Business logic**: Key algorithms or workflows?
5. **Edge cases**: What could go wrong? Invalid inputs? Empty states? Concurrent access?
6. **Testing**: How will we verify this works?

### Step 4 — Write the Plan

Output a structured plan with:

```
## Feature: [Name]

### Summary
[1-2 sentences]

### Files to Create
- path/to/file.ts — description of what it does

### Files to Modify
- path/to/existing.ts — what changes and why

### Data Model Changes
- New table/column descriptions (if any)

### API Changes
- New/modified endpoints with request/response shapes

### Implementation Steps
1. [Ordered steps, specific enough to follow]
2. ...

### Edge Cases to Handle
- [List of edge cases identified]

### Testing Plan
- [How to verify the feature works]
```

### Step 5 — Confirm with User

Present the plan. Ask: "Ready to implement, or want to adjust anything?"

Once approved, add the plan to the current session log entry and proceed to implementation.
