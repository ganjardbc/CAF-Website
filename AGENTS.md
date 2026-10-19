# AGENTS.md

> **DRAFT — must be reviewed.** Started by `caf-initiator`; the rules below were written
> from how this repo is built. Review them before an agent relies on them.

These instructions apply to all AI coding agents (Claude Code, Cursor, etc.), not just one tool.

## Workflow

Follow PIV: **Plan** first (write the plan, don't touch code) → **Implement** per the plan →
**Verify** before declaring done. This repo's only verification script is `npm run build`.
If verify fails, fix it and retry (max 3x); if it still fails, stop and escalate to a human.

## Concrete Rules

### Rule 1: Both languages, in the same change
- **Right:** editing `content/en/docs/caf-orchestrator.md` and
  `content/id/docs/caf-orchestrator.md` together; adding a key to `en.json` and `id.json`.
- **Wrong:** updating only the English page or only one locale file, so the two drift.

### Rule 2: The CAF repos are the source of truth
- **Right:** reading `caf-initiator/README.md` / `CLAUDE.md` and `caf-orchestrator/README.md`
  / `CLAUDE.md` (and the code when they disagree) before writing a claim about CAF.
- **Wrong:** copying a sentence from an older docs page, a plan document, or memory.

### Rule 3: Locale-aware links
- **Right:** `[Quick Start](/id/docs/quick-start)` in an Indonesian page,
  `useLocalePath()('/docs')` in a component.
- **Wrong:** `/docs/quick-start` inside an Indonesian page, or a hardcoded `href` in a
  component.

### Rule 4: Design tokens, not raw colors
- **Right:** `bg-canvas-elevated text-ink border-hairline`.
- **Wrong:** `bg-white text-[#171717]`, which breaks dark mode.

### Rule 5: Say what CAF doesn't do yet
- **Right:** "Jira support is planned but not implemented"; "the Validator's command limit
  is an allowlist plus text rules".
- **Wrong:** describing a planned or manual step as if it were automatic.

## Tracker

This project's ticket tracker: **GitHub Issues**. Artifact folder names
follow the ticket key (`ENG-123`, `#42`, etc.), consistent with the branch name
`ai-agent/{{TICKET-ID}}`.

## Constraints

- Don't auto-merge. Human review is required before merge at every phase.
- Don't auto-generate the contents of `.caf/knowledge/golden-examples/` or `.caf/knowledge/decisions/` —
  that's a human decision.
- Don't assume a verification script exists without checking `package.json` first.
- Don't edit `caf-initiator` or `caf-orchestrator` from this repo; they are separate projects.
