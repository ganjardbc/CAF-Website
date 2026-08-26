---
title: Linear
description: Connect CAF Orchestrator to Linear so your pipeline triggers automatically from ticket status.
---

CAF Orchestrator watches for status changes on Linear tickets via webhook, then
queues the matching phase. This page adds Linear-specific setup on top of the basics
covered in [CAF Orchestrator](/docs/caf-orchestrator).

## 1. Create an API key

In Linear, go to **Settings → API → Personal API keys** and create a new key with
read access to your workspace. Add it to the Orchestrator's `.env` as
`LINEAR_API_KEY`.

## 2. Register a webhook

Under **Settings → API → Webhooks**, add a new webhook:

- URL: `https://<your-vps-host>/webhooks/linear`
- Event: `Issue` — specifically status changes (`state changed`)
- Secret: match this to the Orchestrator's `LINEAR_WEBHOOK_SECRET`

## 3. Agree on a status mapping

The Orchestrator triggers phases based on ticket status. A recommended convention:

| Linear status | Phase triggered |
|---|---|
| Ready for Plan | Plan |
| Ready for Implement | Implement |
| Ready for Verify | Verify |
| In Review | Waiting for human review (no automatic trigger) |

These status names are just a convention, not hardcoded — adjust them to match your
team's workflow in the Orchestrator's configuration.

## What happens once the webhook is received

The flow is the same as described in [CAF Orchestrator](/docs/caf-orchestrator): the
payload gets verified, a job is queued in BullMQ, then a headless Claude Code agent
for that phase runs.
