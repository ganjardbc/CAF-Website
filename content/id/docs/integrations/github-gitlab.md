---
title: GitHub / GitLab
description: Kredensial yang dibutuhkan CAF Orchestrator untuk membuka PR setelah checkpoint review lolos.
---

Linear adalah sumber trigger; GitHub adalah tempat PR akhirnya dibuka.
Integrasi ini beda sifatnya dari webhook Linear — orchestrator butuh
kredensial dengan akses tulis ke repo, bukan sekadar menerima notifikasi.

> **GitLab belum didukung.** Cuma GitHub yang diimplementasikan saat ini —
> belum ada handling `GITLAB_TOKEN` di rilis saat ini. Halaman ini akan
> diperbarui begitu dukungan GitLab rilis.

## Kredensial yang dibutuhkan

Buat fine-grained personal access token GitHub dengan scope
`Contents: Read and write` dan `Pull requests: Read and write`, terbatas ke
repo yang relevan. Simpan sebagai `GITHUB_TOKEN` di `.env` orchestrator.

Kamu juga butuh `GITHUB_WEBHOOK_SECRET` kalau mau pakai fitur automated PR
review — lihat [CAF Orchestrator](/id/docs/caf-orchestrator#automated-pr-review).

## Apa yang dilakukan orchestrator dengan token ini

Setelah fase Implement selesai dan lolos [Layer 4: Quality Gates](/id/docs/core-concepts/layer-4),
orchestrator memakai token ini untuk:

1. Push branch berisi perubahan dari fase Implement
2. Membuka pull request, dengan deskripsi yang merangkum artifact dari
   [Layer 3: Artifact Handoff](/id/docs/core-concepts/layer-3)

## Orchestrator tidak pernah merge PR

Token ini sengaja tidak diberi scope untuk merge otomatis. Setelah PR dibuka, keputusan
merge tetap lewat proses review normal di GitHub/GitLab — disarankan tetap mengaktifkan
branch protection rules di repo kamu supaya kebijakan "tidak ada auto-merge" CAF juga
ditegakkan di level platform, bukan cuma di level orchestrator.
