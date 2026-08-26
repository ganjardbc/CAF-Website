---
title: Introduction
description: What CAF is and how it works.
---

CAF (Coderium Agent Framework) is an AI agent orchestration framework with strict
governance — from ticket to PR.

Every task runs through the **Plan → Implement → Verify → PR** cycle, and every phase
has a mandatory human-review checkpoint. There's no auto-merge.

## Two core components

- **CAF Initiator** — a CLI scaffold generator that detects your project's stack and
  generates the knowledge base your agents need.
- **CAF Orchestrator** — a webhook receiver (Fastify + BullMQ + Redis) that runs on
  your own VPS, triggered by ticket status changes in Linear (Jira support is
  planned but not yet implemented).

Continue to [Quick Start](/docs/quick-start) to set up CAF in your repo.
