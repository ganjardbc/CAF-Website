# Plan Website CAF (Coderium Agent Framework) — v1.0.0

Project baru, terpisah dari `coderium-web-v2`. Stack: Nuxt 3 (classic structure) + Tailwind CSS.
Gaya referensi: opencode.ai (dev-tool marketing site, teknikal, to-the-point) untuk struktur konten
dan copywriting. Sistem visual (warna, tipografi, spacing, komponen) mengikuti spesifikasi di
`DESIGN.md` — Vercel Geist system: canvas near-white/ink near-black, hairline border, mesh gradient
hanya di hero, font Geist Sans + Geist Mono. Lihat `DESIGN.md` sebagai sumber kebenaran tunggal
untuk semua keputusan visual/komponen; PLAN.md ini fokus ke struktur, sitemap, dan urutan kerja.

---

## 1. Positioning & Pesan Utama

opencode.ai berhasil karena pesannya sangat sempit dan konkret: "open source coding agent",
langsung install command, langsung angka kepercayaan (stars/contributors), langsung FAQ teknis.
CAF harus punya pesan sesempit itu juga. Draft tagline:

> **CAF — AI agent orchestration framework dengan governance ketat, dari ticket sampai PR.**

Beda CAF dari kompetitor (Kiro, Devin, Copilot Coding Agent, OpenHands, PR-Agent) yang harus
kelihatan di atas fold: **wide implementation scope + heavy governance** (bukan salah satu saja).
Sebutkan eksplisit di hero atau section kedua: "Setiap fase (Plan → Implement → Verify → PR)
punya checkpoint human-review wajib — tidak ada auto-merge."

Karena masih v1.0.0 dan gratis, jangan berlagak seperti produk mature dengan 16M user seperti
opencode — jujurkan positioning: "framework yang bisa langsung kamu jalankan di repo kamu
sendiri", bukan "dipakai jutaan developer".

---

## 2. Sitemap (Information Architecture)

```
/                          Landing page
/docs                      Docs home (overview, getting started)
/docs/[...slug]            Docs pages (nested, Nuxt Content)
/docs/caf-initiator         Halaman khusus CAF Initiator
/docs/caf-orchestrator       Halaman khusus CAF Orchestrator
/changelog                  (opsional tapi direkomendasikan — lihat §7)
/about                      Creator / Coderium
/legal/terms                Terms of Service
/legal/privacy              Privacy Policy / Condition
                            (GitHub → external link, bukan halaman internal)
```

Catatan: opencode memisahkan "Docs" sebagai sub-site sendiri dengan sidebar. Untuk CAF di
v1.0.0 tidak perlu seagresif itu — cukup `/docs` dengan sidebar kategori, pakai Nuxt Content
tanpa perlu multi-repo docs terpisah.

---

## 3. Detail Tiap Halaman

### 3.1 Landing Page (`/`)

Urutan section (mengikuti pola opencode, disesuaikan konteks CAF):

1. **Nav bar** — Logo CAF, links: Docs, GitHub, About, (Discord/komunitas kalau ada nanti).
   CTA kanan: tombol "View on GitHub" + star count (fetch dari GitHub API).
2. **Badge "New"** — "CAF v1.0.0 dirilis" → link ke changelog/release notes.
3. **Hero** — Judul + tagline governance di atas. Sub-headline 1-2 kalimat. Command install
   atau `git clone` snippet dengan tab (mirip opencode punya tab curl/npm/bun/brew) — untuk
   CAF bisa jadi tab `caf-initiator` (npx/npm) vs clone manual.
4. **Video/GIF demo** — opsional tapi sangat efektif: rekam 1 siklus PIV singkat
   (ticket → plan → implement → PR) dipercepat.
5. **"Apa itu CAF?"** — 4-6 feature bullet, bukan generik. Contoh nyata dari dokumen CAF.md:
   - PIV discipline dengan retry max 3x
   - Artifact handoff via Markdown file (bukan chat context yang hilang)
   - Multi-tracker: Linear & Jira
   - Mandatory human review di setiap checkpoint, no auto-merge
   - Read-only scanner agents — tidak ada write access tanpa approval gate eksplisit
