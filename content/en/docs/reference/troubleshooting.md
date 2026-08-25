---
title: Troubleshooting
description: Common issues when setting up CAF Initiator and CAF Orchestrator, and how to fix them.
---

The issues that come up most often during setup, grouped by component.

## CAF Initiator

**`caf-initiator init` doesn't detect the stack correctly**

Make sure the command runs from the repo's root (where `package.json`, `go.mod`, or
an equivalent manifest file lives), not from a subfolder. Stack detection depends on
manifest files in the current working directory.

**`.claude/agents/` already exists and won't regenerate**

CAF Initiator won't overwrite existing files so it doesn't erase your customizations
(see [Layer 2: Agent Definitions](/docs/core-concepts/layer-2)). Remove or move that
folder first if you actually want to regenerate it from scratch.

## CAF Orchestrator

**Webhook isn't triggering anything**

Check, in order:

1. The webhook URL in your tracker points to the right host and path
   (`/webhooks/linear` or `/webhooks/jira`)
2. `WEBHOOK_SECRET` in the Orchestrator's `.env` matches exactly the secret
   registered in the tracker
3. The ticket status name matches the configured mapping — see
   [Linear](/docs/integrations/linear) or [Jira](/docs/integrations/jira)

**`/healthz` endpoint isn't responding**

Check the container logs (`docker compose logs -f`) for startup errors — the most
common cause is an incorrect `REDIS_URL` or Redis not running yet.

**Agent stops and escalates to a human**

This isn't a bug — it's CAF's retry policy: a maximum of 3 attempts per phase before
escalation (see [Layer 4: Quality Gates](/docs/core-concepts/layer-4)). Check
`verify-report.md` in `.ai/tasks/<ticket-id>/` to see why the automated gate failed.

**PR doesn't open after the Implement phase finishes**

Usually a scope issue with the Git host token. Make sure `GITHUB_TOKEN`/
`GITLAB_TOKEN` has write access to the repo and can open pull requests — see
[GitHub / GitLab](/docs/integrations/github-gitlab) for the correct scopes.

## Still stuck?

This page will keep growing as new issues come up. Report anything not covered here
via GitHub.
