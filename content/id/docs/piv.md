---
title: Konsep PIV
description: Disiplin Plan, Implement, Verify yang jadi inti CAF.
---

PIV adalah singkatan dari **Plan → Implement → Verify** — tiga fase inti yang
dijalani agent sebelum PR dibuat.

## Plan

Agent Planner membaca ticket dan menulis rencananya sebagai artifact Markdown di
`.caf/tasks/<TICKET-ID>/`: spec (`requirements.md`) dan `tasks.md`, plus `design.md`
atau `breakdown.md` bila request membutuhkannya. Ia tidak menyentuh kode, dan ia
berhenti untuk bertanya bila ada pertanyaan blocking yang belum dijawab. Lihat
[Spec-Driven Development](/id/docs/sdd).

## Implement

Agent implementasi menulis kode berdasarkan spec dan task, dibatasi pada scope-nya
sendiri. Pekerjaannya tercatat di artifact handoff — tidak hilang di konteks chat.

## Verify

Agent implementasi menjalankan command lint, typecheck, test, dan build yang
benar-benar ada di repo, lalu mencatat hasilnya di `verify-report.md`, dengan satu baris
bukti per acceptance criterion. Setelah itu ada dua gate lagi, dijalankan oleh agent
yang tidak mengubah kode: **Validator** (`validate-report.md`,
`Status: PASS | FAIL | NEEDS_HUMAN`, mengecek setiap acceptance criterion dengan
menjalankan buktinya) dan **Reviewer** (`review-notes.md`,
`Verdict: APPROVE | CHANGES REQUESTED | DEFER`).

## Dua retry, dihitung di tempat berbeda

- **Verify retry** — di dalam satu agent. Setelah lint, typecheck, atau test gagal,
  agent memperbaiki dan memverifikasi lagi, maksimal 3 kali, lalu berhenti dengan
  `Status: NEEDS_HUMAN`.
- **Gate retry** — di Orchestrator, per gate (validasi, reviewer). Jumlah retry yang
  diizinkan Orchestrator saat sebuah gate gagal, sebelum berhenti. Defaultnya 1, untuk
  menghemat token, dan bisa dikonfigurasi (`agents.qa.maxRetries`,
  `agents.reviewer.maxRetries`).

## Di mana manusia masuk

- **Sesi manual.** Di Claude Code, skill `caf-piv` membuat agent menyusun plan, menunggu
  persetujuan kamu, implement, lalu verify.
- **CAF Orchestrator.** Rantai agent jalan sendiri sampai pull request terbuka. Ia juga
  bisa menunggu kamu lebih awal: saat spec punya pertanyaan terbuka, dan — untuk ticket
  berlabel spec-approval — saat kamu perlu menyetujui spec. Checkpoint terakhir adalah
  review PR: tidak ada yang pernah di-merge otomatis.

## Saat sebuah gate gagal

Bila validasi `FAIL` atau reviewer memberi verdict `CHANGES_REQUESTED`, Orchestrator
menjalankan ulang agent implementasi (sekali per gate secara default). Bila gate masih
gagal, ia mem-push branch, membuka **Draft PR** berisi report yang gagal, dan berhenti
menunggu manusia. Dari sana kamu bisa memperbaikinya manual atau berkomentar
`/caf-retry-pipeline` untuk melanjutkan dari gate yang gagal — lihat
[CAF Orchestrator](/id/docs/caf-orchestrator#melanjutkan-pipeline-yang-berhenti-caf-retry-pipeline).

Hanya crash atau timeout tak terduga yang mengulang seluruh pipeline dari Planner.
