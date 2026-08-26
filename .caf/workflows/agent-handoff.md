# Agent Handoff Format

> Part of this file is auto-generated from the detected agent roster.

Each ticket has its own folder: `.caf/tasks/{TICKET-ID}/`. An agent reads the previous
agent's output from this folder, not from chat/memory.

## Artifact per Agent (based on detected roster)

| Agent | Artifact Output |
|---|---|
| Planner | `requirements.md`, `tasks.md` |
| Architect | `design.md` |
| Frontend | kode + `verify-report.md` |
| QA | `qa-report.md` |
| Reviewer | `review-notes.md` |
| Documentation | update `docs/` (paralel, non-blocking) |
| PM | `prd.md`, `flow.md` (in `.caf/discovery/{slug}/`, not `.caf/tasks/` — see CAF.md Klaster 1) |
| UX Designer | `flow.md` (in `.caf/discovery/{slug}/`, not `.caf/tasks/` — see CAF.md Klaster 1) |
| Auditor | `audit-report.md` (in `.caf/audits/{DATE}/`, not `.caf/tasks/` — see CAF.md Klaster 4) |

## Format `verify-report.md`

```markdown
# Verify Report

Status: PASS | NEEDS_HUMAN

## Checklist
- [ ] lint
- [ ] typecheck
- [ ] test
- [ ] build

## Notes
TODO: verification result details, errors if any
```

## Additional Agents (Custom)

No custom agents detected outside the standard CAF roles.
