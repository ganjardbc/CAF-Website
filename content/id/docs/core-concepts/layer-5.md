---
title: 'Layer 5: Orchestration'
description: Bagaimana CAF Orchestrator merangkai empat layer sebelumnya jadi satu pipeline yang jalan sendiri.
---

Layer 5 adalah lapisan yang menjalankan semuanya — merangkai Layer 1 sampai 4 jadi satu
pipeline yang bergerak otomatis dari perubahan status ticket sampai PR siap direview.
Ini yang dikerjakan oleh **CAF Orchestrator**.

## Apa yang dilakukan orchestration

1. Menerima webhook saat status ticket berubah di Linear atau Jira
2. Mengantrikan job untuk fase yang sesuai lewat BullMQ + Redis
3. Spawn agent Claude Code headless untuk fase itu — agent membaca
   [Layer 1](/id/docs/core-concepts/layer-1) dan [Layer 2](/id/docs/core-concepts/layer-2),
   lalu menulis hasilnya ke [Layer 3](/id/docs/core-concepts/layer-3)
4. Menunggu hasil [Layer 4: Quality Gates](/id/docs/core-concepts/layer-4) sebelum memutuskan
   lanjut ke fase berikutnya atau berhenti menunggu manusia

Orchestrator tidak pernah melompati urutan ini. Kalau gate gagal atau menunggu approval,
pipeline berhenti di situ — tidak ada jalur pintas ke fase selanjutnya.

## Kenapa self-hosted

Orchestrator jalan di VPS milik kamu sendiri, bukan sebagai layanan yang dikelola
Coderium. Konsekuensinya: kode dan artifact proyek kamu tidak pernah keluar dari
infrastruktur yang kamu kontrol. Ini bukan detail implementasi kecil — ini bagian dari
janji privasi CAF.

Detail instalasi, konfigurasi webhook, dan variabel environment ada di halaman
[CAF Orchestrator](/id/docs/caf-orchestrator).

## Lima layer, satu pipeline

| Layer | Peran |
|---|---|
| [1. Project Knowledge Base](/id/docs/core-concepts/layer-1) | Konteks proyek yang dibaca semua agent |
| [2. Agent Definitions](/id/docs/core-concepts/layer-2) | Peran, batasan akses, kebijakan retry tiap agent |
| [3. Artifact Handoff](/id/docs/core-concepts/layer-3) | Hasil tiap fase, disimpan sebagai Markdown di repo |
| [4. Quality Gates](/id/docs/core-concepts/layer-4) | Gate otomatis + gate manusia sebelum lanjut fase |
| 5. Orchestration | Menjalankan urutan di atas secara otomatis, self-hosted |

Kelima layer ini yang membuat CAF berbeda dari sekadar "menjalankan AI agent" —
governance-nya ada di setiap lapisan, bukan cuma di satu titik pemeriksaan akhir.
