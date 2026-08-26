---
title: CAF Orchestrator
description: Webhook receiver self-hosted (Fastify + BullMQ + Redis) yang menjalankan agent per fase.
---

CAF Orchestrator adalah service kecil yang jalan di VPS kamu sendiri. Ia menerima webhook
dari Linear, mengantrikan job per fase, lalu spawn agent Claude Code headless untuk
menjalankan Plan, Implement, Verify, sampai membuka PR.

> Baru Linear yang terhubung sekarang. Dukungan Jira direncanakan tapi belum
> diimplementasikan — lihat [Jira](/id/docs/integrations/jira) untuk statusnya.

## Prasyarat

- Node.js 22 atau lebih baru
- pnpm
- Redis
- CLI `claude` tersedia di PATH, dengan definisi agent (`planner`, `frontend`,
  `backend`, `qa`, `reviewer`, `documentation`) sudah dikonfigurasi di
  `.claude/agents/` **repo target** — ini yang di-scaffold oleh
  [CAF Initiator](/id/docs/caf-initiator)

## Setup

CAF Orchestrator jalan sebagai dua proses Node.js (web server + worker) yang
berbagi Redis sebagai queue backend — belum ada image Docker saat ini.

```bash
git clone <url-repo-caf-orchestrator-kamu>
cd caf-orchestrator
pnpm install
cp .env.example .env
# isi REDIS_URL, LINEAR_WEBHOOK_SECRET, LINEAR_API_KEY, LINEAR_READY_STATE_ID,
# GITHUB_TOKEN, GITHUB_WEBHOOK_SECRET, dan salah satu dari CLAUDE_CODE_OAUTH_TOKEN
# atau openai.useOpenai di caf.config.yaml + OPENAI_API_KEY
cp caf.config.example.yaml caf.config.yaml
```

Jalankan kedua proses (keduanya harus tetap jalan supaya ticket diproses):

```bash
pnpm dev            # web server
pnpm dev:worker     # worker, proses terpisah
```

Production:

```bash
pnpm build
pnpm start
pnpm start:worker
```

Setelah jalan, cek endpoint kesehatannya:

```bash
curl http://localhost:PORT/healthz
```

Lihat [Environment Variables](/id/docs/reference/environment-variables) untuk daftar lengkap.

## Konfigurasi webhook (Linear)

Orchestrator trigger otomatis begitu sebuah ticket pindah ke workflow state
"Ready for AI" di Linear. Daftarkan webhook di Linear yang mengarah ke
endpoint orchestrator:

- Linear: `https://<host-vps-kamu>/webhooks/linear`
- GitHub (untuk automated PR review): `https://<host-vps-kamu>/webhooks/github`

Alurnya:

1. Ticket pindah ke state "Ready for AI" di Linear
2. Linear mengirim webhook ke orchestrator
3. Orchestrator memverifikasi signature payload dengan `LINEAR_WEBHOOK_SECRET`
4. Job pipeline masuk ke antrian BullMQ
5. Orchestrator menjalankan rangkaian agent (planner → frontend/backend → QA →
   reviewer → docs) sebagai proses `claude --agent <name>` headless, push
   branch, lalu membuka PR GitHub

Setiap fase tetap berhenti di checkpoint human-review — orchestrator tidak
pernah merge PR sendiri. Kalau QA gagal atau reviewer memberi verdict "changes
requested", pipeline retry sekali, lalu berhenti dan komentar di ticket
menunggu manusia — tidak ada step-resume (retry mengulang seluruh pipeline
dari planner).

## Automated PR review

Orchestrator juga mendengarkan event PR GitHub (`/webhooks/github`) dan bisa
menjalankan review otomatis pada PR yang ia buka, memberi komentar inline atau
general ke PR. Ini terpisah dari pipeline Plan/Implement/Verify di atas.

## Fitur opsional (default mati)

- **Bull Board dashboard** — tampilan `/admin/queues` untuk job pipeline, di
  balik basic auth. Aktifkan lewat `dashboard.enabled` di `caf.config.yaml`.
- **Notifikasi Telegram** — alert selesai/gagal pipeline. Set
  `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` bersamaan.
- **OpenRouter model routing** — route agent tertentu lewat OpenRouter,
  bukan lewat Claude Code CLI. Aktifkan lewat `openai.useOpenai` di
  `caf.config.yaml` plus `OPENAI_API_KEY`.
- **Dynamic agent skip** — Planner bisa menulis section `## Skip Agents` di
  `tasks.md` untuk skip agent yang tidak relevan buat sebuah ticket. Default
  mati, aktifkan dengan `AGENT_SKIP_ENABLED=true`.

## Multi-repo

Dukungan menjalankan satu instance orchestrator untuk banyak repo sekaligus masih dalam
roadmap dan belum tersedia di `v0.1.0`. Untuk saat ini, jalankan satu instance orchestrator
per repo. Halaman ini akan diperbarui begitu fitur multi-repo dirilis.
