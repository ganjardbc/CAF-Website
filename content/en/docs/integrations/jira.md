---
title: Jira
description: Jira support for CAF Orchestrator is planned but not yet implemented.
---

> **Not yet available.** CAF Orchestrator currently only receives webhooks from
> Linear. Jira support is on the roadmap — this page describes the intended
> design and will be updated once it ships. There are no `JIRA_*` environment
> variables or `/webhooks/jira` endpoint in the current release.

## Planned design

Once implemented, CAF Orchestrator will watch for status changes on Jira
tickets via webhook, the same way it does for [Linear](/docs/integrations/linear)
today:

1. Create an API token in Jira (**Account Settings → Security → API tokens**)
2. Register a webhook (Jira Cloud: an Automation rule with an "Issue
   transitioned" trigger; Jira Data Center/Server: **System → WebHooks** with
   the `Issue: updated` event) pointing at the Orchestrator
3. Agree on a status-to-phase mapping, the same convention used for Linear

See [CAF Orchestrator](/docs/caf-orchestrator) for how the Linear-based flow
works today.
