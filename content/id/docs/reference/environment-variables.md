---
title: Environment Variables
description: Semua variabel .env yang dipakai CAF Orchestrator, dikumpulkan dalam satu halaman.
---

Referensi lengkap variabel `.env` yang disebut di halaman-halaman lain — dikumpulkan di
sini supaya kamu tidak perlu bolak-balik saat setup.

## Core

| Variabel | Wajib | Keterangan |
|---|---|---|
| `REDIS_URL` | Ya | Koneksi ke instance Redis untuk queue BullMQ |
| `CLAUDE_CODE_TOKEN` | Ya | Kredensial untuk menjalankan Claude Code headless |
| `WEBHOOK_SECRET` | Ya | Secret untuk memverifikasi payload webhook masuk dari tracker |

## Tracker

| Variabel | Wajib | Keterangan |
|---|---|---|
| `LINEAR_API_KEY` | Kalau pakai Linear | Personal API key dengan akses baca ke workspace |
| `JIRA_API_TOKEN` | Kalau pakai Jira | API token dari Account Settings → Security |
| `JIRA_EMAIL` | Kalau pakai Jira | Email akun yang membuat token di atas |
| `JIRA_BASE_URL` | Kalau pakai Jira | URL instance Jira kamu, misal `https://tim-kamu.atlassian.net` |

## Git host

| Variabel | Wajib | Keterangan |
|---|---|---|
| `GITHUB_TOKEN` | Kalau repo di GitHub | Fine-grained PAT dengan scope `Contents` dan `Pull requests` |
| `GITLAB_TOKEN` | Kalau repo di GitLab | Project access token dengan scope `write_repository` dan `api` |

Isi hanya variabel tracker dan git host yang sesuai dengan stack kamu — tidak perlu
mengisi keduanya (Linear dan Jira, atau GitHub dan GitLab) sekaligus.

Detail cara mendapatkan tiap kredensial ada di halaman masing-masing:
[CAF Orchestrator](/id/docs/caf-orchestrator), [Linear](/id/docs/integrations/linear),
[Jira](/id/docs/integrations/jira), dan [GitHub / GitLab](/id/docs/integrations/github-gitlab).
