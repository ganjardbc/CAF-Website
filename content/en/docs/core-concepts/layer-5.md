---
title: 'Layer 5: Orchestration'
description: How CAF Orchestrator strings the previous four layers into one self-running pipeline.
---

Layer 5 is the layer that runs everything — stringing Layers 1 through 4 into a
single pipeline that moves automatically from a ticket status change all the way to a
PR ready for review. This is what **CAF Orchestrator** does.

## What orchestration does

1. Receives a webhook when a ticket's status changes in Linear or Jira
2. Queues a job for the matching phase via BullMQ + Redis
3. Spawns a headless Claude Code agent for that phase — the agent reads
   [Layer 1](/docs/core-concepts/layer-1) and [Layer 2](/docs/core-concepts/layer-2),
   then writes its output to [Layer 3](/docs/core-concepts/layer-3)
4. Waits for the result of [Layer 4: Quality Gates](/docs/core-concepts/layer-4)
   before deciding whether to move on to the next phase or stop and wait for a human

The Orchestrator never skips this order. If a gate fails or is waiting on approval,
the pipeline stops right there — there's no shortcut to the next phase.

## Why self-hosted

The Orchestrator runs on your own VPS, not as a service managed by Coderium. The
consequence: your project's code and artifacts never leave infrastructure you
control. This isn't a minor implementation detail — it's part of CAF's privacy
guarantee.

Installation details, webhook configuration, and environment variables are covered
on the [CAF Orchestrator](/docs/caf-orchestrator) page.

## Five layers, one pipeline

| Layer | Role |
|---|---|
| [1. Project Knowledge Base](/docs/core-concepts/layer-1) | Project context every agent reads |
| [2. Agent Definitions](/docs/core-concepts/layer-2) | Roles, access boundaries, retry policy for each agent |
| [3. Artifact Handoff](/docs/core-concepts/layer-3) | Each phase's output, stored as Markdown in the repo |
| [4. Quality Gates](/docs/core-concepts/layer-4) | Automated gate + human gate before advancing |
| 5. Orchestration | Runs the above automatically, self-hosted |

These five layers are what make CAF more than "just running an AI agent" — governance
lives in every layer, not just at one final checkpoint.
