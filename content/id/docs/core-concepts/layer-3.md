---
title: 'Layer 3: Artifact Handoff'
description: Kenapa CAF menyimpan output tiap fase sebagai file Markdown di repo kamu, bukan di konteks chat.
---

Layer 3 adalah cara CAF memindahkan pekerjaan dari satu fase ke fase berikutnya —
lewat file Markdown di repo kamu, bukan lewat konteks percakapan yang hilang begitu
sesi agent berakhir.

## Kenapa Markdown, bukan konteks chat

Konteks chat itu sementara: begitu sesi agent berakhir atau di-restart, seluruh nuansa
di balik keputusannya ikut hilang. Artifact Markdown di repo:

- Bertahan antar sesi — agent di fase berikutnya (bahkan yang dijalankan berhari-hari
  kemudian) tetap bisa membaca keputusan fase sebelumnya
- Bisa di-review manusia kapan saja, seperti membaca dokumen biasa
- Ter-version-control di git, memberi kamu audit trail lengkap per ticket

## Struktur file per ticket

Setiap ticket punya foldernya sendiri di `.caf/tasks/<TICKET-ID>/`:

```
.caf/tasks/<TICKET-ID>/
  requirements.md
  design.md          # hanya bila ticket membutuhkannya
  breakdown.md       # hanya untuk request dengan beberapa hasil
  tasks.md
  verify-report.md
  validate-report.md
  review-notes.md
```

| File | Ditulis oleh | Isi |
|---|---|---|
| `requirements.md` | Planner | Spec: hasil, scope, finding, assumption, keputusan, pertanyaan terbuka, dan acceptance criteria `AC-n` masing-masing dengan baris `Verify:`. Punya baris `Status:` (`DRAFT`, `NEEDS_CLARIFICATION`, `APPROVED`, `NEEDS_HUMAN`) |
| `design.md` | Planner | Desain teknis, hanya untuk ticket yang melintasi app, mengubah skema, atau mengubah kontrak. Tanpa baris `Status:` |
| `breakdown.md` | Planner | Usulan memecah request multi-hasil menjadi ticket. Tanpa baris `Status:` |
| `tasks.md` | Planner | Rencana kerja, dibagi `## Frontend Tasks`, `## Backend Tasks`, dan `## Docs Tasks` (begitulah Orchestrator menentukan agent mana yang jalan), diakhiri `## Coverage`, peta dari acceptance criteria ke task. Planner juga bisa menandai agent yang dilewati di sini — lihat [CAF Orchestrator](/id/docs/caf-orchestrator) |
| `verify-report.md` | Agent implementasi | `Status: SUCCESS` atau `NEEDS_HUMAN`, checklist, satu baris bukti per acceptance criterion, dan `## Proposed Spec Changes` |
| `validate-report.md` | Validator | Tabel per-criterion (`PASS` / `FAIL` / `UNVERIFIED`), verification gate, dan `Status: PASS \| FAIL \| NEEDS_HUMAN` |
| `review-notes.md` | Reviewer | Temuan review dan baris `Verdict: APPROVE \| CHANGES REQUESTED \| DEFER` |

Repo yang masih memakai gate QA lama punya `qa-report.md` (`Status: PASS | FAIL`)
sebagai ganti `validate-report.md`; Orchestrator membaca keduanya.

Dua file lagi bisa muncul saat CAF Orchestrator dipakai:

- `fix-review-log.md` — ditulis Reviewer saat menangani komentar PR review
  (`/caf-fix-review`), satu blok per komentar dengan
  `Status: FIXED | SKIPPED | NOT_APPLICABLE`
- `orchestration-state.json` — ditulis Orchestrator sendiri, bukan oleh agent, saat
  sebuah gate gagal atau run menunggu manusia. Berisi state resume dan dihapus begitu
  pipeline sukses

Bila pekerjaannya sesi di Claude Code dan bukan ticket, nama folder adalah slug singkat
dari request, bukan ID ticket.

CAF Initiator hanya men-scaffold konvensinya (`.caf/tasks/README.md`) dan format tiap
file (`.caf/workflows/agent-handoff.md`). Folder ticket ditulis saat runtime. Bila repo
menyimpan riwayat task sendiri (repo CAF sendiri memakai `.ai/tasks/`), riwayat itu bisa
di-track di git.

## Baris status adalah kontrak

CAF Orchestrator membaca report ini dengan pola sederhana: baris `Status:` di
`requirements.md`, kata `SUCCESS` pada baris `Status:` di `verify-report.md`, baris
`Status:` di `validate-report.md`, dan baris `Verdict:` di `review-notes.md`. Baris-baris
itu berasal dari section ter-track `Retry Logic` dan `Report Format` di definisi agent —
biarkan seperti hasil generate. Orchestrator juga menoleransi bentuk lama (heading
`## Status:`, `qa-report.md`).

## Loop baca-tulis antar fase

Setiap fase mengikuti pola yang sama:

1. Baca artifact fase sebelumnya (bila ada) + konteks dari
   [Layer 1](/id/docs/core-concepts/layer-1) + definisi role-nya sendiri dari
   [Layer 2](/id/docs/core-concepts/layer-2)
2. Kerjakan tugas dalam scope fase itu
3. Tulis output-nya sebagai artifact baru sebelum fase berakhir

Reviewer manusia membaca seluruh rantai artifact — bukan hanya diff kode — untuk
memahami *kenapa* sebuah keputusan diambil, bukan hanya *apa* yang berubah.

## Hubungan dengan layer lain

Format artifact ditentukan oleh **Layer 2: Agent Definitions**. Report yang dihasilkan
di layer ini mengalir ke [Layer 4: Quality Gates](/id/docs/core-concepts/layer-4).
