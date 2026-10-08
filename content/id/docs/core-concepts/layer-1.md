---
title: 'Layer 1: Project Knowledge Base'
description: Fondasi arsitektur CAF — konteks proyek yang dibaca setiap agent sebelum bertindak.
---

Layer 1 adalah fondasi dari arsitektur lima layer CAF. Isinya konteks tentang
proyek kamu secara spesifik — bukan pengetahuan umum soal framework atau bahasa,
tapi keputusan dan konvensi yang berlaku di repo kamu sendiri.

## Kenapa layer ini ada

Tanpa Project Knowledge Base, setiap agent harus menebak ulang stack, struktur
folder, dan konvensi kode kamu tiap kali jalan — hasilnya tidak konsisten antar
ticket, dan agent bisa membuat keputusan yang bertentangan dengan pola yang sudah
ada di repo. Layer 1 memastikan setiap agent — Planner, agent implementasi, QA,
Reviewer — membaca konteks yang sama sebelum mulai bekerja.

## Apa isinya

- **Stack & tooling** — repo mode (monorepo atau single repo), daftar app,
  framework per app, package manager, database, dan ticket tracker, dideteksi CAF
  Initiator saat `scaffold`
- **Verification command** — script lint, typecheck, test, dan build yang
  benar-benar ada di `package.json`
- **Golden examples** — file yang kamu pilih sebagai acuan bentuk kode yang benar
- **Keputusan arsitektur** — draft ADR untuk pilihan teknis yang sudah terlihat di
  repo
- **Konvensi kode dan konteks bisnis** — ditulis oleh kamu; CAF Initiator tidak
  pernah mengarangnya

## Di mana file-file ini berada

```
CLAUDE.md                        # konteks proyek untuk agent
AGENTS.md                        # aturan konkret untuk agent
.caf/knowledge/
  INDEX.md                       # status reference docs opsional
  golden-examples/               # RULES.md yang menunjuk file terbaik kamu
  decisions/                     # draft ADR
docs/                            # reference docs opsional (caf-init docs)
```

`caf-init scaffold` men-generate semuanya sebagai **draft**. CAF Initiator tidak
pernah memanggil model AI: apa pun yang tidak terdeteksi dibiarkan sebagai `TODO`,
tidak pernah ditebak. Isi `TODO` itu secara manual, atau jalankan command
`/caf-complete-drafts` di AI runner kamu — ia hanya mengambil fakta dari kode dan
bertanya ke kamu untuk bagian milik manusia (konteks bisnis, alasan ADR, pilihan
golden example). Setelah itu cek hasilnya dengan `caf-init curate --check-drafts`.

File-file ini bisa diedit kapan saja — CAF Initiator tidak pernah menimpa file yang
sudah ada di run berikutnya.

## Hubungan dengan layer lain

Layer 1 adalah input untuk [Layer 2: Agent Definitions](/id/docs/core-concepts/layer-2) —
setiap definisi agent di `.claude/agents/` merujuk balik ke `CLAUDE.md`/`AGENTS.md`
supaya perilaku tiap role tetap selaras dengan konteks proyek yang sama.
