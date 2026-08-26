---
title: CAF Initiator
description: CLI scaffold generator — automatic stack detection and agent knowledge base generation.
---

CAF Initiator is the CLI that scaffolds everything CAF needs in your repo: it
automatically detects your project's stack, then generates agent definitions and
artifact handoff templates.

> CAF Initiator is pre-1.0 (`v0.1.0`) and not published to a package registry yet.
> Install it by cloning the repo, not via `npx`/`npm install -g`.

## Installation

```bash
git clone https://github.com/ganjardbc/caf-initiator.git
cd caf-initiator

npm install
npm link
```

`npm link` makes the `caf-init` binary available globally.

**Requirements:**

- Node.js 18 or newer
- A repo that has already been initialized with `git init`

## Commands

Run `caf-init` with no subcommand to print help — there's no interactive
top-level menu; pick a subcommand explicitly.

### `caf-init scaffold`

The main command. Bare (no target), it runs **Setup → Golden Examples → ADR →
Agents → Task Completion → Workflow** in sequence, with a skip-confirmation
before each step:

1. Detects your project's stack (framework, package manager, folder structure)
2. Lets you select golden examples as AI reference material
3. Drafts Architecture Decision Records for detected technical choices
4. Generates `.claude/agents/` — definitions for each agent role (Planner,
   Architect, per-app implementation agents, QA, Reviewer, Documentation,
   DevOps, Auditor, PM, UX Designer)
5. Drafts the Definition of Done from verify scripts in `package.json`
6. Generates the PIV workflow and agent-handoff docs from your agent roster

Pass a target (`caf-init scaffold <target>`, one of `golden-examples`, `adr`,
`agents`, `task-completion`, `workflow`, `feature-catalog-sync`) to run just
that part.

### `caf-init docs`

Scaffolds optional, read-only Layer 1 reference docs (`docs/product/prd.md`,
Feature Specs, `docs/architecture/system-overview.md`, `docs/api-contract.md`,
`docs/schema/erd.md`, `docs/testing-strategy.md`). None of these are required
for the CAF pipeline to run.

### `caf-init export`

Copies already-generated agent definitions to other AI runner targets
(`.kiro/agents/`, `.opencode/agents/`, etc.), with explicit enforcement-risk
warnings.

### `caf-init curate`

Read-only Layer 1-4 compliance audit, then offers to sync missing sections
into `.claude/agents/*.md`. `--audit-only` isolates the report for CI gates.

## Generated file structure

```
.claude/
  agents/
    planner.md
    architect.md
    qa.md
    reviewer.md
    documentation.md
    ...
.ai/
  tasks/
    README.md
.caf/
  knowledge/
    golden-examples/
    decisions/
  workflows/
    piv-workflow.md
    agent-handoff.md
    task-completion.md
```

- **`.claude/agents/`** — one file per role, containing each agent's instructions and
  access boundaries (for example, the Reviewer is read-only until an explicit approval
  gate is granted).
- **`.ai/tasks/README.md`** — describes the artifact handoff convention. The
  per-ticket folders (`plan.md`, `implementation-notes.md`, `verify-report.md`)
  are written at runtime by the agents during a pipeline run — CAF Initiator
  only scaffolds the convention, not the ticket folders themselves.
