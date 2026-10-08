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
existing patterns in the repo. Layer 1 ensures every agent — Planner, implementation
agents, QA, Reviewer — reads the same context before starting work.

## What it contains

- **Stack & tooling** — repo mode (monorepo or single repo), apps, framework per
  app, package manager, database and ticket tracker, detected by CAF Initiator
  during `scaffold`
- **Verification commands** — the lint, typecheck, test and build scripts that
  actually exist in `package.json`
- **Golden examples** — the files you pick as the reference for how code should look
- **Architecture decisions** — ADR drafts for technical choices already visible in
  the repo
- **Code conventions and business context** — written by you; CAF Initiator never
  invents them

## Where these files live

```
CLAUDE.md                        # project context for agents
AGENTS.md                        # concrete rules for agents
.caf/knowledge/
  INDEX.md                       # status of the optional reference docs
  golden-examples/               # RULES.md pointing at your best files
  decisions/                     # ADR drafts
docs/                            # optional reference docs (caf-init docs)
```

`caf-init scaffold` generates them as **drafts**. CAF Initiator never calls an AI
model: whatever it could not detect is left as a `TODO`, never guessed. Fill the
`TODO`s in by hand, or run the generated `/caf-complete-drafts` command in your AI
runner — it takes facts only from the code and asks you for the human-owned parts
(business context, ADR reasoning, golden-example choices). Then check the result
with `caf-init curate --check-drafts`.

These files can be edited at any time — CAF Initiator never overwrites an existing
file on a later run.

## Relationship to other layers

Layer 1 is the input for [Layer 2: Agent Definitions](/docs/core-concepts/layer-2) —
every agent definition in `.claude/agents/` refers back to `CLAUDE.md`/`AGENTS.md` so each role's
behavior stays aligned with the same project context.
