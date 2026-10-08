---
title: Environment Variables
description: Every .env variable used by CAF Orchestrator, gathered in one page.
---

A full reference of the `.env` variables used by CAF Orchestrator — secrets and
operational toggles. Structural (non-secret) config lives in `caf.config.yaml`
instead; copy it from `caf.config.example.yaml`. See
[Structural config](#structural-config-cafconfigyaml) below for the fields people
most often look for here.

CAF Initiator needs no environment variables.

## Core

| Variable | Required | Description |
|---|---|---|
| `REDIS_URL` | Yes | Connection to the Redis instance used for the BullMQ queue |
| `LINEAR_WEBHOOK_SECRET` | Yes | Secret used to verify incoming Linear webhook payloads |
| `LINEAR_API_KEY` | Yes | Linear API key, used to read tickets and post comments |

## Git host

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Yes | Fine-grained PAT used to push branches, open PRs and post comments/reviews |
| `GITHUB_WEBHOOK_SECRET` | Yes | Secret used to verify incoming GitHub webhook payloads (`/webhooks/github`) |

## Claude Code / model auth

One of the following is required, or the Orchestrator fails to start:

| Variable | Description |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | Native Claude Code CLI auth, passed through unchanged to spawned agents. Used when `openai.useOpenai` is `false` (the default) |
| `OPENAI_API_KEY` | Required if `caf.config.yaml`'s `openai.useOpenai` is `true` — routes spawned agents through an Anthropic-compatible endpoint (OpenRouter by default) |

## Feature flags

| Variable | Required | Default | Description |
|---|---|---|---|
| `ENABLE_PIPELINE_TRIGGER` | No | `true` | Kill switch for every webhook trigger (ticket pipeline, resume and PR review) |
| `AGENT_SKIP_ENABLED` | No | `false` | Honors a `## Skip Agents` section in `tasks.md` to skip agents not relevant to a ticket |

Accepted values: `true`, `false`, `1`, `0`.

## Optional

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Both together, or neither | Pipeline start/completion/failure notifications |
| `DASHBOARD_BASIC_AUTH_PASSWORD` | If `dashboard.enabled: true` in `caf.config.yaml` | Basic-auth password for the monitoring dashboard at `/dashboard` |
| `NODE_ENV`, `LOG_LEVEL` | No | Runtime environment and log verbosity |

`CAF_HEADLESS` is **not** configurable: the Orchestrator always sets it to `1` on
every agent it spawns. Don't put it in `.env`.

## Structural config (`caf.config.yaml`)

These are not environment variables:

| Field | Required | Description |
|---|---|---|
| `linear.readyStateId` | Yes | UUID of the Linear workflow state that triggers the pipeline (your "Ready for AI" state) |
| `projects:` | Yes, at least one | Per-project `ticketPrefix`, `repoCloneUrl`, `baseBranch`, `workspaceDir` |
| `github.readyLabel` | No (default `ready-for-ai`) | Label that triggers the pipeline from a GitHub Issue |
| `server.port` | No (default `3000`) | Port of the web server |
| `dashboard.enabled` / `dashboard.basicAuthUser` | No | Turn on the dashboard and set its username |

See [CAF Orchestrator](/docs/caf-orchestrator#configuration) for the rest.

## Not yet available

Jira and GitLab are on the roadmap but not implemented — there are no
`JIRA_*` or `GITLAB_TOKEN` variables today. See
[Jira](/docs/integrations/jira) and [GitHub / GitLab](/docs/integrations/github-gitlab)
for current status.

Details on how to obtain each credential are on their respective pages:
[Linear](/docs/integrations/linear) and
[GitHub / GitLab](/docs/integrations/github-gitlab).
