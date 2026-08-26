---
title: Quick Start
description: Pasang CAF Initiator di repo kamu, lalu hubungkan CAF Orchestrator.
---

## 1. Jalankan CAF Initiator

CAF Initiator sudah dipublish di npm sebagai `caf-initiator`. Dari root repo target kamu:

```bash
npx -p caf-initiator caf-init scaffold
```

Atau install binary `caf-init` secara global dulu:

```bash
npm install -g caf-initiator
caf-init scaffold
```

Command ini akan:

1. Mendeteksi stack proyek kamu (framework, package manager, struktur repo)
2. Generate `.claude/agents/` — definisi tiap agent role
3. Membuat draft dokumen workflow PIV dan agent-handoff antar fase

Lihat [CAF Initiator](/id/docs/caf-initiator) untuk referensi command lengkap
(`scaffold`, `docs`, `export`, `curate`).

## 2. Hubungkan CAF Orchestrator

Setelah repo kamu punya definisi agent, setup CAF Orchestrator supaya ticket
berjalan otomatis begitu statusnya berubah di Linear:

```bash
git clone <url-repo-caf-orchestrator-kamu>
cd caf-orchestrator
pnpm install
cp .env.example .env
# isi variabel yang wajib — lihat referensi Environment Variables
pnpm dev
pnpm dev:worker
```

Lihat [CAF Orchestrator](/id/docs/caf-orchestrator) untuk setup lengkap,
prasyarat, dan konfigurasi webhook.
