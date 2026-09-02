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
interaktif top-level, pilih subcommand secara eksplisit (`scaffold`, `export`, `curate`, `docs`).

Semua penulisan file **non-destructive secara default** — file yang sudah ada tidak
pernah ditimpa diam-diam, jadi menjalankan ulang command selalu aman. `scaffold` dan
`export` sama-sama punya `--force` sebagai opt-in eksplisit kalau kamu memang ingin
generate ulang file yang sudah ada (misalnya setelah upgrade `caf-initiator` dan mau
pakai template agent terbaru) — ini menimpa langsung, termasuk edit manual yang sudah
kamu buat sejak generate terakhir, jadi cek `git diff` setelahnya.

### `caf-init scaffold`

Command utama. Tanpa target, menjalankan **Setup → Golden Examples → ADR →
Agents → Task Completion → Workflow** berurutan, dengan konfirmasi skip di
tiap step:

1. Mendeteksi stack proyek (framework, package manager, struktur folder)
2. Memilih golden examples sebagai referensi AI
3. Membuat draft Architecture Decision Records untuk keputusan teknis yang terdeteksi
4. Generate `.claude/agents/` — definisi tiap agent role (Planner, Architect,
   agent implementasi Frontend/Backend per-app, QA, Reviewer, Documentation, DevOps,
   Auditor, PM, UX Designer)
5. Membuat draft Definition of Done dari verify script di `package.json`
6. Generate dokumen workflow PIV dan agent-handoff dari roster agent kamu

`docs` (Reference Docs) dan `feature-catalog-sync` tidak pernah masuk chain
bare ini — keduanya opt-in, jalankan sebagai target eksplisit.

Berikan target (`caf-init scaffold <target>`, salah satu dari
`golden-examples`, `adr`, `agents`, `task-completion`, `workflow`,
`feature-catalog-sync`) untuk menjalankan bagian itu saja, dengan behavior
yang sama seperti dijalankan standalone.

| Option | Deskripsi | Default |
|---|---|---|
| `--dir <path>` | Direktori target repo | `cwd` |
| `--dry-run` | Tampilkan hasil deteksi tanpa menulis apapun | `false` |
| `--app <app-path>` | Batasi ke satu app path (mis. `apps/api`) — dipakai target `golden-examples`/`adr`/`agents`/`task-completion` | semua app |
| `--agent-dir <path>` | Direktori baca/tulis definisi agent | `.claude/agents` |
| `--command-dir <path>` | Direktori tulis companion slash command — dipakai target `agents`/`feature-catalog-sync` | `.claude/commands` |
| `--force` | Timpa file yang sudah ada, bukan di-skip — hanya dipakai target `agents` | `false` |

#### `caf-init scaffold agents`

Agent implementasi Frontend/Backend masing-masing bisa di-assign ke **lebih dari
satu app** — pilih `apps/web` dan `apps/landing` sekaligus untuk role Frontend
misalnya, dan `caf-frontend.md` hasil generate-nya akan punya scope yang list
semua app plus instruksi baca tag app di tiap baris task `tasks.md`
(`- [ ] (apps/web) Fix email validation`). Role yang di-assign cuma satu app
tetap render format single-app biasa — tidak ada yang berubah untuk project
non-monorepo atau role dengan satu app.

### `caf-init docs`

Men-scaffold dokumen referensi Layer 1 opsional dan read-only
(`docs/product/prd.md`, Feature Specs, `docs/architecture/system-overview.md`,
`docs/api-contract.md`, `docs/schema/erd.md`, `docs/testing-strategy.md`).
Tidak ada yang wajib untuk pipeline CAF berjalan — file yang sudah ada tidak
pernah ditimpa, dan mode interaktif menanyakan per item sebelum membuat placeholder.

| Option | Deskripsi | Default |
|---|---|---|
| `--dir <path>` | Direktori target repo | `cwd` |
| `--dry-run` | Tampilkan hasil deteksi tanpa menulis apapun | `false` |
| `--include <items...>` | Non-interaktif: hanya generate item ini (`product`, `architecture`, `schema`, `testing-strategy`, `api-contract`) | prompt interaktif |
| `--feature <name...>` | Non-interaktif: nama Feature Spec untuk generate placeholder | prompt interaktif |

### `caf-init export`

Menyalin definisi agent dan/atau command yang sudah di-generate ke target AI
runner lain (`.kiro/`, `.opencode/`, `.cursor/`, `.clinerules/`, atau folder
custom), dengan peringatan risiko enforcement eksplisit sebelum publish ke
target yang scope/enforcement tool-nya belum tervalidasi.

| Option | Deskripsi | Default |
|---|---|---|
| `--dir <path>` | Direktori target repo | `cwd` |
| `--agent-dir <path>` | Direktori sumber definisi agent yang sudah ada | `.claude/agents` |
| `--kind <agent\|command\|both>` | Apa yang dipublish — definisi agent, companion slash command, atau dua-duanya | `agent` |
| `--dry-run` | Tampilkan apa yang akan dipublish tanpa menulis apapun | `false` |
| `--force` | Timpa file yang sudah ada di destination, bukan di-skip | `false` |

`--kind` defaultnya cuma `agent` — pakai `--kind both` (atau `--kind command`)
kalau mau companion slash command ikut dipublish ulang, kalau tidak, run
`--force` bakal refresh agent tapi diam-diam meninggalkan command yang basi
di destination.

### `caf-init curate`

Audit compliance Layer 1-4 (read-only), lalu menawarkan sync bagian yang
kurang ke `.claude/agents/*.md`. `--audit-only` mengisolasi report untuk CI gate.

| Option | Deskripsi | Default |
|---|---|---|
| `--dir <path>` | Direktori target repo | `cwd` |
| `--agent-dir <path>` | Direktori berisi definisi agent yang sudah ada | `.claude/agents` |
| `--output <file>` | Simpan juga audit report sebagai markdown ke path ini | tidak ada |
| `--audit-only` | Report saja, non-interaktif — exit code 1 kalau ada gap wajib (untuk CI gate) | `false` |
| `--sync-only` | Skip audit report, langsung ke flow sync | `false` |
| `--dry-run` | Dengan `--sync-only`: tampilkan apa yang akan ditambah tanpa menulis/prompt | `false` |

## Struktur file yang di-generate

```
.claude/
  agents/
    caf-planner.md
    caf-architect.md
    caf-frontend.md
    caf-backend.md
    caf-qa.md
    caf-reviewer.md
    caf-documentation.md
    ...
  commands/
    caf-plan-ticket.md
    ...
.ai/
  tasks/
    README.md
.caf/
  knowledge/
    INDEX.md
    golden-examples/
    decisions/
  workflows/
    piv-workflow.md
    agent-handoff.md
    task-completion.md
```

- **`.claude/agents/`** — satu file per role, berisi instruksi dan batasan akses tiap agent
  (misalnya Reviewer bersifat read-only sampai ada approval gate eksplisit). Frontend/Backend
  masing-masing bisa cover lebih dari satu app — lihat `caf-init scaffold agents` di atas.
- **`.claude/commands/`** — companion slash command yang di-generate berbarengan
  dengan role tertentu (Planner, Architect, QA, Reviewer, Auditor, PM, ...).
- **`.ai/tasks/README.md`** — mendeskripsikan konvensi artifact handoff. Folder
  per-ticket di `.caf/tasks/{TICKET-ID}/` (`requirements.md`, `tasks.md`,
  `verify-report.md`, ...) ditulis saat runtime oleh agent selama pipeline
  berjalan — CAF Initiator cuma men-scaffold konvensinya, bukan folder ticket-nya sendiri.
