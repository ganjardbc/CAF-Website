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

Every ticket gets its own folder under `.caf/tasks/<TICKET-ID>/`:

```
.caf/tasks/<TICKET-ID>/
  requirements.md
  tasks.md
  verify-report.md
  qa-report.md
  review-notes.md
```

| File | Written by | Contents |
|---|---|---|
| `requirements.md` / `tasks.md` | Planner | The work plan. `tasks.md` is split into `## Frontend Tasks`, `## Backend Tasks` and `## Docs Tasks`, which is how the Orchestrator decides which agents run (Planner can also mark agents to skip here — see [CAF Orchestrator](/docs/caf-orchestrator)) |
| `verify-report.md` | Implementation agents | Changes made and the result of the verification commands |
| `qa-report.md` | QA | Acceptance-criteria matrix and a `Status: PASS \| FAIL` line |
| `review-notes.md` | Reviewer | Review findings and a `Verdict: APPROVE \| CHANGES REQUESTED \| DEFER` line |

Two more files can appear when CAF Orchestrator is in use:

- `fix-review-log.md` — written by the Reviewer when it addresses PR review
  comments (`/caf-fix-review`), one block per comment with
  `Status: FIXED | SKIPPED | NOT_APPLICABLE`
- `orchestration-state.json` — written by the Orchestrator itself, not by an agent,
  when a gate fails. It carries the resume state and is deleted once the pipeline
  succeeds

CAF Initiator only scaffolds the convention (`.caf/tasks/README.md`). The ticket
folders are written at runtime.

## Status lines are a contract

CAF Orchestrator reads these reports with simple patterns: the word `SUCCESS` in
`verify-report.md`, the `Status:` line in `qa-report.md`, and the `Verdict:` line in
`review-notes.md`. Those lines come from the tracked `Retry Logic` and
`Report Format` sections of the agent definitions — leave them as generated.

## The read-write loop between phases

Every phase follows the same pattern:

1. Read the previous phase's artifact (if any) + context from
   [Layer 1](/docs/core-concepts/layer-1) + its own role definition from
   [Layer 2](/docs/core-concepts/layer-2)
2. Do the work within that phase's scope
3. Write its output as a new artifact before the phase ends

The human reviewer reads the whole chain of artifacts — not just the code diff — to
understand *why* a decision was made, not just *what* changed.

## Relationship to other layers

The artifact format is determined by **Layer 2: Agent Definitions**. The reports
produced in this layer feed into
[Layer 4: Quality Gates](/docs/core-concepts/layer-4).
