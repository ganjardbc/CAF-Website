---
title: 'Layer 4: Quality Gates'
description: Gate otomatis dan gate manusia yang harus dilewati setiap perubahan sebelum bisa di-merge.
---

Layer 4 adalah mekanisme yang memutuskan apakah output sebuah fase cukup baik untuk
lanjut. Ada beberapa gate otomatis dan satu gate manusia.

## Gate otomatis

| Gate | Dijalankan oleh | Report | Lolos kalau |
|---|---|---|---|
| Implementation verify | Agent implementasi, menjalankan Verify Checklist-nya (lint, typecheck, test, build) | `verify-report.md` | Report menyatakan `SUCCESS` |
| QA | `caf-qa` — tidak mengubah kode | `qa-report.md` | `Status: PASS` |
| Reviewer | `caf-reviewer` | `review-notes.md` | `Verdict: APPROVE` |

QA melaporkan; ia tidak memperbaiki. Satu-satunya yang ia tulis adalah
`qa-report.md`, jadi pengecekan kualitas tidak bisa diam-diam "memperbaiki" temuannya
— kegagalan dikembalikan ke agent implementasi dan tercatat di
[Layer 3: Artifact Handoff](/id/docs/core-concepts/layer-3).

## Gate manusia

Setelah gate otomatis lolos, CAF Orchestrator membuka pull request. Merge adalah
keputusan eksplisit manusia. Gate ini tidak bisa diotomasi — CAF tidak menyediakan
cara untuk melewatinya.

## Kenapa dua-duanya wajib

Gate otomatis menangkap apa yang bisa dideteksi mesin — error lint, test gagal, pola
kode berisiko. Tapi tidak semua keputusan bisa direduksi jadi aturan otomatis:
konteks bisnis, trade-off arsitektur, atau risiko yang cuma terlihat oleh orang yang
paham proyeknya. Gate manusia menutup celah itu.

## Retry policy

Kalau QA `FAIL` atau reviewer memberi verdict `CHANGES REQUESTED`, agent implementasi
dijalankan ulang — default sekali per gate (`agents.qa.maxRetries` /
`agents.reviewer.maxRetries`). Kalau gate masih belum lolos, pekerjaan tidak
dibiarkan terdampar: Orchestrator push branch, membuka **Draft PR** dengan report
yang gagal sebagai body-nya, lalu berhenti menunggu manusia.

Dari situ manusia bisa memperbaiki manual, atau melanjutkan pipeline dari gate yang
gagal dengan comment `/caf-retry-pipeline` di Draft PR. Resume dibatasi oleh
`orchestration.maxOrchestrationRetries` (default 2).

Kegagalan tak terduga — agent crash atau timeout — berbeda: seluruh job diulang dari
Planner.

## Melewati gate

Dengan `AGENT_SKIP_ENABLED=true` (default mati), Planner boleh menandai QA atau
Reviewer sebagai tidak relevan untuk sebuah ticket. Skip ini tidak pernah diam-diam:
body PR mendapat peringatan eksplisit bahwa quality gate dilewati.

## Tidak ada auto-merge

Ini konsekuensi langsung dari Layer 4: tidak ada jalur — sebersih apa pun hasil gate
otomatis — yang membuat PR ter-merge tanpa persetujuan manusia. Governance inilah
yang membedakan CAF dari agent orchestrator yang mengejar kecepatan lewat auto-merge.

## Hubungan dengan layer lain

Layer 4 memakai report dari **Layer 3**, dan keputusan gate-nya menentukan apakah
[Layer 5: Orchestration](/id/docs/core-concepts/layer-5) boleh melanjutkan pipeline
atau harus berhenti menunggu manusia.
