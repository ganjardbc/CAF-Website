---
title: Jira
description: Connect CAF Orchestrator to Jira so your pipeline triggers automatically from ticket status.
---

Just like Linear, CAF Orchestrator watches for status changes on Jira tickets via
webhook. This page adds Jira-specific setup on top of the basics covered in
[CAF Orchestrator](/docs/caf-orchestrator).

## 1. Create an API token

In Jira, go to **Account Settings → Security → API tokens** and create a new token.
Add it to the Orchestrator's `.env` as `JIRA_API_TOKEN`, along with `JIRA_EMAIL` and
`JIRA_BASE_URL` for the account used.

## 2. Register a webhook

Jira webhooks are configured at the project or instance level, depending on your
Jira plan:

- **Jira Cloud**: use the Automation feature (**Project settings → Automation**),
  create a rule with an "Issue transitioned" trigger that sends a web request to
  `https://<your-vps-host>/webhooks/jira`
- **Jira Data Center/Server**: register it under **System → WebHooks** with the
  `Issue: updated` event

Include a header with the same secret as the Orchestrator's `WEBHOOK_SECRET` so the
payload can be verified.

## 3. Agree on a status mapping

Same as Linear, the Orchestrator triggers phases based on ticket status:

| Jira status | Phase triggered |
|---|---|
| Ready for Plan | Plan |
| Ready for Implement | Implement |
| Ready for Verify | Verify |
| In Review | Waiting for human review (no automatic trigger) |

Adjust the status names to match your Jira workflow — this is a convention, not a
value hardcoded into the Orchestrator.

## What happens once the webhook is received

The flow is identical to Linear: the payload gets verified, a job is queued in
BullMQ, then a headless Claude Code agent for that phase runs. See
[CAF Orchestrator](/docs/caf-orchestrator) for the full details.
