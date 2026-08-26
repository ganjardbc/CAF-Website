---
title: Environment Variables
description: Every .env variable used by CAF Orchestrator, gathered in one page.
---

A full reference of the `.env` variables mentioned across the other docs pages —
gathered here so you don't have to jump between pages during setup. Structural
(non-secret) config — server port, agent retries, dashboard, OpenRouter routing —
lives in `caf.config.yaml` instead; copy it from `caf.config.example.yaml`.

## Core

| Variable | Required | Description |
|---|---|---|
| `REDIS_URL` | Yes | Connection to the Redis instance used for the BullMQ queue |
| `LINEAR_WEBHOOK_SECRET` | Yes | Secret used to verify incoming Linear webhook payloads |
| `LINEAR_API_KEY` | Yes | Personal API key with read access to your Linear workspace |
| `LINEAR_READY_STATE_ID` | Yes | UUID of the Linear workflow state that triggers the pipeline (your "Ready for AI" state) |

## Git host

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Yes | Fine-grained PAT with `Contents` and `Pull requests` scope, used to push branches and open PRs |
| `GITHUB_WEBHOOK_SECRET` | Yes, for automated PR review | Secret used to verify incoming GitHub webhook payloads (`/webhooks/github`) |

## Claude Code / model auth

One of the following is required, or the Orchestrator fails to start:

| Variable | Description |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | Native Claude Code CLI auth, passed through unchanged to spawned agents |
| `OPENAI_API_KEY` | Required if `caf.config.yaml`'s `openai.useOpenai` is `true` — routes spawned agents through OpenRouter |

## Feature flags

| Variable | Required | Default | Description |
|---|---|---|---|
| `ENABLE_PIPELINE_TRIGGER` | No | `true` | Master switch for whether incoming webhooks trigger a pipeline run |
| `AGENT_SKIP_ENABLED` | No | `false` | Honors a `## Skip Agents` section in `tasks.md` to skip agents not relevant to a ticket |

## Optional

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Both together, or neither | Pipeline completion/failure notifications |
| `DASHBOARD_BASIC_AUTH_PASSWORD` | If `dashboard.enabled: true` in `caf.config.yaml` | Basic-auth password for the Bull Board dashboard at `/admin/queues` |

## Not yet available

Jira and GitLab are on the roadmap but not implemented — there are no
`JIRA_*` or `GITLAB_TOKEN` variables today. See
[Jira](/docs/integrations/jira) and [GitHub / GitLab](/docs/integrations/github-gitlab)
for current status.

Details on how to obtain each credential are on their respective pages:
[CAF Orchestrator](/docs/caf-orchestrator) and [Linear](/docs/integrations/linear).