6. **CAF Initiator** — section/card sendiri. Jelaskan: CLI scaffold generator, hasil deteksi
   stack otomatis, generate `.claude/agents/`, `.ai/tasks/`, dsb. Sertakan contoh command:
   `caf-initiator init` (sesuaikan command asli kamu).
7. **CAF Orchestrator** — section/card sendiri. Jelaskan: Fastify + BullMQ + Redis, webhook
   receiver, jalan di VPS kecil, trigger dari perubahan status ticket di Linear/Jira, spawn
   agent Claude Code headless per fase.
8. **Diagram pipeline** — visual dari `Ticket → Planner → Implement → QA → Reviewer → PR`.
   Ini elemen paling penting untuk menjelaskan CAF secara teknis dalam 3 detik pertama scroll.
9. **Perbandingan singkat** (opsional, hati-hati) — tabel ringkas CAF vs kategori lain
   (bukan menyebut nama kompetitor secara agresif, cukup posisi: "wide scope" vs "narrow scope",
   "governance ketat" vs "auto-merge").
10. **FAQ** — accordion, isi pertanyaan yang benar-benar akan ditanya:
    - Apa itu CAF?
    - Apakah CAF gratis?
    - Tracker apa saja yang didukung?
    - AI runner apa yang dipakai? (Claude Code)
    - Apakah CAF bisa auto-merge?
    - Apakah CAF menyimpan kode saya di server pihak ketiga?
11. **Footer** — GitHub, Docs, Changelog, About, Terms, Privacy. Copyright "Coderium".

### 3.2 Docs (`/docs`)

Struktur sidebar disarankan:
```
Getting Started
  - Introduction
  - Quick Start (caf-initiator)
  - Konsep PIV
Core Concepts
  - Layer 1: Project Knowledge Base
  - Layer 2: Agent Definitions
  - Layer 3: Artifact Handoff
  - Layer 4: Quality Gates
  - Layer 5: Orchestration
CAF Initiator
  - Instalasi
  - Commands (init, export, dst)
  - Struktur file yang di-generate
CAF Orchestrator
  - Setup (Fastify + BullMQ + Redis)
  - Konfigurasi webhook (Linear/Jira)
  - Multi-repo (kalau sudah ready difitur-kan)
Integrations
  - Linear
  - Jira
  - GitHub / GitLab
Reference
  - Environment variables
  - Troubleshooting
```

Rekomendasi teknis: pakai **Nuxt Content v3** (bukan tulis HTML manual) supaya docs jadi file
Markdown yang gampang di-maintain, auto-generate table of contents, dan search bisa pakai
`@nuxt/content` built-in search index tanpa perlu Algolia dulu di v1.0.0.

### 3.3 GitHub Link

Cukup external link (tidak perlu halaman internal), tapi tampilkan **live star count** via
GitHub REST API (`GET /repos/{owner}/{repo}`) — fetch di server (Nuxt server route) supaya tidak
kena rate limit client-side dan bisa di-cache (ISR/`nitro` cache beberapa menit).

### 3.4 Terms of Service (`/legal/terms`)

Karena CAF masih gratis dan open-ish, isi minimal yang wajib ada:
- Definisi layanan (framework, bukan hosted SaaS — penting dibedakan karena tidak ada data user
  yang disimpan Coderium kalau orchestrator dijalankan self-hosted)
- Lisensi penggunaan kode (tentukan: MIT? Apache 2.0? kalau repo publik)
- Disclaimer "as-is", tidak ada SLA di versi gratis
- Batasan tanggung jawab (agent AI bisa menghasilkan kode salah — user tetap wajib review manual,
  sejalan dengan prinsip "review manusia wajib" di CAF sendiri — ini konsisten secara pesan!)

### 3.5 Privacy Policy / Condition (`/legal/privacy`)

- Data apa yang disimpan situs (analytics, newsletter email kalau ada)
- Tegaskan: source code project user **tidak** dikirim ke server Coderium — orchestrator jalan
  di VPS milik user sendiri, artifact handoff cuma file Markdown di repo user. Ini poin jual
  penting untuk trust, sama seperti opencode punya section "Built for privacy first".

