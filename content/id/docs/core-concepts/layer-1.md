---
title: 'Layer 1: Project Knowledge Base'
description: Fondasi arsitektur CAF — konteks proyek yang dibaca setiap agent sebelum bekerja.
---

Layer 1 adalah fondasi dari lima layer arsitektur CAF. Isinya konteks tentang proyek kamu
secara spesifik — bukan pengetahuan umum tentang framework atau bahasa, tapi keputusan dan
konvensi yang berlaku di repo kamu sendiri.

## Kenapa layer ini ada

Tanpa Project Knowledge Base, setiap agent harus menebak ulang stack, struktur folder, dan
konvensi kode tiap kali dijalankan — hasilnya tidak konsisten antar ticket, dan agent bisa
mengambil keputusan yang bertentangan dengan pola yang sudah ada di repo. Layer 1
memastikan semua agent — Planner, Implementer, Verifier, Reviewer — membaca konteks yang
sama sebelum mulai bekerja.

## Apa isinya

- **Stack & tooling** — framework, package manager, versi runtime, yang dideteksi otomatis
  oleh CAF Initiator saat `scaffold`
- **Struktur folder** — konvensi penempatan file yang sudah berlaku di repo
- **Keputusan arsitektur** — batasan atau pola yang sengaja dipilih (misalnya "semua state
  management pakai X, bukan Y")
- **Standar kode yang ada** — aturan linter/formatter, konvensi penamaan yang sudah dipakai

## Di mana file ini hidup

CAF Initiator men-generate knowledge base ini sebagai `CLAUDE.md`/`AGENTS.md` di root
repo saat kamu menjalankan `caf-init scaffold`. File-file ini bisa diedit manual kapan
saja — CAF Initiator tidak pernah menimpa file yang sudah ada di run berikutnya.

## Hubungan dengan layer lain

Layer 1 adalah input untuk [Layer 2: Agent Definitions](/id/docs/core-concepts/layer-2) —
setiap definisi agent di
`.claude/agents/` mengacu balik ke `CLAUDE.md`/`AGENTS.md` supaya perilaku tiap role tetap
selaras dengan konteks proyek yang sama.
