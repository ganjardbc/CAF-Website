---
title: CAF Initiator
description: CLI scaffold generator — automatic stack detection and agent knowledge base generation.
---

CAF Initiator is the CLI that scaffolds everything CAF needs in your repo: it
automatically detects your project's stack, then generates agent definitions and
artifact handoff templates.

> CAF Initiator is pre-1.0 (`v0.1.0`), published on npm as
> [`caf-initiator`](https://www.npmjs.com/package/caf-initiator).

## Installation

Run directly with `npx` — no install needed:

```bash
npx -p caf-initiator caf-init scaffold
```

Or install the `caf-init` binary globally:

```bash
npm install -g caf-initiator
caf-init scaffold
```

**Requirements:**

- Node.js 18 or newer
- A repo that has already been initialized with `git init`

## Commands

Run `caf-init` with no subcommand to print help — there's no interactive
top-level menu; pick a subcommand explicitly (`scaffold`, `export`, `curate`, `docs`).

All file writes are **non-destructive by default** — an existing file is never
silently overwritten, so re-running a command is always safe. `scaffold` and
`export` both accept `--force` as an explicit opt-in escape hatch when you
actually want to regenerate a file that already exists (for example after
upgrading `caf-initiator` and wanting the latest agent templates) — it
overwrites in place, including any manual edits you made since the last
generate, so review your `git diff` afterward.

### `caf-init scaffold`

The main command. Bare (no target), it runs **Setup → Golden Examples → ADR →
Agents → Task Completion → Workflow** in sequence, with a skip-confirmation
before each step:

1. Detects your project's stack (framework, package manager, folder structure)
2. Lets you select golden examples as AI reference material
3. Drafts Architecture Decision Records for detected technical choices
4. Generates `.claude/agents/` — definitions for each agent role (Planner,
   Architect, per-app Frontend/Backend implementation agents, QA, Reviewer,
   Documentation, DevOps, Auditor, PM, UX Designer)
5. Drafts the Definition of Done from verify scripts in `package.json`
6. Generates the PIV workflow and agent-handoff docs from your agent roster

`docs` (Reference Docs) and `feature-catalog-sync` are never part of this
bare chain — both are opt-in, run them as an explicit target.

Pass a target (`caf-init scaffold <target>`, one of `golden-examples`, `adr`,
`agents`, `task-completion`, `workflow`, `feature-catalog-sync`) to run just
that part, with the same behavior as running it standalone.

| Option | Description | Default |
|---|---|---|
| `--dir <path>` | Target repo directory | `cwd` |
| `--dry-run` | Show detection results without writing anything | `false` |
| `--app <app-path>` | Restrict to a specific app path (e.g. `apps/api`) — used by `golden-examples`/`adr`/`agents`/`task-completion` targets | all apps |
| `--agent-dir <path>` | Directory to read/write agent definitions | `.claude/agents` |
| `--command-dir <path>` | Directory to write companion slash commands — used by `agents`/`feature-catalog-sync` targets | `.claude/commands` |
| `--force` | Overwrite files that already exist instead of skipping them — only used by the `agents` target | `false` |

#### `caf-init scaffold agents`

The Frontend/Backend implementation agents can each be assigned **more than
one app** — pick both `apps/web` and `apps/landing` for the Frontend role, for
example, and the generated `caf-frontend.md` gets a scope listing every app
plus an instruction to read the app tag on each task line in `tasks.md`
(`- [ ] (apps/web) Fix email validation`). A role assigned exactly one app
still renders the plain single-app format — nothing changes for a
non-monorepo project or a role with a single app.

### `caf-init docs`

Scaffolds optional, read-only Layer 1 reference docs (`docs/product/prd.md`,
Feature Specs, `docs/architecture/system-overview.md`, `docs/api-contract.md`,
`docs/schema/erd.md`, `docs/testing-strategy.md`). None of these are required
for the CAF pipeline to run — existing files are never overwritten, and
interactive mode asks per item before creating a placeholder.

| Option | Description | Default |
|---|---|---|
| `--dir <path>` | Target repo directory | `cwd` |
| `--dry-run` | Show detection results without writing anything | `false` |
| `--include <items...>` | Non-interactive: only generate these items (`product`, `architecture`, `schema`, `testing-strategy`, `api-contract`) | interactive prompts |
| `--feature <name...>` | Non-interactive: Feature Spec names to generate placeholders for | interactive prompt |

### `caf-init export`

Copies already-generated agent and/or command definitions to other AI runner
targets (`.kiro/`, `.opencode/`, `.cursor/`, `.clinerules/`, or a custom
folder), with explicit enforcement-risk warnings before publishing to a
target whose scope/tool enforcement hasn't been validated.

| Option | Description | Default |
|---|---|---|
| `--dir <path>` | Target repo directory | `cwd` |
| `--agent-dir <path>` | Source directory containing existing agent definitions | `.claude/agents` |
| `--kind <agent\|command\|both>` | What to publish — agent definitions, companion slash commands, or both | `agent` |
| `--dry-run` | Show what would be published without writing anything | `false` |
| `--force` | Overwrite files that already exist at the destination instead of skipping them | `false` |

`--kind` defaults to `agent` only — pass `--kind both` (or `--kind command`)
if you also want the companion slash commands republished, otherwise a
`--force` run will refresh your agents but silently leave stale commands
untouched at the destination.

### `caf-init curate`

Read-only Layer 1-4 compliance audit, then offers to sync missing sections
into `.claude/agents/*.md`. `--audit-only` isolates the report for CI gates.

| Option | Description | Default |
|---|---|---|
| `--dir <path>` | Target repo directory | `cwd` |
| `--agent-dir <path>` | Directory containing existing agent definitions | `.claude/agents` |
| `--output <file>` | Also save the audit report as markdown to this path | none |
| `--audit-only` | Report only, non-interactive — exit code 1 on required gaps (for CI gates) | `false` |
| `--sync-only` | Skip the audit report, go straight to the sync flow | `false` |
| `--dry-run` | With `--sync-only`: show what would be added without writing or prompting | `false` |

## Generated file structure

```
.claude/
  agents/
    caf-planner.md
    caf-architect.md
    caf-frontend.md
    caf-backend.md
    caf-qa.md
    caf-reviewer.md
    caf-documentation.md
    ...
  commands/
    caf-plan-ticket.md
    ...
.ai/
  tasks/
    README.md
.caf/
  knowledge/
    INDEX.md
    golden-examples/
    decisions/
  workflows/
    piv-workflow.md
    agent-handoff.md
    task-completion.md
```

- **`.claude/agents/`** — one file per role, containing each agent's instructions and
  access boundaries (for example, the Reviewer is read-only until an explicit approval
  gate is granted). Frontend/Backend can each cover more than one app — see
  `caf-init scaffold agents` above.
- **`.claude/commands/`** — companion slash commands generated alongside certain
  roles (Planner, Architect, QA, Reviewer, Auditor, PM, ...).
- **`.ai/tasks/README.md`** — describes the artifact handoff convention. The
  per-ticket folders under `.caf/tasks/{TICKET-ID}/` (`requirements.md`,
  `tasks.md`, `verify-report.md`, ...) are written at runtime by the agents
  during a pipeline run — CAF Initiator only scaffolds the convention, not the
  ticket folders themselves.
