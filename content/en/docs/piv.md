---
title: PIV Concept
description: The Plan, Implement, Verify discipline at the core of CAF.
---

PIV stands for **Plan → Implement → Verify** — the three core phases an agent runs
through before a PR gets created.

## Plan

The Planner agent reads the ticket and writes its plan as Markdown artifacts
(`requirements.md`, `tasks.md`) in `.caf/tasks/<TICKET-ID>/`. It does not touch code.

## Implement

An implementation agent writes code based on the plan, restricted to its own scope.
The work is recorded in the artifact handoff — not lost in chat context.

## Verify

The implementation agent runs the repo's real lint, typecheck, test and build
commands and records the outcome in `verify-report.md`. Two more gates follow, run
by agents that do not change code: **QA** (`qa-report.md`, `Status: PASS | FAIL`) and
**Reviewer** (`review-notes.md`, `Verdict: APPROVE | CHANGES REQUESTED | DEFER`).

## Where the human comes in

- **Manual session.** In Claude Code, the `caf-piv` skill makes the agent plan, wait
  for your go-ahead, implement, then verify.
- **CAF Orchestrator.** The agent chain runs by itself up to an open pull request.
  The human checkpoint is the PR review: nothing is ever merged automatically.

## When a gate fails

On a QA `FAIL` or a reviewer `CHANGES REQUESTED` verdict, the Orchestrator re-runs
the implementation agent (once per gate by default). If the gate still fails, it
pushes the branch, opens a **Draft PR** carrying the failing report, and stops for a
human. From there you can fix it by hand or comment `/caf-retry-pipeline` to resume
from the failed gate — see
[CAF Orchestrator](/docs/caf-orchestrator#resuming-a-stopped-pipeline-caf-retry-pipeline).

Only an unexpected crash or timeout re-runs the whole pipeline from the Planner.
