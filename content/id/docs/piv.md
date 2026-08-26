---
title: Konsep PIV
description: Disiplin Plan, Implement, Verify yang menjadi inti CAF.
---

PIV adalah singkatan dari **Plan → Implement → Verify** — tiga fase inti
yang dijalankan agent sebelum sebuah PR dibuat.

## Plan

Agent membaca ticket, menyusun rencana kerja, dan menulis artifact
Markdown sebagai hasil fase ini. Manusia me-review rencana ini sebelum
lanjut ke Implement.

## Implement

Agent menulis kode berdasarkan plan yang sudah disetujui. Setiap
perubahan tercatat di artifact handoff, bukan hilang di context chat.

## Verify

Scanner agent (read-only) memeriksa hasil implementasi — lint, test,
review otomatis. Read-only berarti agent ini tidak bisa mengubah kode
tanpa approval gate eksplisit.

Setelah Verify lolos, checkpoint terakhir adalah **human review** sebelum
PR dibuat. Kalau QA gagal atau reviewer memberi verdict "changes requested",
pipeline retry sekali, lalu berhenti dan diserahkan ke manusia — tidak ada
eskalasi retry berulang otomatis, dan retry mengulang seluruh pipeline dari
awal (tidak ada step-resume).
