---
title: PIV Concept
description: The Plan, Implement, Verify discipline at the core of CAF.
---

PIV stands for **Plan → Implement → Verify** — the three core phases an agent runs
through before a PR gets created.

## Plan

The agent reads the ticket, drafts a work plan, and writes a Markdown artifact as the
output of this phase. A human reviews this plan before moving on to Implement.

## Implement

The agent writes code based on the approved plan. Every change is recorded in the
artifact handoff — not lost in chat context.

## Verify

A read-only scanner agent checks the implementation — lint, tests, automated review.
Read-only means this agent cannot change code without an explicit approval gate.

Once Verify passes, the final checkpoint is **human review** before a PR is created.
On a QA failure or a reviewer "changes requested" verdict, the pipeline retries
once, then stops and hands off to a human — there's no automatic multi-retry
escalation, and a retry restarts the whole pipeline (no step-resume).
