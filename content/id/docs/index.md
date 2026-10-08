---
title: Introduction
description: Apa itu CAF dan bagaimana cara kerjanya.
---

CAF (Coderium Agent Framework) menjalankan AI agent sebagai satu tim engineering
yang membawa ticket dari plan sampai pull request, dengan governance ketat di
sepanjang jalan.

Setiap task berjalan lewat siklus **Plan → Implement → Verify → PR**. Gate yang
gagal menghentikan pipeline dan menyerahkan pekerjaan ke manusia, dan tidak ada yang
pernah di-merge otomatis.

## Dua komponen inti

- **CAF Initiator** — CLI `caf-init`. Mendeteksi stack, package manager, dan ticket
  tracker repo kamu, lalu menulis file awal CAF: knowledge base, definisi agent,
  dokumen workflow, slash command, dan skill. Tidak pernah memanggil model AI; apa
  pun yang tidak terdeteksi dibiarkan sebagai `TODO`.
- **CAF Orchestrator** — webhook receiver (Fastify + BullMQ + Redis) yang jalan di
  VPS kamu sendiri. Begitu ticket siap — workflow state di Linear atau label di
  GitHub Issue — ia menjalankan agent secara berurutan dan membuka pull request.
  Dukungan Jira direncanakan, belum diimplementasikan.

CAF Initiator bisa dipakai sendiri: agent yang di-generate juga bisa jalan langsung
di Claude Code, tanpa Orchestrator.

Lanjut ke [Quick Start](/id/docs/quick-start) untuk mulai memasang CAF di
repo kamu.
