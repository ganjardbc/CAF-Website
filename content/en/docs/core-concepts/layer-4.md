---
title: 'Layer 4: Quality Gates'
description: The two gates that must be passed before a PR can be created or merged.
---

Layer 4 is the mechanism that decides whether a phase's output is good enough to move
on to the next phase. There are two kinds of gates, and both are mandatory — neither
can be skipped.

## Two kinds of gates

### The automated gate (Verifier)

Run by the read-only Verifier agent: lint, tests, and automated review of the
Implement output. Read-only here isn't just a technical detail — it's the guarantee
that the quality-check process can't quietly "fix" code without a trace, because the
Verifier simply has no write access. Its results are recorded as `verify-report.md`
in [Layer 3: Artifact Handoff](/docs/core-concepts/layer-3).

### The human gate

Once the automated gate passes, the final checkpoint before a PR is created or merged
is explicit approval from a human. This gate can't be automated at all — CAF provides
no way to bypass it.

## Why both are required

The automated gate catches what a machine can detect — lint errors, failing tests,
risky code patterns. But not every decision can be reduced to an automated rule:
business context, architectural trade-offs, or risk that's only visible to someone
who understands the project. The human gate closes that gap.

## Retry policy

If the automated gate fails, or the human-facing Reviewer returns "changes
requested", the pipeline retries once. If it fails again, CAF stops and hands off
to a human instead of continuing to retry without direction — there's no
step-resume, so a retry re-runs the whole pipeline from the Planner.

## No auto-merge

This is a direct consequence of Layer 4: there's no path — no matter how clean the
automated gate's results are — that lets a PR get merged without human approval. This
governance is what sets CAF apart from agent orchestrators that chase speed through
auto-merge.

## Relationship to other layers

Layer 4 consumes `verify-report.md` from **Layer 3**, and its gate decision
determines whether [Layer 5: Orchestration](/docs/core-concepts/layer-5) is allowed
to advance the pipeline to the next phase or has to wait for a human.
