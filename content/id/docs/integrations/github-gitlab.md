---
title: GitHub / GitLab
description: Kredensial yang dibutuhkan CAF Orchestrator untuk membuka PR setelah checkpoint review lolos.
---

Linear dan Jira adalah sumber trigger; GitHub atau GitLab adalah tempat PR akhirnya
dibuka. Integrasi ini beda sifatnya dari webhook tracker — orchestrator butuh kredensial
dengan akses tulis ke repo, bukan sekadar menerima notifikasi.

## Kredensial yang dibutuhkan

Buat token dengan scope minimal yang diperlukan untuk push branch dan membuka PR:

- **GitHub**: fine-grained personal access token dengan scope `Contents: Read and write`
  dan `Pull requests: Read and write`, terbatas ke repo yang relevan
- **GitLab**: project access token dengan scope `write_repository` dan `api`

Simpan sebagai `GITHUB_TOKEN` atau `GITLAB_TOKEN` di `.env` orchestrator, sesuai yang
kamu pakai.

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
