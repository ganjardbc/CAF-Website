---
title: CAF Orchestrator
description: A self-hosted webhook receiver (Fastify + BullMQ + Redis) that runs agents per phase.
---

CAF Orchestrator is a small service that runs on your own VPS. It receives webhooks
from Linear or GitHub Issues, queues jobs per phase, then spawns headless Claude Code
agents to run Plan, Implement, Verify, and eventually open a PR.

> Linear and GitHub Issues can both trigger the pipeline today. Jira support is
> planned but not implemented — see [Jira](/docs/integrations/jira) for status.

## Requirements

- Node.js 22 or newer
- pnpm
- Redis
- The `claude` CLI available on PATH, with agent definitions (`planner`,
  `frontend`, `backend`, `qa`, `reviewer`, `documentation`) configured in the
  **target repo's** `.claude/agents/` — this is what [CAF Initiator](/docs/caf-initiator)
  scaffolds for you

## Setup

CAF Orchestrator runs as two processes (web server + worker) sharing Redis as
the queue backend — either directly with pnpm, or via the repo's `Dockerfile`
+ `docker-compose.yml`.

```bash
git clone <your-caf-orchestrator-repo-url>
cd caf-orchestrator
pnpm install
cp .env.example .env
# fill in REDIS_URL, LINEAR_WEBHOOK_SECRET, LINEAR_API_KEY, GITHUB_TOKEN,
# GITHUB_WEBHOOK_SECRET, and either CLAUDE_CODE_OAUTH_TOKEN or
# caf.config.yaml's openai.useOpenai + OPENAI_API_KEY
cp caf.config.example.yaml caf.config.yaml
# fill in linear.readyStateId (UUID), github.readyLabel, and at least one
# entry under projects: (repoCloneUrl, ticketPrefix, baseBranch)
```

Run both processes (each needs to keep running for tickets to be processed):

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

Production, with Docker (`docker-compose.yml` ships an `api` + `worker` service
sharing a Redis container and a `workspace` volume):

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

See [Environment Variables](/docs/reference/environment-variables) for the
full list.

### Deploying with Docker

The repo's `deploy.sh` wraps the usual `git fetch && reset --hard origin/main
&& docker compose build && docker compose up -d` cycle for a VPS deploy — meant
to be run both manually and from a CI deploy workflow. Flags: `--skip-pull`,
`--skip-build`, `--no-cache`, `--env <path>`. It also prunes dangling images
after each deploy.

## Webhook configuration

The Orchestrator triggers automatically on either of these transitions:

- **Linear** — a ticket moves into the workflow state whose UUID is set as
  `linear.readyStateId` in `caf.config.yaml` (e.g. "Ready for AI")
- **GitHub Issues** — a label matching `github.readyLabel` in `caf.config.yaml`
  (default `ready-for-ai`) is applied to an issue

Register the corresponding webhook pointing to the Orchestrator's endpoint:

- Linear: `https://<your-vps-host>/webhooks/linear`
- GitHub (ticket trigger, PR review, and `/caf-retry-pipeline` comments — all
  three share one endpoint): `https://<your-vps-host>/webhooks/github`

The flow:

1. A ticket transitions to the ready state (Linear) or gets the ready label
   (GitHub Issue)
2. The source sends a webhook to the Orchestrator
3. The Orchestrator verifies the payload signature (`LINEAR_WEBHOOK_SECRET` or
   the GitHub webhook secret) and dedupes by delivery ID
4. A pipeline job is queued in BullMQ, routed to the matching `projects:`
   entry by ticket-key prefix (Linear) or repo (GitHub)
5. The Orchestrator runs the agent chain (planner → frontend/backend → QA →
   reviewer → docs) as headless `claude --agent <name>` processes, pushes a
   branch, and opens a GitHub PR

