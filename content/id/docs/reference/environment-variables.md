---
title: Environment Variables
description: Semua variabel .env yang dipakai CAF Orchestrator, dikumpulkan dalam satu halaman.
---

Referensi lengkap variabel `.env` yang disebut di halaman-halaman lain — dikumpulkan di
sini supaya kamu tidak perlu bolak-balik saat setup. Konfigurasi struktural
(non-secret) — port server, retry agent, dashboard, OpenRouter routing — ada di
`caf.config.yaml`, bukan di sini; copy dari `caf.config.example.yaml`.

## Core

| Variabel | Wajib | Keterangan |
|---|---|---|
| `REDIS_URL` | Ya | Koneksi ke instance Redis untuk queue BullMQ |
| `LINEAR_WEBHOOK_SECRET` | Ya | Secret untuk memverifikasi payload webhook Linear masuk |
| `LINEAR_API_KEY` | Ya | Personal API key dengan akses baca ke workspace Linear kamu |
| `LINEAR_READY_STATE_ID` | Ya | UUID workflow state Linear yang men-trigger pipeline (state "Ready for AI" kamu) |

## Git host

| Variabel | Wajib | Keterangan |
|---|---|---|
| `GITHUB_TOKEN` | Ya | Fine-grained PAT dengan scope `Contents` dan `Pull requests`, dipakai untuk push branch dan buka PR |
| `GITHUB_WEBHOOK_SECRET` | Ya, untuk automated PR review | Secret untuk memverifikasi payload webhook GitHub masuk (`/webhooks/github`) |

## Auth Claude Code / model

Salah satu dari berikut wajib diisi, kalau tidak orchestrator gagal start:

| Variabel | Keterangan |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | Auth native Claude Code CLI, diteruskan apa adanya ke agent yang di-spawn |
| `OPENAI_API_KEY` | Wajib kalau `openai.useOpenai` di `caf.config.yaml` bernilai `true` — route agent lewat OpenRouter |

## Feature flags

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `ENABLE_PIPELINE_TRIGGER` | Tidak | `true` | Saklar utama apakah webhook masuk men-trigger pipeline run |
| `AGENT_SKIP_ENABLED` | Tidak | `false` | Menghormati section `## Skip Agents` di `tasks.md` untuk skip agent yang tidak relevan |

## Opsional

| Variabel | Wajib | Keterangan |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Keduanya bersamaan, atau tidak sama sekali | Notifikasi selesai/gagal pipeline |
| `DASHBOARD_BASIC_AUTH_PASSWORD` | Kalau `dashboard.enabled: true` di `caf.config.yaml` | Password basic-auth untuk dashboard Bull Board di `/admin/queues` |

## Belum tersedia

Jira dan GitLab masih di roadmap, belum diimplementasikan — belum ada
variabel `JIRA_*` atau `GITLAB_TOKEN` saat ini. Lihat
[Jira](/id/docs/integrations/jira) dan
[GitHub / GitLab](/id/docs/integrations/github-gitlab) untuk status terkini.

Detail cara mendapatkan tiap kredensial ada di halaman masing-masing:
[CAF Orchestrator](/id/docs/caf-orchestrator) dan [Linear](/id/docs/integrations/linear).
