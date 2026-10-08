---
title: Introduction
description: What CAF is and how it works.
---

CAF (Coderium Agent Framework) runs AI agents as an engineering team that takes a
ticket from plan to pull request, with strict governance along the way.

Every task runs through the **Plan → Implement → Verify → PR** cycle. Each gate that
fails stops the pipeline and hands the work to a human, and nothing is ever merged
automatically.

## Two core components

- **CAF Initiator** — the `caf-init` CLI. It detects your repo's stack, package
  manager and ticket tracker, then writes CAF's starter files: knowledge base, agent
  definitions, workflow docs, slash commands and skills. It never calls an AI model;
  anything it can't detect is left as a `TODO`.
- **CAF Orchestrator** — a webhook receiver (Fastify + BullMQ + Redis) that runs on
  your own VPS. When a ticket becomes ready — a Linear workflow state or a GitHub
  Issue label — it runs the agents in sequence and opens the pull request. Jira
  support is planned but not yet implemented.

You can use CAF Initiator on its own: the agents it generates also run directly in
Claude Code, without the Orchestrator.

Continue to [Quick Start](/docs/quick-start) to set up CAF in your repo.
