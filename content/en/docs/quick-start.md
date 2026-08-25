---
title: Quick Start
description: Set up CAF Initiator in your repo with one command.
---

Run CAF Initiator from your repo's root:

```bash
npx caf-initiator init
```

This command will:

1. Detect your project's stack (framework, package manager, repo structure)
2. Generate `.claude/agents/` — definitions for each agent role
3. Generate `.ai/tasks/` — the artifact handoff template used between phases

Once that's done, connect CAF Orchestrator to your tracker (Linear or Jira) so tasks
run automatically as ticket status changes.

> This section is still a skeleton placeholder — full CAF Orchestrator installation
> content will follow in a later phase.
