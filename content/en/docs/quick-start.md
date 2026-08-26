---
title: Quick Start
description: Set up CAF Initiator in your repo, then connect CAF Orchestrator.
---

## 1. Run CAF Initiator

CAF Initiator is published on npm as `caf-initiator`. From your target repo's root:

```bash
npx -p caf-initiator caf-init scaffold
```

Or install the `caf-init` binary globally first:

```bash
npm install -g caf-initiator
caf-init scaffold
```

This command will:

1. Detect your project's stack (framework, package manager, repo structure)
2. Generate `.claude/agents/` — definitions for each agent role
3. Draft the PIV workflow and agent-handoff docs used between phases

See [CAF Initiator](/docs/caf-initiator) for the full command reference
(`scaffold`, `docs`, `export`, `curate`).

## 2. Connect CAF Orchestrator

Once your repo has agent definitions, set up CAF Orchestrator so tickets run
automatically as their status changes in Linear:

```bash
git clone <your-caf-orchestrator-repo-url>
cd caf-orchestrator
pnpm install
cp .env.example .env
# fill in the required variables — see Environment Variables reference
pnpm dev
pnpm dev:worker
```

See [CAF Orchestrator](/docs/caf-orchestrator) for full setup, requirements,
and the webhook configuration.
