# PIV Workflow

> Part of this file is auto-generated from the agent roster detected in `.claude/agents`.
> Review before use — especially the TODO sections.

## Workflow Pattern

```
PLAN       → write a plan first, don't touch code yet
IMPLEMENT  → execute according to the plan
VERIFY     → self-check (lint, typecheck, test) before claiming done
              if it fails → fix and retry (max 3x)
              if still failing → stop, escalate to a human (Status: NEEDS_HUMAN)
```

## Active Agents in This Project

- [x] Planner
- [x] Architect
- [x] Frontend
- [ ] Backend — NOT present, this project does not generate this agent role (TODO: confirm this is actually correct)
- [x] QA
- [x] Reviewer
- [x] Documentation
- [x] PM
- [x] UX Designer
- [x] Auditor

## Retry Logic per Gate

- Implementation (Frontend/Backend): max 3x (CAF.md default), then stop → NEEDS_HUMAN
- QA gate: TODO: retry count for QA not yet confirmed, check orchestrator
- Reviewer gate: TODO: retry count for Reviewer not yet confirmed, check orchestrator

## Warning: Parser Contract

The `Status:` field emitted by each agent (e.g. `PASS`/`NEEDS_HUMAN` for QA,
`READY_FOR_HUMAN_REVIEW`/`NEEDS_CHANGES` for Reviewer) MUST be the exact literal token
the orchestrator parses — no extra wording/qualifiers.
A mismatch here burns the retry budget with no clear error surfaced to the user. Always
verify the agent prompt and the orchestrator parser as a pair, never separately.

TODO: confirm the literal tokens used by this project's orchestrator match exactly what
each agent above emits.
