---
title: Troubleshooting
description: Common issues when setting up CAF Initiator and CAF Orchestrator, and how to fix them.
---

The issues that come up most often during setup, grouped by component.

## CAF Initiator

**`caf-init scaffold` doesn't detect the stack correctly**

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

1. The webhook URL in Linear points to the right host and path (`/webhooks/linear`)
2. `LINEAR_WEBHOOK_SECRET` in the Orchestrator's `.env` matches exactly the secret
   registered in Linear
3. `LINEAR_READY_STATE_ID` matches the UUID of the workflow state you're
   transitioning tickets into — see [Linear](/docs/integrations/linear)

**`/healthz` endpoint isn't responding**

Check the process logs (`pnpm dev` / `pnpm start` output, or your process
manager's logs) for startup errors — the most common cause is an incorrect
`REDIS_URL` or Redis not running yet.

**Agent stops and hands off to a human**

This isn't a bug — it's CAF's retry policy: one retry on QA failure or reviewer
"changes requested" before stopping (see [Layer 4: Quality Gates](/docs/core-concepts/layer-4)).
Check `qa-report.md` or `review-notes.md` in `.ai/tasks/<ticket-id>/` to see why
the automated gate failed.

**PR doesn't open after the Implement phase finishes**

Usually a scope issue with the Git host token. Make sure `GITHUB_TOKEN` has
write access to the repo and can open pull requests — see
[GitHub / GitLab](/docs/integrations/github-gitlab) for the correct scopes.

## Still stuck?

This page will keep growing as new issues come up. Report anything not covered here
via GitHub.
