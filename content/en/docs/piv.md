---
title: PIV Concept
description: The Plan, Implement, Verify discipline at the core of CAF.
---

PIV stands for **Plan → Implement → Verify** — the three core phases an agent runs
through before a PR gets created.

## Plan

The Planner agent reads the ticket and writes its plan as Markdown artifacts in
`.caf/tasks/<TICKET-ID>/`: the spec (`requirements.md`) and `tasks.md`, plus
`design.md` or `breakdown.md` when the request needs one. It does not touch code, and
it stops to ask when a blocking question has no answer. See
[Spec-Driven Development](/docs/sdd).

## Implement

An implementation agent writes code based on the spec and the tasks, restricted to its
own scope. The work is recorded in the artifact handoff — not lost in chat context.

## Verify

The implementation agent runs the repo's real lint, typecheck, test and build
commands and records the outcome in `verify-report.md`, with one evidence line per
acceptance criterion. Two more gates follow, run by agents that do not change code:
the **Validator** (`validate-report.md`, `Status: PASS | FAIL | NEEDS_HUMAN`, checking
every acceptance criterion by running its evidence) and the **Reviewer**
(`review-notes.md`, `Verdict: APPROVE | CHANGES REQUESTED | DEFER`).

## Two retries, counted in different places

- **Verify retry** — inside one agent. After a failed lint, typecheck or test, the
  agent fixes and verifies again, up to 3 times, then stops with
  `Status: NEEDS_HUMAN`.
- **Gate retry** — in the Orchestrator, per gate (validation, reviewer). It is the
  number of retries the Orchestrator allows when a gate fails, before it stops. The
  default is 1, to save tokens, and it is configurable
  (`agents.qa.maxRetries`, `agents.reviewer.maxRetries`).

## Where the human comes in

- **Manual session.** In Claude Code, the `caf-piv` skill makes the agent plan, wait
  for your go-ahead, implement, then verify.
- **CAF Orchestrator.** The agent chain runs by itself up to an open pull request.
  It can also wait for you earlier: on an open question in the spec, and — for tickets
  carrying the spec-approval label — for you to approve the spec. The last checkpoint
  is the PR review: nothing is ever merged automatically.

## When a gate fails

On a validation `FAIL` or a reviewer `CHANGES_REQUESTED` verdict, the Orchestrator
re-runs the implementation agent (once per gate by default). If the gate still fails,
it pushes the branch, opens a **Draft PR** carrying the failing report, and stops for
a human. From there you can fix it by hand or comment `/caf-retry-pipeline` to resume
from the failed gate — see
[CAF Orchestrator](/docs/caf-orchestrator#resuming-a-stopped-pipeline-caf-retry-pipeline).

Only an unexpected crash or timeout re-runs the whole pipeline from the Planner.
