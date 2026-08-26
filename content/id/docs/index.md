---
title: Introduction
description: Apa itu CAF dan bagaimana cara kerjanya.
---

CAF (Coderium Agent Framework) adalah framework orkestrasi AI agent dengan
governance ketat — dari ticket sampai PR.

Setiap task berjalan lewat siklus **Plan → Implement → Verify → PR**, dan
setiap fase punya checkpoint human-review wajib. Tidak ada auto-merge.

## Dua komponen inti

- **CAF Initiator** — CLI scaffold generator yang mendeteksi stack proyek
  kamu dan generate knowledge base yang dibutuhkan agent.
- **CAF Orchestrator** — webhook receiver (Fastify + BullMQ + Redis) yang
  jalan di VPS kamu sendiri, trigger dari perubahan status ticket di
  Linear (dukungan Jira direncanakan, belum diimplementasikan).

Lanjut ke [Quick Start](/id/docs/quick-start) untuk mulai memasang CAF di
repo kamu.
