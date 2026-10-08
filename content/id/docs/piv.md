---
title: Konsep PIV
description: Disiplin Plan, Implement, Verify yang jadi inti CAF.
---

PIV adalah singkatan dari **Plan → Implement → Verify** — tiga fase inti yang
dijalani agent sebelum PR dibuat.

## Plan

Agent Planner membaca ticket dan menulis rencananya sebagai artifact Markdown
(`requirements.md`, `tasks.md`) di `.caf/tasks/<TICKET-ID>/`. Ia tidak menyentuh
kode.

## Implement

Agent implementasi menulis kode berdasarkan plan, dibatasi pada scope-nya sendiri.
Pekerjaannya tercatat di artifact handoff — tidak hilang di konteks chat.

## Verify

Agent implementasi menjalankan command lint, typecheck, test, dan build yang
benar-benar ada di repo, lalu mencatat hasilnya di `verify-report.md`. Setelah itu
ada dua gate lagi, dijalankan oleh agent yang tidak mengubah kode: **QA**
(`qa-report.md`, `Status: PASS | FAIL`) dan **Reviewer** (`review-notes.md`,
`Verdict: APPROVE | CHANGES REQUESTED | DEFER`).

## Di mana manusia masuk

- **Sesi manual.** Di Claude Code, skill `caf-piv` membuat agent menyusun plan,
  menunggu persetujuan kamu, implement, lalu verify.
- **CAF Orchestrator.** Rantai agent jalan sendiri sampai pull request terbuka.
  Checkpoint manusianya adalah review PR: tidak ada yang pernah di-merge otomatis.

## Kalau gate gagal

Kalau QA `FAIL` atau reviewer memberi verdict `CHANGES REQUESTED`, Orchestrator
menjalankan ulang agent implementasi (default sekali per gate). Kalau gate masih
gagal, ia push branch, membuka **Draft PR** berisi report yang gagal, lalu berhenti
menunggu manusia. Dari situ kamu bisa perbaiki manual atau comment
`/caf-retry-pipeline` untuk melanjutkan dari gate yang gagal — lihat
[CAF Orchestrator](/id/docs/caf-orchestrator#melanjutkan-pipeline-yang-berhenti-caf-retry-pipeline).

Hanya crash atau timeout tak terduga yang mengulang seluruh pipeline dari Planner.
