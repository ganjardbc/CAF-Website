---
title: 'Layer 4: Quality Gates'
description: Dua jenis gate yang harus dilewati sebelum sebuah PR bisa dibuat atau digabungkan.
---

Layer 4 adalah mekanisme yang memutuskan apakah hasil kerja sebuah fase cukup layak untuk
lanjut ke fase berikutnya. Ada dua jenis gate, dan keduanya wajib — tidak bisa dilewati.

## Dua jenis gate

### Gate otomatis (Verifier)

Dijalankan oleh agent Verifier yang read-only: lint, test, dan review otomatis terhadap
hasil Implement. Read-only di sini bukan detail teknis semata — itu jaminan bahwa proses
pengecekan kualitas tidak bisa diam-diam "memperbaiki" kode tanpa jejak, karena Verifier
memang tidak punya akses tulis. Hasilnya dicatat sebagai `verify-report.md` di
[Layer 3: Artifact Handoff](/docs/core-concepts/layer-3).

### Gate manusia

Setelah gate otomatis lolos, checkpoint terakhir sebelum PR dibuat atau digabungkan adalah
approval eksplisit dari manusia. Ini gate yang tidak bisa diotomatisasi sama sekali — CAF
tidak menyediakan opsi untuk melewatinya.

## Kenapa dua-duanya wajib

Gate otomatis menangkap masalah yang bisa dideteksi mesin — lint error, test gagal, pola
kode yang berisiko. Tapi tidak semua keputusan bisa direduksi ke aturan otomatis:
konteks bisnis, trade-off arsitektur, atau risiko yang cuma terlihat oleh orang yang paham
proyeknya. Gate manusia menutup celah itu.

## Kebijakan retry

Kalau gate otomatis gagal, agent boleh mencoba ulang fase tersebut — maksimal 3x. Setelah
3 percobaan tetap gagal, CAF berhenti dan mengeskalasi ke manusia alih-alih terus mencoba
tanpa arah.

## Tidak ada auto-merge

Ini konsekuensi langsung dari Layer 4: tidak ada jalur apa pun — betapapun bagus hasil gate
otomatis — yang bisa membuat PR ter-merge tanpa approval manusia. Governance ini yang
membedakan CAF dari orkestrator agent yang mengejar kecepatan lewat auto-merge.

## Hubungan dengan layer lain

Layer 4 mengonsumsi `verify-report.md` dari **Layer 3**, dan hasil keputusan gate-nya
menentukan apakah **Layer 5: Orchestration** boleh melanjutkan pipeline ke fase berikutnya
atau berhenti menunggu manusia.