### 3.6 Creator / Coderium (`/about`)

- Cerita singkat Coderium sebagai studio/brand
- Kenapa CAF dibuat (masalah nyata: agentic coding tools lain kurang governance)
- Link ke `coderium-web-v2` (situs utama Coderium) — karena ini situs terpisah, taruh link
  jelas "Dibuat oleh Coderium" di footer + halaman about, supaya brand tetap terhubung meski
  domain/repo beda.

---

## 4. Tech Stack & Setup

| Kebutuhan | Rekomendasi |
|---|---|
| Framework | Nuxt 3 (SSR/SSG hybrid — pakai `nitro.prerender` untuk landing+docs karena konten statis) |
| Styling | Tailwind CSS (`@nuxtjs/tailwindcss`) |
| Docs content | `@nuxt/content` v3 (Markdown → halaman, built-in TOC, code block syntax highlight) |
| SEO | `@nuxtjs/seo` (gabungan sitemap, robots, OG image, schema.org, canonical — satu modul, jangan pasang modul SEO manual satu-satu) |
| Font | **Geist Sans** (body/heading, fallback: Inter, Arial) + **Geist Mono** (code, command snippet, uppercase eyebrow label; fallback: JetBrains Mono/IBM Plex Mono) — sesuai `DESIGN.md` |
| Icon | `@iconify` atau lucide (ringan, banyak icon dev-tool) |
| Deploy | Vercel atau Cloudflare Pages — keduanya native-support Nuxt SSG/hybrid, gratis untuk trafik awal |
| Analytics | Plausible/Umami (privacy-friendly) — konsisten dengan pesan privacy CAF, hindari Google Analytics kalau mau selaras positioning |

### Struktur folder Nuxt yang disarankan

Nuxt 3 struktur klasik (tanpa wrapper `app/` — `compatibilityVersion` default 3, `pages/`,
`components/`, `layouts/` langsung di root project):

```
caf-website/
├── components/
│   ├── landing/         (Hero, FeatureGrid, PipelineDiagram, FAQ, dst)
│   ├── docs/             (Sidebar, TocSidebar, CodeBlock)
│   └── shared/           (Navbar, Footer, GithubStarBadge)
├── pages/
│   ├── index.vue
│   ├── about.vue
│   ├── docs/
│   │   └── [...slug].vue
│   └── legal/
│       ├── terms.vue
│       └── privacy.vue
├── layouts/
│   ├── default.vue
│   └── docs.vue          (layout dengan sidebar, beda dari landing)
├── content/
│   └── docs/                 (file .md untuk semua docs page)
├── server/
│   └── api/
│       └── github-stars.ts   (proxy + cache GitHub API)
├── public/
│   └── og-image.png
├── nuxt.config.ts
└── content.config.ts
```

---

## 5. Checklist SEO (poin kriteria kamu #1)

- [ ] `@nuxtjs/seo` terpasang — otomatis handle `sitemap.xml`, `robots.txt`, canonical URL
- [ ] Setiap page: `useSeoMeta()` dengan title unik, description unik (jangan generic di semua page)
- [ ] Open Graph image per halaman utama (landing beda dari docs beda dari about) — minimal 1
      OG image generik dulu untuk semua kalau waktu terbatas, upgrade nanti
- [ ] Structured data (`schema.org`) tipe `SoftwareApplication` untuk landing page — bantu
      Google understand ini "software", bukan blog
- [ ] Docs pages pakai `Article`/`TechArticle` schema kalau sempat
- [ ] Heading hierarchy benar (`h1` sekali per page, `h2`/`h3` terstruktur) — terutama di docs
      yang di-generate dari Markdown, cek `@nuxt/content` tidak skip level
- [ ] Prerender semua route statis (`nitro.prerender.routes` atau `crawlLinks: true`) —
      Nuxt SSG penuh untuk landing+docs supaya first paint cepat dan crawlable tanpa JS
