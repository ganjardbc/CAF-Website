---
title: Quick Start
description: Set up CAF Initiator in your repo, then connect CAF Orchestrator.
---

## 1. Run CAF Initiator

CAF Initiator is published on npm as `caf-initiator` and needs Node.js 18 or newer.
From your target repo's root:

```bash
# 1. Preview — detects the stack and lists what would be written
npx -p caf-initiator caf-init scaffold --dry-run

# 2. Generate the drafts (asks before each step)
npx -p caf-initiator caf-init scaffold

# 3. Optional: add the CAF skills
npx -p caf-initiator caf-init scaffold skills

# 4. In your AI runner (e.g. Claude Code), fill in the TODOs
/caf-complete-drafts

# 5. Check the result, then review the diff and commit
npx -p caf-initiator caf-init curate --check-drafts
```

Or install the `caf-init` binary globally first:

```bash
npm install -g caf-initiator
caf-init scaffold
```

`scaffold` will:

1. Detect your project's stack (framework, package manager, repo mode) and tracker
2. Write the knowledge-base drafts: `CLAUDE.md`, `AGENTS.md`, `.caf/knowledge/`
3. Generate `.claude/agents/caf-*.md` and their companion slash commands
4. Draft the Definition of Done, the PIV workflow and the agent-handoff docs
5. Generate `/caf-complete-drafts`, the command that fills in the remaining `TODO`s

Everything it writes is a deterministic draft. Review it before your team or agents
rely on it.

See [CAF Initiator](/docs/caf-initiator) for the full command reference
(`scaffold`, `curate`, `docs`, `export`).

## 2. Connect CAF Orchestrator

This step is optional — the generated agents already run directly in Claude Code.
Set up CAF Orchestrator when you want tickets to run automatically once they become
ready in Linear or GitHub Issues:

```bash
git clone https://github.com/coderiumid/caf-orchestrator.git
cd caf-orchestrator
pnpm install
cp .env.example .env                         # secrets and operational toggles
cp caf.config.example.yaml caf.config.yaml   # structural config
pnpm dev            # web server
pnpm dev:worker     # worker, separate process
```

The Orchestrator calls agents by filename. In a single-package repo, generate the
implementation agent with `--role frontend` or `--role backend` so it is written as
`caf-frontend.md` / `caf-backend.md` — see
[Repo mode](/docs/caf-initiator#repo-mode-monorepo-vs-single_repo).

See [CAF Orchestrator](/docs/caf-orchestrator) for full setup, requirements,
and the webhook configuration.
