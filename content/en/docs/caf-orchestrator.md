---
title: CAF Orchestrator
description: A self-hosted webhook receiver (Fastify + BullMQ + Redis) that runs agents per phase.
---

CAF Orchestrator is a small service that runs on your own VPS. It receives webhooks
from your tracker, queues jobs per phase, then spawns headless Claude Code agents to
run Plan, Implement, Verify, and eventually open a PR.

## Setup

The Orchestrator ships as a Docker image — the fastest way to run it is with
`docker compose`:

```bash
docker compose up -d
```

Before that, prepare an `.env` file with the following variables:

| Variable | Description |
|---|---|
| `REDIS_URL` | Connection to the Redis instance used for the BullMQ queue |
| `CLAUDE_CODE_TOKEN` | Credential used to run Claude Code headlessly |
| `WEBHOOK_SECRET` | Secret used to verify incoming webhook payloads |
| `LINEAR_API_KEY` / `JIRA_API_TOKEN` | Tracker credentials, whichever you use |

Once the container is running, check its health endpoint:

```bash
curl http://localhost:PORT/healthz
```

## Webhook configuration (Linear / Jira)

The Orchestrator triggers automatically from ticket status changes. Register a
webhook in your tracker pointing to the Orchestrator's endpoint:

- Linear: `https://<your-vps-host>/webhooks/linear`
- Jira: `https://<your-vps-host>/webhooks/jira`

The flow:

1. A ticket's status changes (e.g. to "Ready for Plan") in Linear/Jira
2. The tracker sends a webhook to the Orchestrator
3. The Orchestrator verifies the payload signature using `WEBHOOK_SECRET`
4. A job for the matching phase is queued in BullMQ
5. The Orchestrator spawns a headless Claude Code agent for that phase

Every phase still stops at the human-review checkpoint — the Orchestrator never
advances to the next phase without explicit approval.

## Multi-repo

Running a single Orchestrator instance across multiple repos at once is still on the
roadmap and isn't available in v1.0.0. For now, run one Orchestrator instance per
repo. This page will be updated once multi-repo support ships.
