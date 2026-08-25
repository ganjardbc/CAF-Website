# CAF Website

Marketing site and documentation for **CAF (Coderium Agent Framework)** — an AI agent
orchestration framework with strict governance, from ticket to PR.

Built with [Nuxt 4](https://nuxt.com), [Tailwind CSS](https://tailwindcss.com), and
[Nuxt Content](https://content.nuxt.com). Deployed on [Vercel](https://vercel.com).

## Features

- **Landing page** — Hero, feature grid, core components (CAF Initiator / CAF
  Orchestrator), pipeline diagram, FAQ
- **Docs** — Getting Started, Core Concepts (5-layer architecture), CAF Initiator, CAF
  Orchestrator, Integrations, Reference — powered by Nuxt Content, with a sidebar on
  desktop and a dropdown nav on mobile/tablet
- **Dark mode** — system-aware by default, manual toggle, powered by
  `@nuxtjs/color-mode`
- **Multi-language** — English (default, root paths) and Bahasa Indonesia (`/id/*`),
  powered by `@nuxtjs/i18n`
- **SEO** — structured data (`SoftwareApplication` on the landing page,
  `Article`/`TechArticle` on docs pages), sitemap, OG image, all via `@nuxtjs/seo`

## Project structure

```
├── app/
│   ├── components/
│   │   ├── landing/    Hero, FeatureGrid, CoreComponents, PipelineDiagram, Faq, ...
│   │   ├── docs/        Sidebar
│   │   └── shared/      Navbar, Footer
│   ├── layouts/         default.vue (landing/marketing), docs.vue (with sidebar)
│   ├── pages/            index, about, changelog, legal/*, docs/[[...slug]]
│   └── assets/css/       Tailwind entry + design tokens (light/dark CSS variables)
├── content/
│   ├── en/docs/          English docs (default locale, served at /docs/*)
│   └── id/docs/          Indonesian docs (served at /id/docs/*)
├── i18n/
│   ├── i18n.config.ts    vue-i18n config (loads locale message files)
│   └── locales/          en.json, id.json — UI copy for every component/page
├── public/               Static assets (og-image.png, etc.)
├── content.config.ts     Nuxt Content collection definitions (locale-aware sources)
├── nuxt.config.ts        Module config (Tailwind, Content, SEO, Icon, color-mode, i18n)
└── tailwind.config.ts    Design tokens (colors as CSS variables, spacing, radius)
```

Reference docs for the project itself:

- [`PLAN.md`](./PLAN.md) — original site plan: sitemap, content outline, design system
  choices, build order
- [`DESIGN.md`](./DESIGN.md) — visual design system (Vercel Geist–inspired): colors,
  typography, spacing, component specs
- [`PLAN-v1.1.md`](./PLAN-v1.1.md) — plan for dark mode, sticky navbar, and i18n

## Getting started

```bash
npm install
npm run dev
```

The site runs at `http://localhost:3000`.

> **Note:** if `npm install` fails with `Cannot read properties of null (reading
> 'edgesOut')`, that's a known npm 10.x arborist bug unrelated to this project — retry
> with `npm install --legacy-peer-deps`.

### Other scripts

```bash
npm run build     # production build (SSR + full static prerender of every route)
npm run preview   # preview the production build locally
npm run generate  # static site generation
```

## Working with docs content

Docs pages are Markdown files under `content/en/docs/` and `content/id/docs/`,
resolved by the catch-all page at `app/pages/docs/[[...slug]].vue`. To add a page:

1. Create the `.md` file in both `content/en/docs/` and `content/id/docs/` (with
   frontmatter `title` and `description`)
2. Add an entry to `app/components/docs/Sidebar.vue` (used for both the desktop
   sidebar and the mobile dropdown)
3. Add the corresponding label to `i18n/locales/en.json` and `id.json` under
   `docsSidebar`

Internal links between docs pages should be locale-relative: `/docs/...` in English
files, `/id/docs/...` in Indonesian files.

## Working with translations

All UI copy (landing sections, nav, footer, about/changelog/legal pages) lives in
`i18n/locales/en.json` and `id.json`. Components read it via `useI18n()`'s `t()`
(or `tm()`/`rt()` for arrays of translated objects), and internal links use
`useLocalePath()` / `useSwitchLocalePath()` so they resolve to the correct locale
automatically.

## Deployment

The site is deployed on Vercel. `site.url` in `nuxt.config.ts` must match the live
domain — it drives the sitemap, canonical URLs, and absolute OG image URLs.
