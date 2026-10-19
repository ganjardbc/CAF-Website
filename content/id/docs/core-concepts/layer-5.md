---
title: 'Layer 5: Orchestration'
description: Bagaimana CAF Orchestrator merangkai empat layer sebelumnya menjadi satu pipeline yang jalan sendiri.
---

Layer 5 adalah layer yang menjalankan semuanya — merangkai Layer 1 sampai 4 menjadi
satu pipeline yang bergerak otomatis dari ticket yang siap sampai PR yang siap
di-review. Inilah yang dikerjakan **CAF Orchestrator**.

## Apa yang dilakukan orkestrasi

1. Menerima webhook saat ticket menjadi "Ready for AI" — ticket Linear masuk ke
   workflow state yang dikonfigurasi, atau GitHub Issue mendapat label yang
   dikonfigurasi (dukungan Jira direncanakan tapi belum diimplementasikan)
2. Meng-queue satu job pipeline lewat BullMQ + Redis
3. Meng-clone repo target dan menjalankan agent berurutan sebagai proses Claude Code
   headless: `caf-planner` → `caf-frontend` / `caf-backend` → `caf-validator` →
   `caf-reviewer`, plus `caf-documentation` bila repo punya. Tiap agent membaca
   [Layer 1](/id/docs/core-concepts/layer-1) dan [Layer 2](/id/docs/core-concepts/layer-2),
   lalu menulis outputnya ke [Layer 3](/id/docs/core-concepts/layer-3)
4. Membaca spec setelah Planner: pertanyaan terbuka menghentikan run dan ditanyakan di
   ticket, dan ticket di belakang label spec-approval menunggu `/caf-approve-spec`
5. Memeriksa tiap [quality gate Layer 4](/id/docs/core-concepts/layer-4) sebelum lanjut
6. Mem-push branch `ai-agent/<TICKET-KEY>`, membuka PR GitHub, dan melapor balik di ticket

Orchestrator tidak pernah melewati urutan ini. Bila sebuah gate habis, pipeline
berhenti di situ dengan Draft PR — tidak ada jalan pintas ke tahap berikutnya.

Ia juga menjalankan review AI atas PR yang dibukanya, digerakkan komentar PR
(`/caf-review`, `/caf-fix-review`), dan bisa menampilkan setiap run di dashboard
monitoring live.

## Kenapa self-hosted

Orchestrator jalan di VPS milik kamu, bukan sebagai layanan yang dikelola Coderium.
Konsekuensinya: kode project dan artifact kamu tidak pernah keluar dari infrastruktur
yang kamu kendalikan. Ini bukan detail implementasi yang sepele — ini bagian dari
jaminan privasi CAF. Token git tidak pernah ditulis ke workspace, dan validator
berjalan tanpa secret Orchestrator di environment-nya.

Detail instalasi, konfigurasi webhook, dan environment variable dibahas di halaman
[CAF Orchestrator](/id/docs/caf-orchestrator).

## Orkestrasi itu opsional

Layer 1–4 jalan tanpanya: agent yang di-generate CAF Initiator juga jalan langsung di
Claude Code, atau lewat command `/caf-plan` dan `/caf-run` hasil generate.

## Lima layer, satu pipeline

| Layer | Peran |
|---|---|
| [1. Project Knowledge Base](/id/docs/core-concepts/layer-1) | Konteks project yang dibaca setiap agent |
| [2. Agent Definitions](/id/docs/core-concepts/layer-2) | Role, batas akses, retry policy tiap agent |
| [3. Artifact Handoff](/id/docs/core-concepts/layer-3) | Output tiap fase, disimpan sebagai Markdown di repo |
| [4. Quality Gates](/id/docs/core-concepts/layer-4) | Spec gate, gate otomatis, dan gate manusia sebelum merge |
| 5. Orchestration | Menjalankan semua di atas secara otomatis, self-hosted |

Lima layer inilah yang membuat CAF lebih dari sekadar "menjalankan AI agent" —
governance ada di setiap layer, bukan hanya di satu checkpoint akhir.
