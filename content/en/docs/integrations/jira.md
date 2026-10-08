---
title: Jira
description: Jira support for CAF Orchestrator is planned but not yet implemented.
---

> **Not yet available.** CAF Orchestrator currently receives webhooks from
> Linear and GitHub only. Jira support is on the roadmap — this page describes the
> intended design and will be updated once it ships. There are no `JIRA_*`
> environment variables or `/webhooks/jira` endpoint in the current release.

CAF Initiator already knows Jira as a tracker: `caf-init scaffold` detects it (or
lets you pick it) and records it in `CLAUDE.md`. That affects the generated
knowledge base only — it does not make the Orchestrator trigger from Jira.

## Planned design

Once implemented, CAF Orchestrator will watch for status changes on Jira
tickets via webhook, the same way it does for [Linear](/docs/integrations/linear)
today:

1. Create an API token in Jira (**Account Settings → Security → API tokens**)
2. Register a webhook (Jira Cloud: an Automation rule with an "Issue
   transitioned" trigger; Jira Data Center/Server: **System → WebHooks** with
   the `Issue: updated` event) pointing at the Orchestrator
3. Configure which status means "Ready for AI", the same convention used for Linear

See [CAF Orchestrator](/docs/caf-orchestrator) for how the Linear- and GitHub-based
flows work today.
