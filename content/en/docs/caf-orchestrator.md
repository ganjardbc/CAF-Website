---
title: CAF Orchestrator
description: A self-hosted webhook receiver (Fastify + BullMQ + Redis) that runs agents per phase.
---

CAF Orchestrator is a small service that runs on your own VPS. It receives webhooks
from Linear, queues jobs per phase, then spawns headless Claude Code agents to
run Plan, Implement, Verify, and eventually open a PR.

> Only Linear is wired up today. Jira support is planned but not implemented —
> see [Jira](/docs/integrations/jira) for status.

## Requirements

- Node.js 22 or newer
- pnpm
- Redis
- The `claude` CLI available on PATH, with agent definitions (`planner`,
  `frontend`, `backend`, `qa`, `reviewer`, `documentation`) configured in the
  **target repo's** `.claude/agents/` — this is what [CAF Initiator](/docs/caf-initiator)
  scaffolds for you

## Setup

CAF Orchestrator runs as two Node.js processes (web server + worker) sharing
Redis as the queue backend — there's no Docker image today.

```bash
git clone <your-caf-orchestrator-repo-url>
cd caf-orchestrator
pnpm install
cp .env.example .env
# fill in REDIS_URL, LINEAR_WEBHOOK_SECRET, LINEAR_API_KEY, LINEAR_READY_STATE_ID,
# GITHUB_TOKEN, GITHUB_WEBHOOK_SECRET, and either CLAUDE_CODE_OAUTH_TOKEN or
# caf.config.yaml's openai.useOpenai + OPENAI_API_KEY
cp caf.config.example.yaml caf.config.yaml
```

Run both processes (each needs to keep running for tickets to be processed):

```bash
pnpm dev            # web server
pnpm dev:worker     # worker, separate process
```

Production:

```bash
pnpm build
pnpm start
pnpm start:worker
```

Once running, check its health endpoint:

```bash
curl http://localhost:PORT/healthz
```

See [Environment Variables](/docs/reference/environment-variables) for the
full list.

## Webhook configuration (Linear)

The Orchestrator triggers automatically when a ticket transitions into the
"Ready for AI" workflow state in Linear. Register a webhook in Linear pointing
to the Orchestrator's endpoint:

- Linear: `https://<your-vps-host>/webhooks/linear`
- GitHub (for automated PR review): `https://<your-vps-host>/webhooks/github`

The flow:

1. A ticket transitions to the "Ready for AI" state in Linear
2. Linear sends a webhook to the Orchestrator
3. The Orchestrator verifies the payload signature using `LINEAR_WEBHOOK_SECRET`
4. A pipeline job is queued in BullMQ
5. The Orchestrator runs the agent chain (planner → frontend/backend → QA →
   reviewer → docs) as headless `claude --agent <name>` processes, pushes a
   branch, and opens a GitHub PR

Every phase still stops at the human-review checkpoint — the Orchestrator never
merges a PR itself. On QA failure or a reviewer "changes requested" verdict,
the pipeline retries once, then stops and comments on the ticket for a human
to take over (there is no step-resume — a retry restarts the whole pipeline
from the planner).

## Automated PR review

The Orchestrator also listens for GitHub PR events (`/webhooks/github`) and
can run an automated review pass on PRs it opened, posting inline or general
comments back to the PR. This is separate from the Plan/Implement/Verify
pipeline above.

## Optional features (off by default)

- **Bull Board dashboard** — a `/admin/queues` view of pipeline jobs, behind
  basic auth. Enable via `dashboard.enabled` in `caf.config.yaml`.
- **Telegram notifications** — pipeline completion/failure alerts. Set
  `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` together.
- **OpenRouter model routing** — route specific agents through OpenRouter
  instead of the Claude Code CLI. Enable via `openai.useOpenai` in
  `caf.config.yaml` plus `OPENAI_API_KEY`.
- **Dynamic agent skip** — Planner can emit a `## Skip Agents` section in
  `tasks.md` to skip agents that aren't relevant for a ticket. Off by default;
  enable with `AGENT_SKIP_ENABLED=true`.

## Multi-repo

Running a single Orchestrator instance across multiple repos at once is still on the
roadmap and isn't available in `v0.1.0`. For now, run one Orchestrator instance per
repo. This page will be updated once multi-repo support ships.
