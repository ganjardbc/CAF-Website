---
title: Introduction
description: Apa itu CAF dan bagaimana cara kerjanya.
---

CAF (Coderium Agent Framework) menjalankan AI agent sebagai tim engineering yang
membawa sebuah ticket dari spec sampai pull request, dengan governance ketat di
sepanjang jalan.

Setiap task berjalan lewat siklus **Plan → Implement → Verify → PR**, dan dimulai dari
spec tertulis: Planner menulisnya, manusia bisa menyetujuinya, dan setiap agent
berikutnya dicek terhadapnya (lihat [Spec-Driven Development](/id/docs/sdd)). Setiap
gate yang gagal menghentikan pipeline dan menyerahkan pekerjaan ke manusia, dan tidak
ada yang pernah di-merge otomatis.

## Dua komponen inti

- **CAF Initiator** — CLI `caf-init`. Ia mendeteksi stack, package manager, dan ticket
  tracker repo kamu, lalu menulis file awal CAF: knowledge base, definisi agent,
  dokumen workflow, slash command, dan skill. Ia tidak pernah memanggil model AI; apa
  pun yang tidak bisa dideteksi dibiarkan sebagai `TODO`.
- **CAF Orchestrator** — webhook receiver (Fastify + BullMQ + Redis) yang jalan di VPS
  kamu sendiri. Begitu sebuah ticket siap — workflow state di Linear atau label di
  GitHub Issue — ia menjalankan agent secara berurutan dan membuka pull request. Ia
  bertanya di ticket saat spec punya pertanyaan terbuka, dan bisa menunggu manusia
  menyetujui spec sebelum satu baris kode pun ditulis. Dukungan Jira direncanakan tapi
  belum diimplementasikan.

Kamu bisa memakai CAF Initiator saja: agent yang di-generate-nya juga jalan langsung di
Claude Code, tanpa Orchestrator.

## Para agent

CAF membawa lima agent: `caf-planner`, `caf-frontend`, `caf-backend`, `caf-validator`,
dan `caf-reviewer`. Lihat [Layer 2: Agent Definitions](/id/docs/core-concepts/layer-2).

Lanjut ke [Quick Start](/id/docs/quick-start) untuk memasang CAF di repo kamu.
