---
title: Quick Start
description: Pasang CAF Initiator di repo kamu, lalu hubungkan CAF Orchestrator.
---

## 1. Jalankan CAF Initiator

CAF Initiator dipublish ke npm sebagai `caf-initiator` dan butuh Node.js 18 atau lebih
baru. Dari root repo target kamu:

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

Atau pasang binary `caf-init` secara global dulu:

```bash
npm install -g caf-initiator
caf-init scaffold
```

`scaffold` akan:

1. Mendeteksi stack project kamu (framework, package manager, repo mode) dan tracker
2. Menulis draft knowledge base: `CLAUDE.md`, `AGENTS.md`, `.caf/knowledge/`
3. Men-generate lima agent (`caf-planner`, `caf-frontend`, `caf-backend`,
   `caf-validator`, `caf-reviewer`) di `.claude/agents/`, dan slash command
   pendampingnya (`/caf-plan`, `/caf-run`, `/caf-review`, `/caf-fix-review`)
4. Menyusun draft Definition of Done, workflow PIV, dan dokumen agent-handoff
5. Men-generate `/caf-complete-drafts`, command yang mengisi `TODO` yang tersisa

Semua yang ditulisnya adalah draft deterministik. Review dulu sebelum tim atau agent
kamu mengandalkannya.

## 2. Coba Planner

Kamu bisa memakai agent hasil generate tanpa server apa pun. Di Claude Code, minta spec:

```
/caf-plan Tambahkan field email di form signup
```

Planner menulis `requirements.md` dan `tasks.md` di `.caf/tasks/<ID>/` lalu berhenti.
Review spec-nya, lalu biarkan `/caf-run` membawanya lewat implementasi, validasi, dan
review di sesi yang sama. Lihat [Spec-Driven Development](/id/docs/sdd) untuk isi spec.

Lihat [CAF Initiator](/id/docs/caf-initiator) untuk referensi command lengkap
(`scaffold`, `curate`, `docs`, `export`).

## 3. Hubungkan CAF Orchestrator

Langkah ini opsional. Pasang CAF Orchestrator saat kamu ingin ticket jalan otomatis
begitu siap di Linear atau GitHub Issues:

```bash
git clone https://github.com/coderiumid/caf-orchestrator.git
cd caf-orchestrator
pnpm install
cp .env.example .env                         # secret dan toggle operasional
cp caf.config.example.yaml caf.config.yaml   # config struktural
pnpm dev            # web server
pnpm dev:worker     # worker, proses terpisah
```

Orchestrator memanggil agent berdasarkan nama file, jadi pertahankan nama hasil generate
(`caf-frontend.md` / `caf-backend.md`, termasuk di repo single-package). Ia menjalankan
`caf-validator` bila repo punya file itu, dan `caf-qa` bila tidak.

Lihat [CAF Orchestrator](/id/docs/caf-orchestrator) untuk setup lengkap, requirements,
dan konfigurasi webhook.
