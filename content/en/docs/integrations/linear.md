---
title: Linear
description: Connect CAF Orchestrator to Linear so your pipeline triggers automatically from ticket status.
---

CAF Orchestrator watches for status changes on Linear tickets via webhook, then
runs the agent pipeline. This page adds Linear-specific setup on top of the basics
covered in [CAF Orchestrator](/docs/caf-orchestrator).

## 1. Create an API key

In Linear, go to **Settings → API → Personal API keys** and create a new key. The
Orchestrator uses it to read tickets and post comments on them. Add it to the
Orchestrator's `.env` as `LINEAR_API_KEY`.

## 2. Register a webhook

Under **Settings → API → Webhooks**, add a new webhook:

- URL: `https://<your-vps-host>/webhooks/linear`
- Event: `Issue`
- Secret: match this to the Orchestrator's `LINEAR_WEBHOOK_SECRET`

## 3. Set the "Ready for AI" state

The pipeline is triggered by **one** workflow state. Create a state in your Linear
team (for example "Ready for AI") and put its UUID in `caf.config.yaml`:

```yaml
linear:
  readyStateId: 00000000-0000-0000-0000-000000000000
```

The name of the state doesn't matter — only the UUID is matched. Startup fails fast
if `linear.readyStateId` is missing.

## 4. Map the ticket prefix to a project

Tickets are routed by their key prefix. For tickets like `ABC-123`, add a project
with `ticketPrefix: ABC`:

```yaml
projects:
  your-project:
    ticketPrefix: ABC
    repoCloneUrl: https://github.com/your-org/your-repo.git
    baseBranch: main
    workspaceDir: /tmp/caf-orchestrator/workspace/your-project
```

## What happens once the webhook is received

The Orchestrator verifies the signature and timestamp, then dedupes by delivery ID.
It only reacts to an actual state transition into the ready state — editing another
field of a ticket that is already there triggers nothing. From there the whole agent
chain runs as described in [CAF Orchestrator](/docs/caf-orchestrator#the-pipeline),
and the result is posted back as a comment on the ticket.

Moving a ticket back into the ready state while its `ai-agent/<TICKET-KEY>` branch
still exists **resumes** the stopped pipeline instead of starting a new one.
