---
title: Troubleshooting
description: Common issues when setting up CAF Initiator and CAF Orchestrator, and how to fix them.
---

The issues that come up most often during setup, grouped by component.

## CAF Initiator

**`caf-init scaffold` doesn't detect the stack correctly**

Make sure the command runs from the repo's root (where `package.json` lives), not
from a subfolder, or pass `--dir <path>`. Run it with `--dry-run` first to see what
was detected. If the repo mode is wrong, override it with `--mode single` or
`--mode mono`.

**A file already exists and won't regenerate**

CAF Initiator won't overwrite existing files by default, so it doesn't erase your
customizations (see [Layer 2: Agent Definitions](/docs/core-concepts/layer-2)).

- To pick up template fixes in agents without losing your edits, use
  `caf-init curate` — it only rewrites tracked sections you haven't touched.
- To regenerate from scratch, pass `--force` (`caf-init scaffold agents --force`,
  `caf-init scaffold skills --force`, or `caf-init export --force` for published
  copies in `.opencode/`, `.kiro/`, etc.). It overwrites in place, including any
  manual edits, so check `git diff` afterward.
- `caf-init export` only republishes agent definitions by default — pass
  `--kind both` (or `--kind command`) if the companion slash commands need
  refreshing too.

**Every section shows as `UNTRACKED` in `curate`**

There is no baseline yet. Review the agent sections, then run
`caf-init curate baseline`.

**A section shows as `DRIFT` right after `curate baseline`**

Known issue for `Input` of the QA and Reviewer agents in a monorepo, and for
`Working Pattern (PIV)` of the PM and UX Designer agents. Run
`caf-init curate --sync-only --dry-run` and review what it would change before
syncing.

**Agents ignore a skill**

The skill still has its `DRAFT` banner — usually `caf-verify`, when one of the lint,
typecheck, test or build scripts is missing from `package.json`. Resolve the `TODO`
lines and remove the whole banner (both lines of it), then re-run
`caf-init scaffold skills`: it offers the pointer to agents without a `## Skills`
section, and names the line to add yourself for agents that already have one.
`caf-init curate --check-drafts` reports a banner that was only half removed.

**The Orchestrator never runs my implementation agent (single-package repo)**

In `SINGLE_REPO` mode the agent is generated as `caf-implementer.md`, which the
Orchestrator does not route. Regenerate it with `--role frontend` or
`--role backend`.

## CAF Orchestrator

**Webhook isn't triggering anything**

Check, in order:

1. Both processes are running — the web server alone only accepts webhooks; the
   worker is what runs them
2. The webhook URL points to the right host and path (`/webhooks/linear` or
   `/webhooks/github`)
3. `LINEAR_WEBHOOK_SECRET` / `GITHUB_WEBHOOK_SECRET` in `.env` match exactly the
   secret registered on the other side
4. Linear: `linear.readyStateId` in `caf.config.yaml` is the UUID of the state
   you're moving tickets into, and the ticket's prefix matches a project's
   `ticketPrefix` — see [Linear](/docs/integrations/linear)
5. GitHub: the label matches `github.readyLabel`, the repo matches a project's
   `repoCloneUrl`, and the person who applied it has `write` access or higher
6. `ENABLE_PIPELINE_TRIGGER` isn't set to `false`

**A `/caf-review` or `/caf-retry-pipeline` comment is ignored**

These only work on PRs the pipeline opened (head branch `ai-agent/<TICKET-KEY>`),
from a user with `write`, `maintain` or `admin` permission. The comment must start
with the command. A rejected trigger returns `200 ignored`, so it won't show as a
failed delivery on GitHub.

**The Orchestrator fails to start**

Config is validated at startup. Common causes: `linear.readyStateId` missing or not
a UUID, an empty `projects:` map, no Claude Code auth path
(`CLAUDE_CODE_OAUTH_TOKEN`, or `openai.useOpenai: true` + `OPENAI_API_KEY`), only
one of the two Telegram variables set, or `dashboard.enabled: true` without
`dashboard.basicAuthUser` and `DASHBOARD_BASIC_AUTH_PASSWORD`.

**`/health` returns 503 or doesn't respond**

`503` means Redis is unreachable or `workspace.dir` isn't writable — the response
body says which. No response at all: check the process logs for startup errors; the
most common cause is an incorrect `REDIS_URL` or Redis not running yet.

**The pipeline stopped and opened a Draft PR**

This isn't a bug — a gate was still failing after its retries (see
[Layer 4: Quality Gates](/docs/core-concepts/layer-4)). The Draft PR body carries
the failing report; the same file is in `.caf/tasks/<TICKET-KEY>/`
(`verify-report.md`, `qa-report.md` or `review-notes.md`). Fix it by hand, or
comment `/caf-retry-pipeline` on the Draft PR to resume.

**`/caf-retry-pipeline` is rejected**

Either there is nothing to resume (the pipeline already succeeded), the branch no
longer exists on the remote, or the ticket has used up
`orchestration.maxOrchestrationRetries`. The comment the Orchestrator posts says
which.

**An agent fails with a model `404`, or no model override is applied**

Every model id — `openai.defaultModel` and each `agents.modelOverrides` value — must
be listed exactly in `openai.allowedModels`, which is empty by default. An id that
is listed but doesn't exist on the endpoint still fails at call time.

**"Workspace is busy"**

With `workspace.mode: persistent`, a second job for the same repo is rejected while
the first still holds the workspace. Trigger it again once the first run finishes.

**PR doesn't open after the pipeline finishes**

Usually a scope issue with the Git host token. Make sure `GITHUB_TOKEN` has
write access to the repo and can open pull requests — see
[GitHub / GitLab](/docs/integrations/github-gitlab) for the correct scopes.

**The dashboard returns 404**

It is off by default. Set `dashboard.enabled: true` and `dashboard.basicAuthUser` in
`caf.config.yaml`, and `DASHBOARD_BASIC_AUTH_PASSWORD` in `.env`.

## Still stuck?

This page will keep growing as new issues come up. Report anything not covered here
on GitHub: [caf-initiator](https://github.com/coderiumid/caf-initiator/issues) or
[caf-orchestrator](https://github.com/coderiumid/caf-orchestrator/issues).
