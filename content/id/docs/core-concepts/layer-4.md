---
title: 'Layer 4: Quality Gates'
description: Spec gate, gate otomatis, dan gate manusia yang dilewati setiap perubahan sebelum boleh di-merge.
---

Layer 4 adalah mekanisme yang memutuskan apakah output sebuah fase cukup baik untuk
lanjut. Ada gate manusia opsional pada spec, gate otomatis pada hasil kerja, dan satu
gate manusia terakhir pada merge.

## Spec gate

Sebelum kode apa pun ditulis, Orchestrator mengecek spec yang ditulis Planner.
Pertanyaan `BLOCKING` tanpa jawaban menghentikan run dan bertanya di ticket. Ticket
berlabel `spec-approval` berhenti di Draft PR yang hanya berisi spec, sampai manusia
berkomentar `/caf-approve-spec`. Lihat
[CAF Orchestrator](/id/docs/caf-orchestrator#clarify-dan-spec-gate).

## Gate otomatis

| Gate | Dijalankan oleh | Report | Lolos bila |
|---|---|---|---|
| Verify implementasi | Agent implementasi, menjalankan Verify Checklist-nya (lint, typecheck, test, build) | `verify-report.md` | Report berisi `Status: SUCCESS` |
| Validasi | `caf-validator` — tidak mengubah kode (`caf-qa` di repo yang masih memilikinya) | `validate-report.md` (`qa-report.md`) | `Status: PASS` dan tidak ada acceptance criterion `FAIL` |
| Reviewer | `caf-reviewer` | `review-notes.md` | `Verdict: APPROVE` |

Validator melapor; ia tidak memperbaiki. Satu-satunya tulisannya adalah
`validate-report.md`, jadi pengecekan kualitas tidak bisa diam-diam "memperbaiki" apa
yang ia temukan — kegagalan dikembalikan ke agent implementasi dan dicatat di
[Layer 3: Artifact Handoff](/id/docs/core-concepts/layer-3).

Sebuah criterion `PASS` hanya bila Validator menjalankan buktinya sendiri. Apa pun yang
tidak bisa ia jalankan adalah `UNVERIFIED`; itu tidak pernah membuat report `FAIL`,
tapi report yang menyatakan `PASS` padahal semua criterion `UNVERIFIED` tidak
membuktikan apa-apa, jadi Orchestrator memperlakukannya sebagai `NEEDS_HUMAN`. Body PR
juga diawali ringkasan deterministik pass/fail/unverified dari acceptance criteria.

## Gate manusia

Setelah gate otomatis lolos, CAF Orchestrator membuka pull request. Me-merge-nya adalah
keputusan manusia yang eksplisit. Gate ini tidak bisa diotomasi — CAF tidak menyediakan
cara melewatinya.

## Kenapa keduanya wajib

Gate otomatis menangkap apa yang bisa dideteksi mesin — error lint, test yang gagal,
pola kode berisiko. Tapi tidak semua keputusan bisa direduksi jadi aturan otomatis:
konteks bisnis, trade-off arsitektur, atau risiko yang hanya terlihat oleh orang yang
memahami project. Gate manusia menutup celah itu.

## Retry policy

Ada dua retry, dihitung di tempat berbeda:

- **Verify retry** — di dalam satu agent: perbaiki dan verifikasi lagi, maksimal 3
  kali, lalu berhenti dengan `Status: NEEDS_HUMAN`.
- **Gate retry** — di Orchestrator: bila validasi `FAIL` atau reviewer memberi verdict
  `CHANGES_REQUESTED`, agent implementasi dijalankan ulang — sekali per gate secara
  default (`agents.qa.maxRetries` / `agents.reviewer.maxRetries`). Bila gate masih belum
  lolos, pekerjaan tidak dibiarkan terlantar: Orchestrator mem-push branch, membuka
  **Draft PR** dengan report yang gagal sebagai body-nya, dan berhenti menunggu manusia.

Dari sana manusia bisa memperbaikinya manual, atau melanjutkan pipeline dari gate yang
gagal dengan berkomentar `/caf-retry-pipeline` di Draft PR. Jumlah resume dibatasi
`orchestration.maxOrchestrationRetries` (default 2). Menunggu jawaban Clarify atau
persetujuan spec tidak dihitung terhadap batas itu.

Kegagalan tak terduga — crash atau timeout agent — berbeda: ia mengulang seluruh job
dari Planner.

## Membatasi validator

Validator menjalankan command dari spec, jadi Orchestrator menjalankannya dengan mode
terbatas secara default: Bash dibatasi allowlist (`pnpm run *`, `npm test`, ...),
penulisan dibatasi ke `.caf/tasks/`, dan secret Orchestrator dihapus dari
environment-nya. Lihat [Validator terbatas](/id/docs/caf-orchestrator#validator-terbatas).

## Melewati sebuah gate

Dengan `AGENT_SKIP_ENABLED=true` (default mati), Planner boleh menandai gate validasi
atau Reviewer sebagai tidak relevan untuk sebuah ticket. Skip tidak pernah senyap: body
PR mendapat peringatan eksplisit bahwa sebuah quality gate dilewati.

## Tanpa auto-merge

Ini konsekuensi langsung dari Layer 4: tidak ada jalur — sebersih apa pun hasil gate
otomatisnya — yang membuat PR bisa di-merge tanpa persetujuan manusia. Governance ini
yang membedakan CAF dari orchestrator agent yang mengejar kecepatan lewat auto-merge.

## Hubungan dengan layer lain

Layer 4 mengonsumsi report dari **Layer 3**, dan keputusan gate-nya menentukan apakah
[Layer 5: Orchestration](/id/docs/core-concepts/layer-5) boleh memajukan pipeline atau
harus berhenti untuk manusia.
