---
title: CAF Initiator
description: CLI scaffold generator — automatic stack detection and agent knowledge base generation.
---

CAF Initiator is the CLI that scaffolds everything CAF needs in your repo: it
automatically detects your project's stack, then generates agent definitions and
artifact handoff templates.

## Installation

The fastest way, no global install needed — run it directly with `npx`:

```bash
npx caf-initiator init
```

If you use it often across many repos, install it globally instead:

```bash
npm install -g caf-initiator
caf-initiator init
```

**Requirements:**

- Node.js 18 or newer
- A repo that has already been initialized with `git init`

## Commands

### `caf-initiator init`

The main command. Runs the full scaffold flow:

1. Detects your project's stack (framework, package manager, folder structure)
2. Generates `.claude/agents/` — definitions for each agent role (Planner,
   Implementer, Verifier, Reviewer)
3. Generates `.ai/tasks/` — the artifact handoff template used between phases

### `caf-initiator export`

Exports your customized agent configuration into a single file that can be shared or
versioned separately from your main repo — useful if you want to reuse the same
configuration across multiple repos.

> Additional commands will be documented here as they ship in future releases.

## Generated file structure

```
.claude/
  agents/
    planner.md
    implementer.md
    verifier.md
    reviewer.md
.ai/
  tasks/
    <ticket-id>/
      plan.md
      implementation-notes.md
      verify-report.md
```

- **`.claude/agents/`** — one file per role, containing each agent's instructions and
  access boundaries (for example, the Verifier is read-only until an explicit approval
  gate is granted).
- **`.ai/tasks/<ticket-id>/`** — the artifact handoff for a single ticket. Each phase
  writes its output here as a Markdown file, instead of it being lost in chat context
  once the session ends.
