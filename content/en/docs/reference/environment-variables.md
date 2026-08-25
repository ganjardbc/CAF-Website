---
title: Environment Variables
description: Every .env variable used by CAF Orchestrator, gathered in one page.
---

A full reference of the `.env` variables mentioned across the other docs pages —
gathered here so you don't have to jump between pages during setup.

## Core

| Variable | Required | Description |
|---|---|---|
| `REDIS_URL` | Yes | Connection to the Redis instance used for the BullMQ queue |
| `CLAUDE_CODE_TOKEN` | Yes | Credential used to run Claude Code headlessly |
| `WEBHOOK_SECRET` | Yes | Secret used to verify incoming webhook payloads from your tracker |

## Tracker

| Variable | Required | Description |
|---|---|---|
| `LINEAR_API_KEY` | If using Linear | Personal API key with read access to your workspace |
| `JIRA_API_TOKEN` | If using Jira | API token from Account Settings → Security |
| `JIRA_EMAIL` | If using Jira | Email of the account that created the token above |
| `JIRA_BASE_URL` | If using Jira | Your Jira instance URL, e.g. `https://your-team.atlassian.net` |

## Git host

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | If your repo is on GitHub | Fine-grained PAT with `Contents` and `Pull requests` scope |
| `GITLAB_TOKEN` | If your repo is on GitLab | Project access token with `write_repository` and `api` scope |

Only fill in the tracker and git host variables that match your stack — you don't
need both Linear and Jira, or both GitHub and GitLab, at once.

Details on how to obtain each credential are on their respective pages:
[CAF Orchestrator](/docs/caf-orchestrator), [Linear](/docs/integrations/linear),
[Jira](/docs/integrations/jira), and
[GitHub / GitLab](/docs/integrations/github-gitlab).
