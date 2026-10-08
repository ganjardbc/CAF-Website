---
title: 'Layer 4: Quality Gates'
description: The automated gates and the human gate every change passes before it can be merged.
---

Layer 4 is the mechanism that decides whether a phase's output is good enough to move
on. There are automated gates and one human gate.

## The automated gates

| Gate | Run by | Report | Passes when |
|---|---|---|---|
| Implementation verify | The implementation agent, running its Verify Checklist (lint, typecheck, test, build) | `verify-report.md` | The report says `SUCCESS` |
| QA | `caf-qa` — does not change code | `qa-report.md` | `Status: PASS` |
| Reviewer | `caf-reviewer` | `review-notes.md` | `Verdict: APPROVE` |

QA reports; it does not fix. Its only write is `qa-report.md`, so the quality check
can't quietly "fix" what it finds — a failure goes back to the implementation agent
and is recorded in [Layer 3: Artifact Handoff](/docs/core-concepts/layer-3).

## The human gate

Once the automated gates pass, CAF Orchestrator opens a pull request. Merging it is
an explicit human decision. This gate can't be automated — CAF provides no way to
bypass it.

## Why both are required

The automated gates catch what a machine can detect — lint errors, failing tests,
risky code patterns. But not every decision can be reduced to an automated rule:
business context, architectural trade-offs, or risk that's only visible to someone
who understands the project. The human gate closes that gap.

## Retry policy

On a QA `FAIL` or a reviewer `CHANGES REQUESTED` verdict, the implementation agent
is re-run — once per gate by default (`agents.qa.maxRetries` /
`agents.reviewer.maxRetries`). If the gate is still not passed, the work is not left
stranded: the Orchestrator pushes the branch, opens a **Draft PR** with the failing
report as its body, and stops for a human.

From there a human can fix it by hand, or resume the pipeline from the failed gate
by commenting `/caf-retry-pipeline` on the Draft PR. Resumes are capped by
`orchestration.maxOrchestrationRetries` (default 2).

An unexpected failure — an agent crash or timeout — is different: it retries the
whole job from the Planner.

## Skipping a gate

With `AGENT_SKIP_ENABLED=true` (off by default), the Planner may mark QA or Reviewer
as not relevant for a ticket. The skip is never silent: the PR body gets an explicit
warning that a quality gate was skipped.

## No auto-merge

This is a direct consequence of Layer 4: there's no path — no matter how clean the
automated gates' results are — that lets a PR get merged without human approval. This
governance is what sets CAF apart from agent orchestrators that chase speed through
auto-merge.

## Relationship to other layers

Layer 4 consumes the reports from **Layer 3**, and its gate decision
determines whether [Layer 5: Orchestration](/docs/core-concepts/layer-5) is allowed
to advance the pipeline or has to stop for a human.
