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

# 2. Generate the drafts and the CAF skills (one summary, one Enter)
npx -p caf-initiator caf-init scaffold

# 3. In your AI runner (e.g. Claude Code), fill in the TODOs
/caf-complete-drafts

# 4. Check the result, then review the diff and commit
npx -p caf-initiator caf-init curate --check-drafts
```

Or install the `caf-init` binary globally first:

```bash
npm install -g caf-initiator
caf-init scaffold
```

`scaffold` will:

1. Detect your project's stack (framework, package manager, repo mode) and tracker,
   then show one summary and ask `Proceed? (Y/n/e)`. One Enter when the tracker has a
   single signal; `--yes` asks nothing
2. Write the drafts: `CLAUDE.md`, `AGENTS.md`, `.caf/tasks/README.md` and the golden
   examples in `.caf/knowledge/`
3. Generate the five agents (`caf-planner`, `caf-frontend`, `caf-backend`,
   `caf-validator`, `caf-reviewer`) in `.claude/agents/`, and their companion slash
   commands (`/caf-plan`, `/caf-run`; `scaffold agents` also offers `/caf-review` and
   `/caf-fix-review`)
4. Write the nine CAF skills in `.claude/skills/`
5. Draft the Definition of Done, the PIV workflow and the agent-handoff docs
6. Generate `/caf-complete-drafts`, the command that fills in the remaining `TODO`s

Everything it writes is a deterministic draft. Review it before your team or agents
rely on it.

## 2. Try the Planner

You can use the generated agents without any server. In Claude Code, ask for a spec:

```
/caf-plan Add an email field to the signup form
```

The Planner writes `requirements.md` and `tasks.md` under `.caf/tasks/<ID>/` and stops.
Review the spec, then let `/caf-run` take it through implementation, validation and
review in the same session. See [Spec-Driven Development](/docs/sdd) for what the spec
contains.

See [CAF Initiator](/docs/caf-initiator) for the full command reference
(`scaffold`, `curate`, `export`).

## 3. Connect CAF Orchestrator

This step is optional. Set up CAF Orchestrator when you want tickets to run
automatically once they become ready in Linear or GitHub Issues:

```bash
git clone https://github.com/coderiumid/caf-orchestrator.git
cd caf-orchestrator
pnpm install
cp .env.example .env                         # secrets and operational toggles
cp caf.config.example.yaml caf.config.yaml   # structural config
pnpm dev            # web server
pnpm dev:worker     # worker, separate process
```

The Orchestrator calls agents by filename, so keep the generated names
(`caf-frontend.md` / `caf-backend.md`, including in a single-package repo). It runs
`caf-validator` when the repo has that file and `caf-qa` otherwise.

See [CAF Orchestrator](/docs/caf-orchestrator) for full setup, requirements,
and the webhook configuration.
