---
title: Environment Variables
description: Semua variabel .env yang dipakai CAF Orchestrator, dikumpulkan di satu halaman.
---

Referensi lengkap variabel `.env` yang dipakai CAF Orchestrator — secret dan toggle
operasional. Config struktural (non-secret) ada di `caf.config.yaml`; salin dari
`caf.config.example.yaml`. Lihat
[Config struktural](#config-struktural-cafconfigyaml) di bawah untuk field yang
paling sering dicari di sini.

CAF Initiator tidak butuh environment variable.

## Core

| Variable | Wajib | Deskripsi |
|---|---|---|
| `REDIS_URL` | Ya | Koneksi ke instance Redis yang dipakai queue BullMQ |
| `LINEAR_WEBHOOK_SECRET` | Ya | Secret untuk memverifikasi payload webhook Linear yang masuk |
| `LINEAR_API_KEY` | Ya | API key Linear, dipakai untuk membaca ticket dan memposting comment |

## Git host

| Variable | Wajib | Deskripsi |
|---|---|---|
| `GITHUB_TOKEN` | Ya | Fine-grained PAT untuk push branch, membuka PR, dan memposting comment/review. Tidak pernah ditulis ke workspace; dikirim ke git per perintah lewat header environment (butuh `git` 2.31+) |
| `GITHUB_WEBHOOK_SECRET` | Ya | Secret untuk memverifikasi payload webhook GitHub yang masuk (`/webhooks/github`) |

## Claude Code / model auth

Salah satu dari berikut ini wajib, kalau tidak Orchestrator gagal start:

| Variable | Deskripsi |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | Auth native Claude Code CLI, diteruskan apa adanya ke agent yang di-spawn. Dipakai kalau `openai.useOpenai` bernilai `false` (default) |
| `OPENAI_API_KEY` | Wajib kalau `openai.useOpenai` di `caf.config.yaml` bernilai `true` — mengarahkan agent lewat endpoint kompatibel-Anthropic (default OpenRouter) |

## Feature flags

| Variable | Wajib | Default | Deskripsi |
|---|---|---|---|
| `ENABLE_PIPELINE_TRIGGER` | Tidak | `true` | Kill switch untuk semua trigger webhook (pipeline ticket, resume, dan PR review) |
| `AGENT_SKIP_ENABLED` | Tidak | `false` | Menghormati section `## Skip Agents` di `tasks.md` untuk melewati agent yang tidak relevan bagi sebuah ticket |

Nilai yang diterima: `true`, `false`, `1`, `0`.

## Opsional

| Variable | Wajib | Deskripsi |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Dua-duanya, atau tidak sama sekali | Notifikasi pipeline mulai/selesai/gagal |
| `DASHBOARD_BASIC_AUTH_PASSWORD` | Kalau `dashboard.enabled: true` di `caf.config.yaml` | Password untuk halaman login dashboard di `/dashboard/login` |
| `DASHBOARD_DEFAULT_VIEW` | Tidak | Isi `/dashboard`: `dashboard` (default) atau `agent-floor` |
| `TUNNEL_NAME`, `TUNNEL_URL`, `TUNNEL_TARGET_URL`, `CLOUDFLARED_BIN` | Tidak | Cloudflare tunnel untuk `pnpm tunnel` dan [Terminal UI](/id/docs/caf-orchestrator#cloudflare-tunnel): nama tunnel, hostname `https://` publik, origin lokal yang diekspos, dan binary `cloudflared` |
| `NODE_ENV`, `LOG_LEVEL` | Tidak | Environment runtime dan tingkat log |

`CAF_HEADLESS` **tidak** bisa dikonfigurasi: Orchestrator selalu men-set-nya ke `1`
di setiap agent yang di-spawn. Jangan taruh di `.env`.

`caf-validator` berjalan tanpa `REDIS_URL`, `LINEAR_WEBHOOK_SECRET`, `LINEAR_API_KEY`,
`GITHUB_TOKEN`, `GITHUB_WEBHOOK_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, dan
`DASHBOARD_BASIC_AUTH_PASSWORD` di environment-nya (lihat
[Validator terbatas](/id/docs/caf-orchestrator#validator-terbatas)).

## Config struktural (`caf.config.yaml`)

Ini bukan environment variable:

| Field | Wajib | Deskripsi |
|---|---|---|
| `linear.readyStateId` | Ya | UUID workflow state Linear yang memicu pipeline (state "Ready for AI" kamu) |
| `projects:` | Ya, minimal satu | `ticketPrefix`, `repoCloneUrl`, `baseBranch`, `workspaceDir` per project |
| `github.readyLabel` | Tidak (default `ready-for-ai`) | Label yang memicu pipeline dari GitHub Issue |
| `linear.specGateLabel` / `github.specGateLabel` | Tidak (default `spec-approval`) | Label yang menghentikan ticket di Draft PR persetujuan spec; bisa di-override per project |
| `agents.validator.restrictBash` / `agents.validator.allowedCommands` | Tidak (default `true` / allowlist `pnpm` dan `npm`) | Membatasi apa yang boleh dijalankan `caf-validator` |
| `server.port` | Tidak (default `3000` di contoh config; setup Docker memakai `3030`) | Port web server |
| `dashboard.enabled` / `dashboard.basicAuthUser` | Tidak | Mengaktifkan dashboard dan menentukan username-nya |

Lihat [CAF Orchestrator](/id/docs/caf-orchestrator#konfigurasi) untuk sisanya.

## Belum tersedia

Jira dan GitLab ada di roadmap tapi belum diimplementasikan — belum ada variabel
`JIRA_*` atau `GITLAB_TOKEN` saat ini. Lihat [Jira](/id/docs/integrations/jira) dan
[GitHub / GitLab](/id/docs/integrations/github-gitlab) untuk status terkini.

Detail cara mendapatkan tiap credential ada di halaman masing-masing:
[Linear](/id/docs/integrations/linear) dan
[GitHub / GitLab](/id/docs/integrations/github-gitlab).
