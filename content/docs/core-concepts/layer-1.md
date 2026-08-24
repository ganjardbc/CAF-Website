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
  oleh CAF Initiator saat `init`
- **Struktur folder** — konvensi penempatan file yang sudah berlaku di repo
- **Keputusan arsitektur** — batasan atau pola yang sengaja dipilih (misalnya "semua state
  management pakai X, bukan Y")
- **Standar kode yang ada** — aturan linter/formatter, konvensi penamaan yang sudah dipakai

## Di mana file ini hidup

CAF Initiator men-generate knowledge base ini sebagai `.claude/PROJECT.md` saat kamu
menjalankan `caf-initiator init`. File ini bisa diedit manual kapan saja — CAF tidak
menimpanya otomatis di run berikutnya kecuali kamu memintanya lewat `caf-initiator export`.

## Hubungan dengan layer lain

Layer 1 adalah input untuk **Layer 2: Agent Definitions** — setiap definisi agent di
`.claude/agents/` mengacu balik ke `PROJECT.md` supaya perilaku tiap role tetap selaras
dengan konteks proyek yang sama.
