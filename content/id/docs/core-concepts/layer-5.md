---
title: 'Layer 5: Orchestration'
description: Bagaimana CAF Orchestrator merangkai empat layer sebelumnya jadi satu pipeline yang jalan sendiri.
---

Layer 5 adalah layer yang menjalankan semuanya — merangkai Layer 1 sampai 4 jadi
satu pipeline yang bergerak otomatis dari ticket yang siap sampai PR siap di-review.
Inilah yang dikerjakan **CAF Orchestrator**.

## Apa yang dilakukan orchestration

1. Menerima webhook saat ticket jadi "Ready for AI" — ticket Linear masuk ke
   workflow state yang dikonfigurasi, atau GitHub Issue mendapat label yang
   dikonfigurasi (dukungan Jira direncanakan, belum diimplementasikan)
2. Memasukkan satu job pipeline ke antrian lewat BullMQ + Redis
3. Clone repo target dan menjalankan agent secara berurutan sebagai proses Claude
   Code headless: `caf-planner` → `caf-frontend` / `caf-backend` → `caf-qa` →
   `caf-reviewer` → `caf-documentation`. Tiap agent membaca
   [Layer 1](/id/docs/core-concepts/layer-1) dan
   [Layer 2](/id/docs/core-concepts/layer-2), lalu menulis outputnya ke
   [Layer 3](/id/docs/core-concepts/layer-3)
4. Mengecek tiap [quality gate Layer 4](/id/docs/core-concepts/layer-4) sebelum
   lanjut
5. Push branch `ai-agent/<TICKET-KEY>`, membuka PR di GitHub, dan melapor balik ke
   ticket

Orchestrator tidak pernah melompati urutan ini. Kalau sebuah gate habis jatah
retry-nya, pipeline berhenti di situ dengan Draft PR — tidak ada jalan pintas ke
tahap berikutnya.

Ia juga menjalankan AI review pada PR yang dibukanya, dipicu comment di PR
(`/caf-review`, `/caf-fix-review`), dan bisa menampilkan setiap run di dashboard
monitoring live.

## Kenapa self-hosted

Orchestrator jalan di VPS kamu sendiri, bukan sebagai layanan yang dikelola
Coderium. Konsekuensinya: kode dan artifact proyek kamu tidak pernah keluar dari
infrastruktur yang kamu kendalikan. Ini bukan detail implementasi kecil — ini bagian
dari jaminan privasi CAF.

Detail instalasi, konfigurasi webhook, dan environment variable dibahas di halaman
[CAF Orchestrator](/id/docs/caf-orchestrator).

## Orchestration itu opsional

Layer 1–4 tetap berfungsi tanpanya: agent yang di-generate CAF Initiator juga bisa
jalan langsung di Claude Code, atau lewat command `/caf-run-pipeline` yang
di-generate.

## Lima layer, satu pipeline

| Layer | Peran |
|---|---|
| [1. Project Knowledge Base](/id/docs/core-concepts/layer-1) | Konteks proyek yang dibaca setiap agent |
| [2. Agent Definitions](/id/docs/core-concepts/layer-2) | Role, batas akses, retry policy tiap agent |
| [3. Artifact Handoff](/id/docs/core-concepts/layer-3) | Output tiap fase, disimpan sebagai Markdown di repo |
| [4. Quality Gates](/id/docs/core-concepts/layer-4) | Gate otomatis + gate manusia sebelum merge |
| 5. Orchestration | Menjalankan semua di atas secara otomatis, self-hosted |

Lima layer inilah yang membuat CAF lebih dari "sekadar menjalankan AI agent" —
governance ada di setiap layer, bukan cuma di satu checkpoint terakhir.
