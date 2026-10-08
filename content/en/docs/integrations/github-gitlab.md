---
title: GitHub / GitLab
description: How CAF Orchestrator uses GitHub — as the place PRs are opened, as a ticket trigger, and for AI PR review.
---

GitHub plays three roles for CAF Orchestrator: it is where every PR is opened, it
can be the ticket source (GitHub Issues), and its PR comments drive AI review and
pipeline resumes.

> **GitLab is not yet supported.** Only GitHub is implemented today —
> there's no `GITLAB_TOKEN` handling in the current release. This page will
> be updated once GitLab support ships.

## Required credentials

Both are required in the Orchestrator's `.env`:

- `GITHUB_TOKEN` — a fine-grained personal access token restricted to the relevant
  repo(s), with `Contents: Read and write` and `Pull requests: Read and write`. Add
  `Issues: Read and write` if you trigger from GitHub Issues, so the Orchestrator
  can comment on them.
- `GITHUB_WEBHOOK_SECRET` — the secret you set on the repo webhook.

## Register the webhook

In each target repo, under **Settings → Webhooks**, add:

- Payload URL: `https://<your-vps-host>/webhooks/github`
- Content type: `application/json`
- Secret: the same value as `GITHUB_WEBHOOK_SECRET`
- Events: `Issues`, `Issue comments`, `Pull request review comments`

## GitHub Issues as the ticket source

Apply the label set in `github.readyLabel` (default `ready-for-ai`) to an issue and
the full pipeline runs for it. The project is matched by repository (each project's
`repoCloneUrl`), and the ticket key becomes `<ticketPrefix>-<issue number>`. Results
are posted back as a comment on the issue.

## PR comment commands

On a PR this pipeline opened (head branch `ai-agent/<TICKET-KEY>`):

| Comment | What it does |
|---|---|
| `/caf-retry-pipeline` | Resumes a pipeline that stopped at a gate (on its Draft PR) |
| `/caf-review` | Runs a full AI review and posts it as a GitHub PR review |
| `/caf-fix-review` | The Reviewer addresses every review comment on the PR |
| A reply in an inline review thread | The Reviewer addresses that one thread |

Only users with `write`, `maintain` or `admin` permission on the repo can trigger
these (and the issue label); the permission is checked live on every trigger.
Comments from bot accounts are ignored. See
[CAF Orchestrator](/docs/caf-orchestrator#automated-pr-review).

## What the Orchestrator does with the token

1. Clones the repo and pushes the branch `ai-agent/<TICKET-KEY>`
2. Opens a pull request once the
   [Layer 4 quality gates](/docs/core-concepts/layer-4) pass — or a **Draft PR**
   carrying the failing report when a gate is exhausted
3. Posts comments, replies and PR reviews

## The Orchestrator never merges a PR

The Orchestrator has no merge step. Once a PR is open, the merge
decision still goes through your normal review process on GitHub — we
recommend keeping branch protection rules enabled on your repo so CAF's
"no auto-merge" policy is also enforced at the platform level, not just by the
Orchestrator.
