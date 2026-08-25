---
title: 'Layer 3: Artifact Handoff'
description: Kenapa CAF menyimpan hasil tiap fase sebagai file Markdown di repo, bukan di context chat.
---

Layer 3 adalah cara CAF memindahkan hasil kerja dari satu fase ke fase berikutnya —
lewat file Markdown di repo, bukan lewat context percakapan yang hilang begitu sesi
agent berakhir.

## Kenapa Markdown, bukan context chat

Context chat itu sementara: begitu sesi agent selesai atau di-restart, semua nuansa
keputusan yang diambil ikut hilang. Artifact Markdown di repo:

- Bertahan lintas sesi — agent fase berikutnya (bahkan dijalankan hari lain) tetap bisa
  membaca keputusan fase sebelumnya
- Bisa di-review manusia kapan saja, seperti membaca dokumen biasa
- Ikut ter-version di git, jadi ada jejak audit lengkap per ticket

## Struktur file per ticket

Setiap ticket punya foldernya sendiri di `.ai/tasks/<ticket-id>/`:

```
.ai/tasks/<ticket-id>/
  plan.md
  implementation-notes.md
  verify-report.md
```

| File | Ditulis oleh | Isinya |
|---|---|---|
| `plan.md` | Planner | Rencana kerja, langkah yang akan diambil |
| `implementation-notes.md` | Implementer | Perubahan yang dibuat dan alasannya |
| `verify-report.md` | Verifier | Hasil lint, test, dan temuan review otomatis |

## Alur baca-tulis antar fase

Setiap fase mengikuti pola yang sama:

1. Baca artifact dari fase sebelumnya (kalau ada) + konteks dari
   [Layer 1](/id/docs/core-concepts/layer-1) + definisi perannya sendiri dari
   [Layer 2](/id/docs/core-concepts/layer-2)
2. Kerjakan tugas sesuai scope fase
3. Tulis hasilnya sebagai artifact baru sebelum fase selesai

Reviewer (manusia) membaca seluruh rangkaian artifact ini — bukan cuma diff kode — untuk
memahami *kenapa* sebuah keputusan diambil, bukan cuma *apa* yang berubah.

## Hubungan dengan layer lain

Format artifact ditentukan oleh **Layer 2: Agent Definitions**. `verify-report.md` yang
dihasilkan di layer ini menjadi input untuk
[Layer 4: Quality Gates](/id/docs/core-concepts/layer-4).
