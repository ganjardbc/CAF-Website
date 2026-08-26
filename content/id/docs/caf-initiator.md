---
title: CAF Initiator
description: CLI scaffold generator — deteksi stack otomatis dan generate knowledge base agent.
---

CAF Initiator adalah CLI yang men-scaffold semua yang dibutuhkan CAF di repo kamu: deteksi
stack proyek secara otomatis, lalu generate definisi agent dan template artifact handoff.

> CAF Initiator masih pre-1.0 (`v0.1.0`), sudah dipublish ke npm sebagai
> [`caf-initiator`](https://www.npmjs.com/package/caf-initiator).

## Instalasi

Jalankan langsung pakai `npx` — tanpa install:

```bash
npx -p caf-initiator caf-init scaffold
```

Atau install binary `caf-init` secara global:

```bash
npm install -g caf-initiator
caf-init scaffold
```

**Prasyarat:**

- Node.js 18 atau lebih baru
- Repo yang sudah diinisialisasi dengan `git init`

## Commands

Jalankan `caf-init` tanpa subcommand untuk lihat help — tidak ada menu
interaktif top-level, pilih subcommand secara eksplisit.

### `caf-init scaffold`

Command utama. Tanpa target, menjalankan **Setup → Golden Examples → ADR →
Agents → Task Completion → Workflow** berurutan, dengan konfirmasi skip di
tiap step:

1. Mendeteksi stack proyek (framework, package manager, struktur folder)
2. Memilih golden examples sebagai referensi AI
3. Membuat draft Architecture Decision Records untuk keputusan teknis yang terdeteksi
4. Generate `.claude/agents/` — definisi tiap agent role (Planner, Architect,
   agent implementasi per-app, QA, Reviewer, Documentation, DevOps, Auditor,
   PM, UX Designer)
5. Membuat draft Definition of Done dari verify script di `package.json`
6. Generate dokumen workflow PIV dan agent-handoff dari roster agent kamu

Berikan target (`caf-init scaffold <target>`, salah satu dari
`golden-examples`, `adr`, `agents`, `task-completion`, `workflow`,
`feature-catalog-sync`) untuk menjalankan bagian itu saja.

### `caf-init docs`

Men-scaffold dokumen referensi Layer 1 opsional dan read-only
(`docs/product/prd.md`, Feature Specs, `docs/architecture/system-overview.md`,
`docs/api-contract.md`, `docs/schema/erd.md`, `docs/testing-strategy.md`).
Tidak ada yang wajib untuk pipeline CAF berjalan.

### `caf-init export`

Menyalin definisi agent yang sudah di-generate ke target AI runner lain
(`.kiro/agents/`, `.opencode/agents/`, dsb), dengan peringatan risiko
enforcement eksplisit.

### `caf-init curate`

Audit compliance Layer 1-4 (read-only), lalu menawarkan sync bagian yang
kurang ke `.claude/agents/*.md`. `--audit-only` mengisolasi report untuk CI gate.

## Struktur file yang di-generate

```
.claude/
  agents/
    planner.md
    architect.md
    qa.md
    reviewer.md
    documentation.md
    ...
.ai/
  tasks/
    README.md
.caf/
  knowledge/
    golden-examples/
    decisions/
  workflows/
    piv-workflow.md
    agent-handoff.md
    task-completion.md
```

- **`.claude/agents/`** — satu file per role, berisi instruksi dan batasan akses tiap agent
  (misalnya Reviewer bersifat read-only sampai ada approval gate eksplisit).
- **`.ai/tasks/README.md`** — mendeskripsikan konvensi artifact handoff. Folder
  per-ticket (`plan.md`, `implementation-notes.md`, `verify-report.md`) ditulis
  saat runtime oleh agent selama pipeline berjalan — CAF Initiator cuma
  men-scaffold konvensinya, bukan folder ticket-nya sendiri.
