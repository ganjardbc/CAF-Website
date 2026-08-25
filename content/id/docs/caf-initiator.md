---
title: CAF Initiator
description: CLI scaffold generator — deteksi stack otomatis dan generate knowledge base agent.
---

CAF Initiator adalah CLI yang men-scaffold semua yang dibutuhkan CAF di repo kamu: deteksi
stack proyek secara otomatis, lalu generate definisi agent dan template artifact handoff.

## Instalasi

Cara tercepat, tanpa instalasi global — jalankan langsung dengan `npx`:

```bash
npx caf-initiator init
```

Kalau kamu sering memakainya di banyak repo, install secara global:

```bash
npm install -g caf-initiator
caf-initiator init
```

**Prasyarat:**

- Node.js 18 atau lebih baru
- Repo yang sudah diinisialisasi dengan `git init`

## Commands

### `caf-initiator init`

Command utama. Menjalankan alur scaffold penuh:

1. Mendeteksi stack proyek (framework, package manager, struktur folder)
2. Generate `.claude/agents/` — definisi tiap agent role (Planner, Implementer, Verifier,
   Reviewer)
3. Generate `.ai/tasks/` — template artifact handoff antar fase

### `caf-initiator export`

Meng-export konfigurasi agent yang sudah kamu sesuaikan menjadi satu file yang bisa
dibagikan atau di-versioning terpisah dari repo utama — berguna kalau kamu ingin memakai
konfigurasi yang sama di beberapa repo.

> Command lain akan didokumentasikan di sini begitu dirilis pada versi berikutnya.

## Struktur file yang di-generate

```
.claude/
  agents/
    planner.md
    implementer.md
    verifier.md
    reviewer.md
.ai/
  tasks/
    <ticket-id>/
      plan.md
      implementation-notes.md
      verify-report.md
```

- **`.claude/agents/`** — satu file per role, berisi instruksi dan batasan akses tiap agent
  (misalnya Verifier bersifat read-only sampai ada approval gate eksplisit).
- **`.ai/tasks/<ticket-id>/`** — artifact handoff antar fase untuk satu ticket. Setiap fase
  menulis hasilnya sebagai file Markdown di sini, bukan menyimpannya di context chat yang
  hilang begitu sesi berakhir.
