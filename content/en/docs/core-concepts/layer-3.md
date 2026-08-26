---
title: 'Layer 3: Artifact Handoff'
description: Why CAF stores every phase's output as a Markdown file in your repo, not in chat context.
---

Layer 3 is how CAF moves work from one phase to the next — through a Markdown file in
your repo, not through conversation context that disappears once the agent's session
ends.

## Why Markdown, not chat context

Chat context is ephemeral: once an agent session ends or restarts, all the nuance
behind its decisions goes with it. A Markdown artifact in the repo:

- Survives across sessions — the next phase's agent (even run days later) can still
  read the previous phase's decisions
- Can be reviewed by a human at any time, like reading a regular document
- Gets version-controlled in git, giving you a full audit trail per ticket

## Per-ticket file structure

Every ticket gets its own folder under `.ai/tasks/<ticket-id>/`:

```
.ai/tasks/<ticket-id>/
  requirements.md
  tasks.md
  verify-report.md
  qa-report.md
  review-notes.md
```

| File | Written by | Contents |
|---|---|---|
| `requirements.md` / `tasks.md` | Planner | The work plan and steps to be taken (Planner can also mark agents to skip here — see [CAF Orchestrator](/docs/caf-orchestrator)) |
| `verify-report.md` | Implementation agents | Changes made and the reasoning behind them |
| `qa-report.md` | QA | Lint, test results, and automated review findings |
| `review-notes.md` | Reviewer | Diff summary and checklist for human review |

## The read-write loop between phases

Every phase follows the same pattern:

1. Read the previous phase's artifact (if any) + context from
   [Layer 1](/docs/core-concepts/layer-1) + its own role definition from
   [Layer 2](/docs/core-concepts/layer-2)
2. Do the work within that phase's scope
3. Write its output as a new artifact before the phase ends

The human Reviewer reads the whole chain of artifacts — not just the code diff — to
understand *why* a decision was made, not just *what* changed.

## Relationship to other layers

The artifact format is determined by **Layer 2: Agent Definitions**.
`verify-report.md`, produced in this layer, feeds into
[Layer 4: Quality Gates](/docs/core-concepts/layer-4).