- [ ] Internal linking: landing → docs, docs → landing CTA, about → docs (jangan silo)
- [ ] `alt` text semua gambar/diagram
- [ ] Core Web Vitals: hindari heavy JS di landing (animasi berat, video autoplay besar tanpa
      lazy load) — opencode pakai video hero tapi kemungkinan besar lazy-loaded
- [ ] Submit sitemap ke Google Search Console setelah deploy pertama

---

## 6. Batasan yang Kamu Sebutkan

- **Tanpa pricing page dulu.** Jangan buat placeholder `/pricing` kosong — cukup CTA "Get
  Started" langsung ke docs/GitHub. Kalau nanti ada tier berbayar, baru tambah nav item.
- **Gratis untuk sekarang** — tekankan di hero/FAQ eksplisit "CAF gratis dan open" supaya tidak
  ada ekspektasi salah dari pengunjung pertama.

---

## 7. Masukan Tambahan dari Saya

1. **Changelog page.** opencode punya `/changelog` di footer — sangat murah untuk dibuat (cukup
   Markdown per versi) dan penting untuk kredibilitas "v1.0.0" kamu — orang bisa lihat histori
   rilis, bukan cuma klaim versi tanpa bukti.
2. **Diagram pipeline adalah aset paling penting di seluruh situs.** Karena CAF value prop-nya
   teknikal (governance + PIV + artifact handoff), satu diagram visual yang jelas di hero/section
   kedua akan menjelaskan lebih baik dari paragraf manapun. Rekomendasi: buat sebagai SVG statis
   (bukan screenshot), supaya scalable dan ringan untuk performance/SEO.
3. **Jangan overclaim angka.** opencode pamer 195K stars karena memang sudah besar. CAF baru
   v1.0.0 — jangan taruh section "trusted by X developers" kosong/dipaksakan. Ganti dengan
   proof teknikal: contoh nyata `verify-report.md`, contoh diff PR yang di-generate, atau demo
   video. Kredibilitas dari transparansi teknis, bukan angka vanity.
4. **Bahasa situs: ID atau EN?** Dokumen CAF.md kamu ditulis Bahasa Indonesia, tapi target
   developer tool biasanya default EN supaya reach global (terutama kalau publish ke GitHub
   publik/Hacker News/dsb). Rekomendasi: build EN sebagai default, opsional i18n ID nanti kalau
   perlu — jangan mulai dual-language dari v1.0.0, itu scope creep untuk situs marketing.
5. **Beri nama domain/repo terpisah sekarang juga** (bukan bagian dari `coderium-web-v2`) supaya
   konsisten dengan keputusanmu bahwa ini project baru — hindari nanti migrasi domain yang
   merusak SEO yang sudah terbangun.
6. **Ikuti pola CAF sendiri untuk membangun situs ini** (dogfooding) — Fase 1: landing + docs
   skeleton (statis dulu, tanpa `@nuxt/content` search). Fase 2: isi konten lengkap semua docs
   page. Fase 3: SEO polish + OG image + structured data. Fase 4: changelog + about + legal.
   Ini konsisten dengan disiplin PIV & checkpoint-and-confirm yang sudah kamu pakai di semua
   project lain — stop dan review tiap fase sebelum lanjut, bukan generate semua sekaligus
   lewat satu sesi Claude Code panjang.

---

## 8. Urutan Kerja Disarankan (untuk sesi Claude Code)

1. Scaffold Nuxt 3 + Tailwind + `@nuxtjs/seo` + `@nuxt/content` — kosongan, cek build jalan.
2. Layout dasar: Navbar, Footer, dua layout (`default`, `docs`).
3. Landing page section demi section (hero dulu, review, baru lanjut section berikutnya —
   jangan generate satu file 400 baris sekaligus).
4. Docs skeleton: sidebar + 2-3 halaman docs dummy, pastikan routing `[...slug]` jalan.
5. Isi konten docs asli (CAF Initiator, CAF Orchestrator, Core Concepts dari Layer 1-5).
6. Legal pages (terms, privacy) — konten bisa disiapkan manual/legal review, bukan di-generate
   AI mentah untuk hal legal.
7. SEO pass: meta tags, sitemap, OG image, structured data.
8. Deploy ke Vercel/Cloudflare, submit sitemap ke Search Console.

