---
title: Spec-Driven Development
description: How CAF works from a written spec — the Planner writes it, a human approves it, and every later agent is checked against it.
---

CAF follows Spec-Driven Development (SDD). The unit of work is a written spec, not a
chat message. The level CAF aims for is **spec-first, moving toward spec-anchored** — not
spec-as-source.

- **Spec-first.** The Planner writes `requirements.md` (outcome, scope, decisions,
  acceptance criteria, each with a `Verify:` line) before any code is written.
- **Spec-anchored.** Once approved, the spec stays the reference. Tasks,
  implementation, validation and review are all checked against its acceptance
  criteria. An agent never edits an approved spec; a needed change is proposed in
  `verify-report.md` under `## Proposed Spec Changes` and a human decides.
- **Not spec-as-source.** The code stays the source of truth for behavior. The spec is
  not regenerated into code, and code is not regenerated from the spec.

Human review of the pull request stays mandatory. There is no auto-merge.

## The flow

```
ticket or chat
  → Planner      Specify → Clarify → Plan → Tasks
  → spec gate    optional, a human approves the spec
  → implement    caf-frontend / caf-backend, then self-verify
  → Validator    checks every acceptance criterion
  → Reviewer     qualitative review against the spec and the diff
  → pull request
```

## What the Planner writes

The Planner always writes `requirements.md` and `tasks.md`, and writes a third file
when the request needs one.

| File | Contents | `Status:` line |
|---|---|---|
| `requirements.md` | Outcome, scope, findings, assumptions, decisions, constraints, open questions, and acceptance criteria numbered `AC-n`, each with a `Verify:` line | Yes |
| `tasks.md` | The concrete tasks, split under `## Frontend Tasks`, `## Backend Tasks` and `## Docs Tasks`, ending with `## Coverage`: a map from each criterion to the tasks that serve it (not a task itself) | No |
| `design.md` | A technical design. Written only when the ticket spans more than one app or service, adds or changes a schema or migration, or adds or changes a contract between layers. None of the three: no `design.md` | No |
| `breakdown.md` | A proposal to split a request that holds more than one outcome that could ship and be used on its own (item, order, dependencies, acceptance-criteria outline). One outcome reached in many steps is not split; its steps go to `tasks.md` | No |

`design.md` and `breakdown.md` have no status of their own: they ride the approval of
the spec. The formats live in the skills `caf-spec`, `caf-design` and
`caf-breakdown`.

### The status of a spec

The first `Status:` line of `requirements.md` has one of four values:

| Value | Meaning |
|---|---|
| `DRAFT` | Written, not approved yet |
| `NEEDS_CLARIFICATION` | A question marked `BLOCKING` has no answer; no `tasks.md` is written |
| `APPROVED` | A human approved it. Agents no longer edit it |
| `NEEDS_HUMAN` | The run could not go on without a human decision |

### Acceptance criteria and their evidence

Every acceptance criterion describes one observable behavior and carries a `Verify:`
line in one of three forms:

- `automated test` — names the test file, or the task that creates it
- `command: <command> | expect: <exit code or output>`
- `manual` — a human must check it

An implementation agent then writes one evidence line per criterion in
`verify-report.md`, in one of five forms: `automated-test`, `command`, `build-only`,
`manual` or `none`. The Validator and the Reviewer judge those lines.

## Clarify: asking instead of guessing

The Planner reads the repo before it asks. A fact it can read is never a question, and
a claim it cannot source is written as `Assumption A-n:` with its basis. What a human
must decide becomes a question, tagged `BLOCKING` or `NON-BLOCKING`.

While a `BLOCKING` question has no `Answer:`, no `tasks.md` is written. On a ticket run
nobody answers in chat, so the Planner writes `Status: NEEDS_CLARIFICATION` and stops.
[CAF Orchestrator](/docs/caf-orchestrator#clarify-and-the-spec-gate) then pushes the
draft to the branch and posts the questions as a comment on the ticket
(`❓ CAF-CLARIFY`). Answer in a comment, trigger the ticket again, and the Planner
continues the same draft.

## The spec gate

A ticket carrying the `spec-approval` label (configurable) stops after the Planner with
a Draft PR that holds the spec only. A human reviews it, edits it on the branch if
needed, and comments `/caf-approve-spec`. The Orchestrator changes only the `Status:`
line to `APPROVED` and continues with implementation. Without the label, the pipeline
runs straight through after the Planner.

## An approved spec is a contract

Once `requirements.md` says `Status: APPROVED`:

- No agent writes to it. The implementation agents never write `requirements.md` or
  `tasks.md`; the Reviewer treats a change to an approved spec as a blocking finding.
- A spec that turns out wrong, ambiguous or impossible is reported in `verify-report.md`
  under `## Proposed Spec Changes`, and the run stops with `Status: NEEDS_HUMAN`.
- A review comment that asks to change the goal, scope or a criterion
  (`/caf-fix-review`) is logged as a proposal and marked `SKIPPED`, never applied.

## Validator and Reviewer

The **Validator** gives every acceptance criterion one status by running its evidence
itself:

| Status | When |
|---|---|
| `PASS` | `automated-test` or `command` evidence the Validator ran itself, matching the criterion |
| `FAIL` | It ran the evidence and the result contradicts the criterion |
| `UNVERIFIED` | Everything else: `manual`, `build-only`, no named test, a command it may not run, or no evidence line |

`UNVERIFIED` never makes the report `FAIL`, but its count is always on the
`Unverified:` line. In a pipeline run by CAF Orchestrator, a report that says
`Status: PASS` while every criterion is `UNVERIFIED` is treated as `NEEDS_HUMAN`:
nothing was proven.

The **Reviewer** reads evidence and does not run the tests again. It reports scope
deviations, tasks not done, criteria that need a human check, and ADR violations, and
ends with a `Verdict:` of `APPROVE`, `CHANGES REQUESTED` or `DEFER`.

## Language

The Planner writes the prose of its artifacts in the language of the ticket author,
judged from the title and the author's own sentences, not from UI text the ticket
quotes. The words other agents and the Orchestrator read stay fixed in every language:
section headings, `Status:` and its values, `AC-n:`, `Verify:`, `Finding:`,
`Assumption A-n:`, `Q-n`, `BLOCKING`, `Answer:` and `Tidak ada` (the literal for an
empty section).

## What is and is not enforced

Most of SDD is instructions written into the generated agent definitions and skills.
`caf-init` does not check that an agent followed them. What the Orchestrator does
enforce in code: stopping on `NEEDS_CLARIFICATION` or an unanswered `BLOCKING`
question, the spec gate and `/caf-approve-spec`, the acceptance-criteria summary on the
PR, and the validator's command allowlist.
