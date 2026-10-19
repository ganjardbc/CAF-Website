---
title: 'Layer 5: Orchestration'
description: How CAF Orchestrator strings the previous four layers into one self-running pipeline.
---

Layer 5 is the layer that runs everything — stringing Layers 1 through 4 into a
single pipeline that moves automatically from a ready ticket all the way to a
PR ready for review. This is what **CAF Orchestrator** does.

## What orchestration does

1. Receives a webhook when a ticket becomes "Ready for AI" — a Linear ticket
   entering the configured workflow state, or a GitHub Issue getting the configured
   label (Jira support is planned but not yet implemented)
2. Queues one pipeline job via BullMQ + Redis
3. Clones the target repo and runs the agents in sequence as headless Claude Code
   processes: `caf-planner` → `caf-frontend` / `caf-backend` → `caf-validator` →
   `caf-reviewer`, plus `caf-documentation` when the repo has it. Each agent reads
   [Layer 1](/docs/core-concepts/layer-1) and [Layer 2](/docs/core-concepts/layer-2),
   then writes its output to [Layer 3](/docs/core-concepts/layer-3)
4. Reads the spec after the Planner: an open question stops the run and is asked on the
   ticket, and a ticket behind the spec-approval label waits for `/caf-approve-spec`
5. Checks each [Layer 4 quality gate](/docs/core-concepts/layer-4) before moving on
6. Pushes the branch `ai-agent/<TICKET-KEY>`, opens a GitHub PR, and reports back on
   the ticket

The Orchestrator never skips this order. If a gate is exhausted, the pipeline stops
right there with a Draft PR — there's no shortcut to the next stage.

It also runs AI review on the PRs it opened, driven by PR comments (`/caf-review`,
`/caf-fix-review`), and can show every run on a live monitoring dashboard.

## Why self-hosted

The Orchestrator runs on your own VPS, not as a service managed by Coderium. The
consequence: your project's code and artifacts never leave infrastructure you
control. This isn't a minor implementation detail — it's part of CAF's privacy
guarantee. The git token is never written into a workspace, and the validator runs
without the Orchestrator's secrets in its environment.

Installation details, webhook configuration, and environment variables are covered
on the [CAF Orchestrator](/docs/caf-orchestrator) page.

## Orchestration is optional

Layers 1–4 work without it: the agents CAF Initiator generates also run directly in
Claude Code, or through the generated `/caf-plan` and `/caf-run` commands.

## Five layers, one pipeline

| Layer | Role |
|---|---|
| [1. Project Knowledge Base](/docs/core-concepts/layer-1) | Project context every agent reads |
| [2. Agent Definitions](/docs/core-concepts/layer-2) | Roles, access boundaries, retry policy for each agent |
| [3. Artifact Handoff](/docs/core-concepts/layer-3) | Each phase's output, stored as Markdown in the repo |
| [4. Quality Gates](/docs/core-concepts/layer-4) | Spec gate, automated gates and the human gate before merging |
| 5. Orchestration | Runs the above automatically, self-hosted |

These five layers are what make CAF more than "just running an AI agent" — governance
lives in every layer, not just at one final checkpoint.
