---
title: GitHub / GitLab
description: Bagaimana CAF Orchestrator memakai GitHub — tempat PR dibuka, sumber ticket, dan AI PR review.
---

GitHub punya tiga peran bagi CAF Orchestrator: tempat setiap PR dibuka, bisa jadi
sumber ticket (GitHub Issues), dan comment PR-nya menggerakkan AI review serta
resume pipeline.

> **GitLab belum didukung.** Saat ini hanya GitHub yang diimplementasikan — tidak
> ada penanganan `GITLAB_TOKEN` di rilis saat ini. Halaman ini akan diperbarui
> begitu dukungan GitLab dirilis.

## Credential yang dibutuhkan

Dua-duanya wajib di `.env` Orchestrator:

- `GITHUB_TOKEN` — fine-grained personal access token yang dibatasi ke repo terkait,
  dengan `Contents: Read and write` dan `Pull requests: Read and write`. Tambahkan
  `Issues: Read and write` kalau kamu memicu dari GitHub Issues, supaya Orchestrator
  bisa memberi comment di sana.
- `GITHUB_WEBHOOK_SECRET` — secret yang kamu set di webhook repo.

## Daftarkan webhook

Di tiap repo target, lewat **Settings → Webhooks**, tambahkan:

- Payload URL: `https://<host-vps-kamu>/webhooks/github`
- Content type: `application/json`
- Secret: nilai yang sama dengan `GITHUB_WEBHOOK_SECRET`
- Events: `Issues`, `Issue comments`, `Pull request review comments`

## GitHub Issues sebagai sumber ticket

Pasang label yang di-set di `github.readyLabel` (default `ready-for-ai`) ke sebuah
issue dan pipeline penuh jalan untuknya. Project dicocokkan berdasarkan repository
(`repoCloneUrl` tiap project), dan ticket key-nya jadi
`<ticketPrefix>-<nomor issue>`. Hasilnya diposting balik sebagai comment di issue.

Bila spec Planner punya pertanyaan `BLOCKING` yang terbuka, pipeline berhenti dan
menanyakannya lewat comment di issue (diawali `❓ CAF-CLARIFY`). Jawab lewat comment,
lalu hapus dan pasang lagi label ready untuk melanjutkan. Issue yang juga membawa label
`github.specGateLabel` (default `spec-approval`) berhenti di Draft PR berisi spec sampai
seseorang berkomentar `/caf-approve-spec` di sana. Lihat
[CAF Orchestrator](/id/docs/caf-orchestrator#clarify-dan-spec-gate).

## Command lewat comment PR

Di PR yang dibuka pipeline ini (head branch `ai-agent/<TICKET-KEY>`):

| Comment | Fungsinya |
|---|---|
| `/caf-retry-pipeline` | Melanjutkan pipeline yang berhenti di sebuah gate (di Draft PR-nya) |
| `/caf-approve-spec` | Menyetujui spec di Draft PR spec gate dan melanjutkan ke implementasi |
| `/caf-review` | Menjalankan AI review penuh dan mempostingnya sebagai GitHub PR review |
| `/caf-fix-review` | Reviewer menangani semua comment review di PR |
| Reply di inline review thread | Reviewer menangani satu thread itu |

Hanya user dengan permission `write`, `maintain`, atau `admin` di repo yang bisa
memicu ini (dan label issue); permission dicek live di setiap trigger. Comment dari
akun bot diabaikan. Lihat
[CAF Orchestrator](/id/docs/caf-orchestrator#pr-review-otomatis).

## Apa yang dilakukan Orchestrator dengan token ini

1. Clone repo dan push branch `ai-agent/<TICKET-KEY>`
2. Membuka pull request setelah
   [quality gate Layer 4](/id/docs/core-concepts/layer-4) lolos — atau **Draft PR**
   berisi report yang gagal kalau sebuah gate habis, atau berisi spec bila spec gate
   berlaku. Run lanjutan yang akhirnya sukses menandai PR itu Ready for review
3. Memposting comment, reply, dan PR review

Token tidak pernah ditulis ke workspace: tiap perintah jaringan git mengautentikasi
dengan header per-proses, jadi token tidak ada di URL remote maupun `.git/config`. Ini
butuh `git` 2.31 atau lebih baru di host Orchestrator.

## Orchestrator tidak pernah me-merge PR

Orchestrator tidak punya langkah merge. Setelah PR terbuka, keputusan merge tetap
lewat proses review normal kamu di GitHub — kami sarankan tetap mengaktifkan branch
protection rule di repo supaya kebijakan "no auto-merge" CAF juga di-enforce di level
platform, bukan cuma oleh Orchestrator.
