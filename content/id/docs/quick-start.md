---
title: Quick Start
description: Pasang CAF Initiator di repo kamu, lalu hubungkan CAF Orchestrator.
---

## 1. Jalankan CAF Initiator

CAF Initiator sudah dipublish di npm sebagai `caf-initiator` dan butuh Node.js 18
atau lebih baru. Dari root repo target kamu:

```bash
# 1. Preview — deteksi stack dan daftar file yang akan ditulis
npx -p caf-initiator caf-init scaffold --dry-run

# 2. Generate draft (konfirmasi sebelum tiap langkah)
npx -p caf-initiator caf-init scaffold

# 3. Opsional: tambahkan skill CAF
npx -p caf-initiator caf-init scaffold skills

# 4. Di AI runner kamu (mis. Claude Code), isi TODO-nya
/caf-complete-drafts

# 5. Cek hasilnya, lalu review diff dan commit
npx -p caf-initiator caf-init curate --check-drafts
```

Atau install binary `caf-init` secara global dulu:

```bash
npm install -g caf-initiator
caf-init scaffold
```

`scaffold` akan:

1. Mendeteksi stack proyek kamu (framework, package manager, repo mode) dan tracker
2. Menulis draft knowledge base: `CLAUDE.md`, `AGENTS.md`, `.caf/knowledge/`
3. Generate `.claude/agents/caf-*.md` beserta slash command pendampingnya
4. Membuat draft Definition of Done, workflow PIV, dan dokumen agent-handoff
5. Generate `/caf-complete-drafts`, command untuk mengisi `TODO` yang tersisa

Semua yang ditulis adalah draft deterministik. Review dulu sebelum dipakai tim atau
agent.

Lihat [CAF Initiator](/id/docs/caf-initiator) untuk referensi command lengkap
(`scaffold`, `curate`, `docs`, `export`).

## 2. Hubungkan CAF Orchestrator

Langkah ini opsional — agent yang di-generate sudah bisa jalan langsung di Claude
Code. Setup CAF Orchestrator kalau kamu mau ticket berjalan otomatis begitu siap di
Linear atau GitHub Issues:

```bash
git clone https://github.com/coderiumid/caf-orchestrator.git
cd caf-orchestrator
pnpm install
cp .env.example .env                         # secret dan toggle operasional
cp caf.config.example.yaml caf.config.yaml   # config struktural
pnpm dev            # web server
pnpm dev:worker     # worker, proses terpisah
```

Orchestrator memanggil agent berdasarkan nama file. Di repo single-package, generate
agent implementasi dengan `--role frontend` atau `--role backend` supaya ditulis
sebagai `caf-frontend.md` / `caf-backend.md` — lihat
[Repo mode](/id/docs/caf-initiator#repo-mode-monorepo-vs-single_repo).

Lihat [CAF Orchestrator](/id/docs/caf-orchestrator) untuk setup lengkap, requirement,
dan konfigurasi webhook.
