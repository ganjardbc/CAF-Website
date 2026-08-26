---
title: 'Layer 1: Project Knowledge Base'
description: The foundation of CAF's architecture — the project context every agent reads before acting.
---

Layer 1 is the foundation of CAF's five-layer architecture. It holds context about
your specific project — not general knowledge about a framework or language, but the
decisions and conventions that apply to your own repo.

## Why this layer exists

Without a Project Knowledge Base, every agent would have to re-guess your stack,
folder structure, and code conventions each time it runs — leading to inconsistent
results across tickets, and agents that might make decisions conflicting with
existing patterns in the repo. Layer 1 ensures every agent — Planner, Implementer,
Verifier, Reviewer — reads the same context before starting work.

## What it contains

- **Stack & tooling** — framework, package manager, runtime version, automatically
  detected by CAF Initiator during `scaffold`
- **Folder structure** — the file placement conventions already in place in the repo
- **Architecture decisions** — deliberate constraints or patterns (e.g. "all state
  management uses X, not Y")
- **Existing code standards** — linter/formatter rules, naming conventions already in
  use

## Where this file lives

CAF Initiator generates this knowledge base as `CLAUDE.md`/`AGENTS.md` at the repo
root when you run `caf-init scaffold`. These files can be edited manually at any
time — CAF Initiator never overwrites existing files on subsequent runs.

## Relationship to other layers

Layer 1 is the input for [Layer 2: Agent Definitions](/docs/core-concepts/layer-2) —
every agent definition in `.claude/agents/` refers back to `CLAUDE.md`/`AGENTS.md` so each role's
behavior stays aligned with the same project context.
