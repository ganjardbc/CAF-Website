---
title: 'Layer 3: Artifact Handoff'
description: Kenapa CAF menyimpan output setiap fase sebagai file Markdown di repo kamu, bukan di konteks chat.
---

Layer 3 adalah cara CAF memindahkan pekerjaan dari satu fase ke fase berikutnya —
lewat file Markdown di repo kamu, bukan lewat konteks percakapan yang hilang begitu
sesi agent berakhir.

## Kenapa Markdown, bukan konteks chat

Konteks chat itu sementara: begitu sesi agent selesai atau restart, semua nuansa di
balik keputusannya ikut hilang. Artifact Markdown di repo:

- Bertahan lintas sesi — agent fase berikutnya (bahkan yang jalan berhari-hari
  kemudian) tetap bisa membaca keputusan fase sebelumnya
- Bisa di-review manusia kapan saja, seperti membaca dokumen biasa
- Ter-version-control di git, jadi ada audit trail lengkap per ticket

## Struktur file per ticket

Setiap ticket punya folder sendiri di `.caf/tasks/<TICKET-ID>/`:

```
.caf/tasks/<TICKET-ID>/
  requirements.md
  tasks.md
  verify-report.md
  qa-report.md
  review-notes.md
```

| File | Ditulis oleh | Isi |
|---|---|---|
| `requirements.md` / `tasks.md` | Planner | Rencana kerja. `tasks.md` dibagi jadi `## Frontend Tasks`, `## Backend Tasks`, dan `## Docs Tasks` — dari situ Orchestrator menentukan agent mana yang jalan (Planner juga bisa menandai agent yang di-skip di sini — lihat [CAF Orchestrator](/id/docs/caf-orchestrator)) |
| `verify-report.md` | Agent implementasi | Perubahan yang dibuat dan hasil verification command |
| `qa-report.md` | QA | Matriks acceptance criteria dan baris `Status: PASS \| FAIL` |
| `review-notes.md` | Reviewer | Temuan review dan baris `Verdict: APPROVE \| CHANGES REQUESTED \| DEFER` |

Dua file lagi bisa muncul kalau CAF Orchestrator dipakai:

- `fix-review-log.md` — ditulis Reviewer saat menangani comment review di PR
  (`/caf-fix-review`), satu blok per comment dengan
  `Status: FIXED | SKIPPED | NOT_APPLICABLE`
- `orchestration-state.json` — ditulis Orchestrator sendiri, bukan agent, saat
  sebuah gate gagal. Isinya state untuk resume, dan dihapus begitu pipeline sukses

CAF Initiator hanya men-scaffold konvensinya (`.caf/tasks/README.md`). Folder ticket
ditulis saat runtime.

## Baris status adalah kontrak

CAF Orchestrator membaca report ini dengan pola sederhana: kata `SUCCESS` di
`verify-report.md`, baris `Status:` di `qa-report.md`, dan baris `Verdict:` di
`review-notes.md`. Baris-baris itu berasal dari section ter-track `Retry Logic` dan
`Report Format` di definisi agent — biarkan apa adanya.

## Loop baca-tulis antar fase

Setiap fase mengikuti pola yang sama:

1. Baca artifact fase sebelumnya (kalau ada) + konteks dari
   [Layer 1](/id/docs/core-concepts/layer-1) + definisi role-nya sendiri dari
   [Layer 2](/id/docs/core-concepts/layer-2)
2. Kerjakan pekerjaan dalam scope fase itu
3. Tulis outputnya sebagai artifact baru sebelum fase selesai

Reviewer manusia membaca seluruh rantai artifact — bukan cuma diff kode — untuk
memahami *kenapa* sebuah keputusan diambil, bukan cuma *apa* yang berubah.

## Hubungan dengan layer lain

Format artifact ditentukan oleh **Layer 2: Agent Definitions**. Report yang
dihasilkan di layer ini jadi masukan untuk
[Layer 4: Quality Gates](/id/docs/core-concepts/layer-4).