Every phase still stops at the human-review checkpoint — the Orchestrator never
merges a PR itself. On QA failure or a reviewer "changes requested" verdict,
the pipeline retries the implementation agent once per gate
(`agents.qa.maxRetries` / `agents.reviewer.maxRetries`, default `1`); if still
failing, the Orchestrator pushes the branch and opens (or updates) a **Draft
PR** carrying the failing report, then stops and comments for a human to take
over.

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
`.ai/tasks/<TICKET-KEY>/` in the workspace — `orchestrationRetryCount`,
`lastFailedGate` (`implementation`/`qa`/`reviewer`), `lastKnownCommitSha`, and
the ticket's title/description (so a resume can rebuild the planner-less
prompt without re-fetching the original ticket). That folder is part of the
normal commit-and-push at the end of every run, so the file travels **on the
branch itself** — it survives even with the default `ephemeral` workspace
mode, which deletes the local clone after each job. On full pipeline success
the file is deleted; its absence is what a resume trigger checks to reject a
ticket that has nothing to resume.

**What a resume actually does:**

1. Re-syncs onto the existing branch (never creates a new one). For a
   `persistent`-mode checkout, it first runs a read-only `git status` and
   **stops with a comment** if it finds uncommitted residue (e.g. a prior run
   interrupted mid-write) — it does not silently discard local changes here,
   unlike the normal non-retry sync path.
2. Checks the retry budget: rejects with a comment if no state exists, or if
   `orchestrationRetryCount` has already reached
   `orchestration.maxOrchestrationRetries`; otherwise increments the counter.
3. If HEAD has moved past `lastKnownCommitSha` (a human pushed a commit while
   the ticket was stopped), a `git diff --stat` of that gap is computed and
   handed to the resumed agent as extra context — this never blocks the
   resume, only uncommitted residue from step 1 does.
4. Skips the planner entirely. `lastFailedGate` selects which report
   (`verify-report.md` / `qa-report.md` / `review-notes.md`) to read back as
   context, then re-runs the implementation agent(s) and continues through the
   normal QA → reviewer → docs → PR tail — the exact same tail code as a fresh
   run, not a separate copy per gate.

When the resume came from a PR comment, every status comment for that run —
including the eventual success comment — goes back to that PR instead of the
original Linear ticket, since that's what the human is actually watching.

Each repo gets a capped number of these cross-invocation retries —
`orchestration.maxOrchestrationRetries` in `caf.config.yaml` (global default,
per-project override under `projects.<name>.orchestration`) — after which
automatic retry stops being offered and the ticket needs fully manual
follow-up.

## Automated PR review

The Orchestrator also listens for GitHub PR/comment events (`/webhooks/github`)
and can run `caf-reviewer` against a PR, posting comments back to it. This is
separate from the Plan/Implement/Verify pipeline above and works on any PR, not
just ones the Orchestrator opened.

Only users with `write`/`maintain`/`admin` permission on the repo (checked live
via the GitHub API on every trigger) can start a review pass; anyone else's
comment is silently ignored. `ENABLE_PIPELINE_TRIGGER=false` disables this too.

Three trigger paths, each mapped to a review **mode**:

| Trigger | Mode | Behavior |
|---|---|---|
| Comment `/caf-review` on a PR | `initial` | Full review from scratch, no prior comment context |
| Comment `/caf-fix-review` on a PR | `global` | Re-review against every existing inline + general comment thread on the PR |
| Reply inside an inline review-comment thread | `scoped` | Re-review scoped to just that one thread |

A comment posted by a bot account (including the Orchestrator's own summary
comments) is always ignored — without this guard, the Orchestrator's own
review output would re-trigger itself on delivery.

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

Multi-repo/multi-team routing is live: `caf.config.yaml`'s `projects:` map
holds one entry per project (`ticketPrefix`, `repoCloneUrl`, `baseBranch`,
`workspaceDir`, optional `agents.modelOverrides` and
`orchestration.maxOrchestrationRetries`). Incoming Linear tickets are routed by
matching the ticket key's prefix (e.g. `ABC-123` → `ABC`) against a project's
`ticketPrefix`; GitHub-triggered jobs are routed by repo. At least one project
must be configured — startup fails fast on an empty `projects:` map.
