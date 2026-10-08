---
title: CAF Orchestrator
description: A self-hosted webhook receiver (Fastify + BullMQ + Redis) that runs the agent pipeline from ticket to PR.
---

CAF Orchestrator is a small service that runs on your own VPS. When a ticket becomes
"Ready for AI", it clones the target repo, runs a chain of headless
`claude --agent <name>` processes (`caf-planner` → `caf-frontend` / `caf-backend` →
`caf-qa` → `caf-reviewer` → `caf-documentation`), pushes an `ai-agent/<TICKET-KEY>`
branch, opens a GitHub PR, and reports the result back on the ticket.

It also runs AI review on existing PRs, driven by PR comments.

> Linear and GitHub Issues can both trigger the pipeline today. Jira support is
> planned but not implemented — see [Jira](/docs/integrations/jira) for status.
> Source: [github.com/coderiumid/caf-orchestrator](https://github.com/coderiumid/caf-orchestrator).

## What triggers it

| Trigger | Where | Result |
|---|---|---|
| Linear ticket moves into the `linear.readyStateId` state | `POST /webhooks/linear` | Full agent pipeline |
| GitHub Issue gets the `github.readyLabel` label (default `ready-for-ai`) | `POST /webhooks/github` | Full agent pipeline |
| `/caf-retry-pipeline` comment on a Draft PR, or a Linear ticket re-entering "Ready for AI" while its branch still exists | either webhook | Resume a pipeline that stopped at a gate |
| `/caf-review` comment on a PR | `POST /webhooks/github` | Full review, posted as a GitHub PR review |
| `/caf-fix-review` comment on a PR | `POST /webhooks/github` | Reviewer addresses every review comment on the PR |
| Reply inside an inline review thread | `POST /webhooks/github` | Reviewer addresses that one thread |

GitHub-side triggers require the commenter or labeler to have `write`, `maintain` or
`admin` permission on the repo; anyone else is silently ignored. The PR-comment
triggers only work on PRs this pipeline produced (head branch
`ai-agent/<TICKET-KEY>`). `ENABLE_PIPELINE_TRIGGER=false` is a kill switch for all
of them.

## Requirements

- Node.js 22 or newer
- pnpm
- Redis
- `git`, with push access to the target repo(s)
- The `claude` CLI available on PATH, with agent definitions (`caf-planner`,
  `caf-frontend`, `caf-backend`, `caf-qa`, `caf-reviewer`, `caf-documentation`)
  present in the **target repo's** `.claude/agents/` — this is what
  [CAF Initiator](/docs/caf-initiator) scaffolds for you. The Orchestrator only
  knows their names and invokes them

## Setup

CAF Orchestrator runs as two processes sharing Redis as the queue backend:

- **Web server** — receives and validates Linear/GitHub webhooks, enqueues jobs,
  and serves the monitoring dashboard.
- **Worker** — dequeues jobs and runs them: `agent-pipeline` (ticket → PR) and
  `pr-review` (PR comment → review).

Both must be running for anything to be processed — the web server alone only
accepts webhooks.

```bash
git clone https://github.com/coderiumid/caf-orchestrator.git
cd caf-orchestrator
pnpm install
cp .env.example .env                           # secrets and operational toggles
cp caf.config.example.yaml caf.config.yaml     # structural config
```

Fill in both files (see [Configuration](#configuration)), then run both processes:

```bash
pnpm dev            # web server
pnpm dev:worker     # worker, separate process
```

Production, without Docker:

```bash
pnpm build
pnpm start
pnpm start:worker
```

Production, with Docker (`docker-compose.yml` runs `redis`, `api` and `worker` from
one image):

```bash
docker compose build
docker compose up -d
```

Once running, check its health endpoint:

```bash
curl http://localhost:PORT/health
```

Returns `200` with `{ status: "healthy", services: { redis, disk } }` when
both the Redis connection and a write probe into `workspace.dir` succeed, or
`503` with `status: "unhealthy"` otherwise.

### Deploying with Docker

The repo's `deploy.sh` pulls `origin/main`, rebuilds the image and restarts the
services — meant to be run both manually and from CI. Flags include `--skip-pull`
and `--skip-build`. The bundled GitHub Actions workflow runs typecheck, lint, test
and build on every push and PR, then calls `deploy.sh` on the VPS over SSH for
pushes to `main`.

## Configuration

Config is split across two files, both validated at startup — an invalid or
incomplete config fails fast.

### `.env` — secrets and operational toggles

See [Environment Variables](/docs/reference/environment-variables) for the full
list. Required: `REDIS_URL`, `LINEAR_WEBHOOK_SECRET`, `LINEAR_API_KEY`,
`GITHUB_TOKEN`, `GITHUB_WEBHOOK_SECRET`, and one Claude Code auth path
(`CLAUDE_CODE_OAUTH_TOKEN`, or `OPENAI_API_KEY` together with
`openai.useOpenai: true`).

### `caf.config.yaml` — structural config

`caf.config.example.yaml` lists every field and its default. The parts you must set:

- `linear.readyStateId` — UUID of the "Ready for AI" workflow state.
- `projects:` — at least one entry. Each project has a `ticketPrefix` (e.g. `ABC`
  for `ABC-123`), `repoCloneUrl`, `baseBranch` and an absolute `workspaceDir`.

Commonly tuned:

| Field | What it controls | Default |
|---|---|---|
| `github.readyLabel` | Label that makes a GitHub Issue "Ready for AI" | `ready-for-ai` |
| `workspace.mode` | `ephemeral` (fresh clone per job) or `persistent` (reuse one checkout per repo) | `ephemeral` |
| `agents.qa.maxRetries` / `agents.reviewer.maxRetries` | Gate retries within one run | `1` each |
| `orchestration.maxOrchestrationRetries` | How many times a gate-exhausted ticket can be resumed; overridable per project | `2` |
| `claude.agentTimeoutMs` | Timeout per agent process | 30 minutes |
| `queue.workerConcurrency` | Concurrent pipeline jobs per worker | `1` |
| `queue.jobAttempts` | Whole-job retries after an unexpected failure | `3` |
| `openai.*`, `agents.modelOverrides` | Model routing (see below) | off |
| `dashboard.enabled`, `dashboard.basicAuthUser`, `db.path` | Monitoring dashboard | off |

## Webhook configuration

Register the webhooks pointing at the Orchestrator:

- **Linear** — `https://<your-vps-host>/webhooks/linear`, secret =
  `LINEAR_WEBHOOK_SECRET`. See [Linear](/docs/integrations/linear).
- **GitHub** (per target repo) — `https://<your-vps-host>/webhooks/github`, secret =
  `GITHUB_WEBHOOK_SECRET`, events `Issues`, `Issue comments` and
  `Pull request review comments`. See
  [GitHub / GitLab](/docs/integrations/github-gitlab).

Every payload's signature is verified, and deliveries are deduplicated by delivery
ID.

## The pipeline

1. Clone the target repo into the project's workspace and create branch
   `ai-agent/<TICKET-KEY>`. Linear tickets are routed to a project by ticket prefix,
   GitHub Issues by repository.
2. Run `caf-planner`, which must produce `.caf/tasks/<TICKET-KEY>/tasks.md`.
3. Read `tasks.md`: the `## Frontend Tasks` / `## Backend Tasks` headers decide
   which implementation agents run (`caf-frontend`, then `caf-backend`).
4. Run the implementation agent(s), then read `verify-report.md`.
5. Run `caf-qa` → `qa-report.md`. On `FAIL`, re-run implementation up to
   `agents.qa.maxRetries` times.
6. Run `caf-reviewer` → `review-notes.md`. On `CHANGES REQUESTED`, re-run
   implementation up to `agents.reviewer.maxRetries` times.
7. If `tasks.md` has real `## Docs Tasks`, run `caf-documentation`. A docs failure
   never fails the job.
8. Commit, push, open the GitHub PR, and post the final comment (PR link plus the QA
   and reviewer reports) on the Linear ticket or GitHub Issue.

The Orchestrator never merges a PR itself.

### When a gate is exhausted

When a gate (implementation verify, QA or reviewer) is still failing after its
retries, the work is not left stranded: the branch is pushed and a **Draft PR** is
opened — or updated, if one is already open — with the failing report as its body.
The pipeline then stops and comments for a human, who can either fix it by hand or
resume it.

### Failures that are not gates

- An agent crash or timeout retries the whole job from the Planner, up to
  `queue.jobAttempts`.
- A `429` (API quota exhausted) or `404` (model not found) from an agent stops the
  pipeline cleanly with a comment instead of retrying — repeating it would just fail
  the same way.

### Resuming a stopped pipeline (`/caf-retry-pipeline`)

A gate-exhausted run isn't a dead end. Resume it either by:

- Commenting `/caf-retry-pipeline` on the Draft PR, or
- Flipping the Linear ticket back to the ready state (the Orchestrator detects
  the branch `ai-agent/<TICKET-KEY>` already exists via the GitHub API and
  resumes it instead of starting a new ticket)

Both paths converge on the same resume logic — neither has its own counter or
gate-selection code.

**How the state survives between invocations.** On every gate failure, the
Orchestrator writes `orchestration-state.json` into
`.caf/tasks/<TICKET-KEY>/` in the workspace — `orchestrationRetryCount`,
`lastFailedGate` (`implementation`/`qa`/`reviewer`), `lastKnownCommitSha`, and
the ticket's title/description (so a resume can rebuild the planner-less
prompt without re-fetching the original ticket). That folder is part of the
normal commit-and-push at the end of every run, so the file travels **on the
branch itself** — it survives even with the default `ephemeral` workspace
mode, which deletes the local clone after each job. On full pipeline success
the file is deleted; its absence is what a resume trigger checks to reject a
ticket that has nothing to resume.

**What a resume actually does:**

1. Confirms the branch still exists on the remote. A retry triggered after the PR
   was merged and the branch deleted stops with a comment; it never falls back to a
   fresh checkout.
2. Re-syncs onto the existing branch (never creates a new one). For a
   `persistent`-mode checkout, it first runs a read-only `git status` and
   **stops with a comment** if it finds uncommitted residue (e.g. a prior run
   interrupted mid-write) — it does not silently discard local changes here,
   unlike the normal non-retry sync path.
3. Checks the retry budget: rejects with a comment if no state exists, or if
   `orchestrationRetryCount` has already reached
   `orchestration.maxOrchestrationRetries`; otherwise increments the counter.
4. If HEAD has moved past `lastKnownCommitSha` (a human pushed a commit while
   the ticket was stopped), a `git diff --stat` of that gap is computed and
   handed to the resumed agent as extra context — this never blocks the
   resume, only uncommitted residue from step 2 does.
5. Skips the planner entirely. `lastFailedGate` selects which report
   (`verify-report.md` / `qa-report.md` / `review-notes.md`) to read back as
   context, then re-runs the implementation agent(s) and continues through the
   normal QA → reviewer → docs → PR tail — the exact same tail code as a fresh
   run, not a separate copy per gate.

When the resume came from a PR comment, every status comment for that run —
including the eventual success comment — goes back to that PR instead of the
original ticket, since that's what the human is actually watching.

## Automated PR review

The Orchestrator can run `caf-reviewer` against a PR in response to PR comments.
This is a separate job from the ticket pipeline above. It only works on PRs whose
head branch is `ai-agent/<TICKET-KEY>` — the ones this pipeline opened.

Three trigger paths, each mapped to a review **mode**:

| Trigger | Mode | Behavior |
|---|---|---|
| Comment `/caf-review` on a PR | `initial` | Full review from scratch. The verdict is posted as a real GitHub PR review; if GitHub rejects it as a self-review, it is re-posted as a comment with the verdict stated in the body |
| Comment `/caf-fix-review` on a PR | `global` | The Reviewer addresses every existing inline and general comment, replies to each one, and posts a summary |
| Reply inside an inline review-comment thread | `scoped` | The same, scoped to just that one thread |

In `global` and `scoped` mode each comment ends up `FIXED`, `SKIPPED` or
`NOT_APPLICABLE`, recorded in `fix-review-log.md`.

A comment posted by a bot account (including the Orchestrator's own summary
comments) is always ignored — without this guard, the Orchestrator's own
review output would re-trigger itself on delivery. PR-review jobs always clone into
a fresh workspace, whatever `workspace.mode` says.

## Monitoring dashboard

A live pipeline-monitoring dashboard is served by the web server at `/dashboard`:
PIV phase, retry counts per gate, real cost as reported by the `claude` CLI,
artifact links and PR review runs, updated in real time. A second, read-only page at
`/dashboard/agent-floor` shows the same runs as an animated office of agents, with
live, replay and demo modes.

It is off by default and basic-auth gated. To enable it:

```yaml
# caf.config.yaml
dashboard:
  enabled: true
  basicAuthUser: admin
```

and set `DASHBOARD_BASIC_AUTH_PASSWORD` in `.env`. Run history is stored in a SQLite
file (`db.path`, default `./data/caf-dashboard.sqlite`); `pnpm db:migrate` creates or
upgrades it.

Behind a reverse proxy, make sure `/dashboard`, `/api/pipelines*` and
`/api/events/stream` are all proxied and served over HTTPS only.

## Optional features (off by default)

- **Telegram notifications** — pipeline start, completion and failure alerts. Set
  `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` together.
- **Model routing** — route agents through an Anthropic-compatible endpoint such as
  OpenRouter with `openai.useOpenai: true` plus `OPENAI_API_KEY`.
  `agents.modelOverrides` picks a model per agent, globally or per project. Every
  model id must be listed exactly in `openai.allowedModels`; the list is empty
  (nothing allowed) by default.
- **Dynamic agent skip** — Planner can emit a `## Skip Agents` section in
  `tasks.md` to skip agents that aren't relevant for a ticket. Enable with
  `AGENT_SKIP_ENABLED=true`. Skipping QA or Reviewer adds an explicit warning to the
  PR body.
- **Persistent workspace** — `workspace.mode: persistent` reuses one checkout per
  repo instead of cloning per job. Use it only for large repos: a second job for the
  same repo is rejected while the first holds the workspace.

## Multi-repo

Multi-repo/multi-team routing is live: `caf.config.yaml`'s `projects:` map
holds one entry per project (`ticketPrefix`, `repoCloneUrl`, `baseBranch`,
`workspaceDir`, optional `agents.modelOverrides` and
`orchestration.maxOrchestrationRetries`). Incoming Linear tickets are routed by
matching the ticket key's prefix (e.g. `ABC-123` → `ABC`) against a project's
`ticketPrefix`; GitHub-triggered jobs are routed by repo, and the ticket key is
`<ticketPrefix>-<issue number>`. Prefixes must be unique and workspace directories
must not overlap. At least one project must be configured — startup fails fast on an
empty `projects:` map.

## Scope constraints

- Worker concurrency defaults to 1 — concurrent Claude Code agent processes are
  expensive.
- Only a pipeline that stopped cleanly at a gate can be resumed mid-way, and only on
  request. Anything else retries from the Planner.
- Persistent workspaces are locked in-process, so that mode assumes a single worker
  instance.
