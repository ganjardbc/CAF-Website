# CLAUDE.md

> **DRAFT — must be reviewed.** Started by `caf-initiator`; the sections below were filled
> in from the repo itself (`package.json`, `nuxt.config.ts`, `README.md`, the content and
> i18n files). Check the business context before relying on it.

## Project

- Type: single app
- Package manager: npm
- Tracker: GitHub Issues
- Database: none (static content; `better-sqlite3` is only Nuxt Content's local index)

## Apps

- `.` — Nuxt 4 (`app/` directory structure), Tailwind, Nuxt Content v3, `@nuxtjs/i18n`,
  `@nuxtjs/color-mode`, `@nuxtjs/seo`

## Business Context

This is the marketing and documentation site for CAF (Coderium Agent Framework). It
documents two other projects, `caf-initiator` (the `caf-init` CLI) and `caf-orchestrator`
(the webhook service), and **those two repositories are the source of truth**. The site
must match them one to one: version, agent roster, commands, skills, config fields, and
behavior. See "Keeping the docs in sync with CAF" in `README.md` for which page follows
which file.

Where a README and the code disagree, the code wins.

## Code Conventions

- **Two languages, always.** English is the default locale (root paths) and Bahasa
  Indonesia lives under `/id`. Every docs page exists in `content/en/docs/` and
  `content/id/docs/` with the same file name. Every UI string lives in
  `i18n/locales/en.json` and `id.json` under the same key. A change to one language is
  not done until the other has it.
- Docs links are locale-relative: `/docs/...` in English files, `/id/docs/...` in
  Indonesian files. In Vue, build links with `useLocalePath()`.
- A new docs page also needs an entry in `app/components/docs/Sidebar.vue` and a label
  under `docsSidebar` in both locale files.
- Colors come from the design tokens (CSS variables in `app/assets/css/main.css`, mapped
  in `tailwind.config.ts`), never raw hex in a component, so dark mode keeps working. The
  exceptions are the hero mesh gradient. `DESIGN.md` is the visual spec.
- Technical terms, command names, file names and status words stay in English in the
  Indonesian pages (`requirements.md`, `Status: APPROVED`, `caf-validator`, `DRIFT`).
- Docs headings become anchors, so renaming a heading breaks inbound links. Translated
  headings in `content/id/` have their own anchors; keep links consistent per locale.
- Don't invent behavior for CAF. If it is not in `caf-initiator` or `caf-orchestrator`,
  it does not go on the site.

## Verification Commands

`package.json` has no `lint`, `typecheck` or `test` script. Record that as a gap; don't
call a command that doesn't exist.

- typecheck: none (gap)
- lint: none (gap)
- test: none (gap)
- build: `npm run build` — a full prerender; it fails on a broken internal link
  (`nitro.prerender.crawlLinks`) and on invalid content front matter.

For a docs-only change, run `npm run build` and open the changed pages with
`npm run dev` in both locales.

## References

- See `AGENTS.md` for cross-tool rules.
- See `README.md` for the project structure and how to add a page or a translation.
- See `.caf/knowledge/golden-examples/` for code references.
- See `.caf/knowledge/decisions/` for ADRs.
- See `.caf/tasks/README.md` for the artifact handoff structure.
