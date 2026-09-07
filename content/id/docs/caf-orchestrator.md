---
title: CAF Orchestrator
description: Webhook receiver self-hosted (Fastify + BullMQ + Redis) yang menjalankan agent per fase.
---

CAF Orchestrator adalah service kecil yang jalan di VPS kamu sendiri. Ia menerima webhook
dari Linear atau GitHub Issues, mengantrikan job per fase, lalu spawn agent Claude Code
headless untuk menjalankan Plan, Implement, Verify, sampai membuka PR.

> Linear dan GitHub Issues sekarang dua-duanya bisa trigger pipeline. Dukungan
> Jira direncanakan tapi belum diimplementasikan — lihat
> [Jira](/id/docs/integrations/jira) untuk statusnya.

## Prasyarat

- Node.js 22 atau lebih baru
- pnpm
- Redis
- CLI `claude` tersedia di PATH, dengan definisi agent (`planner`, `frontend`,
  `backend`, `qa`, `reviewer`, `documentation`) sudah dikonfigurasi di
  `.claude/agents/` **repo target** — ini yang di-scaffold oleh
  [CAF Initiator](/id/docs/caf-initiator)

## Setup

CAF Orchestrator jalan sebagai dua proses (web server + worker) yang berbagi
Redis sebagai queue backend — bisa langsung pakai pnpm, atau lewat `Dockerfile`
+ `docker-compose.yml` yang sudah disediakan di repo.

```bash
git clone <url-repo-caf-orchestrator-kamu>
cd caf-orchestrator
pnpm install
cp .env.example .env
# isi REDIS_URL, LINEAR_WEBHOOK_SECRET, LINEAR_API_KEY, GITHUB_TOKEN,
# GITHUB_WEBHOOK_SECRET, dan salah satu dari CLAUDE_CODE_OAUTH_TOKEN atau
# openai.useOpenai di caf.config.yaml + OPENAI_API_KEY
cp caf.config.example.yaml caf.config.yaml
# isi linear.readyStateId (UUID), github.readyLabel, dan minimal satu entry
# di bawah projects: (repoCloneUrl, ticketPrefix, baseBranch)
```

Jalankan kedua proses (keduanya harus tetap jalan supaya ticket diproses):

```bash
pnpm dev            # web server
pnpm dev:worker     # worker, proses terpisah
```

Production, tanpa Docker:

```bash
pnpm build
pnpm start
pnpm start:worker
```

Production, pakai Docker (`docker-compose.yml` menyediakan service `api` +
`worker` yang berbagi container Redis dan volume `workspace`):

```bash
docker compose build
docker compose up -d
```

Setelah jalan, cek endpoint kesehatannya:

```bash
curl http://localhost:PORT/health
```

Balikin `200` dengan `{ status: "healthy", services: { redis, disk } }` kalau
koneksi Redis dan probe tulis ke `workspace.dir` dua-duanya sukses, atau `503`
dengan `status: "unhealthy"` kalau tidak.

Lihat [Environment Variables](/id/docs/reference/environment-variables) untuk daftar lengkap.

### Deploy pakai Docker

`deploy.sh` di repo membungkus siklus `git fetch && reset --hard origin/main
&& docker compose build && docker compose up -d` yang biasa dipakai buat
deploy di VPS — dipakai manual maupun dari workflow deploy CI. Flag:
`--skip-pull`, `--skip-build`, `--no-cache`, `--env <path>`. Juga prune image
dangling tiap habis deploy.

## Konfigurasi webhook

Orchestrator trigger otomatis pada salah satu transisi berikut:

- **Linear** — ticket pindah ke workflow state yang UUID-nya di-set sebagai
  `linear.readyStateId` di `caf.config.yaml` (mis. "Ready for AI")
- **GitHub Issues** — label yang cocok dengan `github.readyLabel` di
  `caf.config.yaml` (default `ready-for-ai`) dipasang ke sebuah issue

Daftarkan webhook yang sesuai, mengarah ke endpoint orchestrator:

- Linear: `https://<host-vps-kamu>/webhooks/linear`
- GitHub (trigger ticket, PR review, dan komentar `/caf-retry-pipeline` — ketiganya
  satu endpoint): `https://<host-vps-kamu>/webhooks/github`

Alurnya:

1. Ticket pindah ke state ready (Linear) atau dapat label ready (GitHub Issue)
2. Sumbernya mengirim webhook ke orchestrator
3. Orchestrator memverifikasi signature payload (`LINEAR_WEBHOOK_SECRET` atau
   secret webhook GitHub) dan dedupe berdasarkan delivery ID
4. Job pipeline masuk ke antrian BullMQ, di-routing ke entry `projects:` yang
   cocok berdasarkan prefix ticket key (Linear) atau repo (GitHub)
5. Orchestrator menjalankan rangkaian agent (planner → frontend/backend → QA →
   reviewer → docs) sebagai proses `claude --agent <name>` headless, push
   branch, lalu membuka PR GitHub

Setiap fase tetap berhenti di checkpoint human-review — orchestrator tidak
pernah merge PR sendiri. Kalau QA gagal atau reviewer memberi verdict "changes
requested", pipeline retry implementation agent sekali per gate
(`agents.qa.maxRetries` / `agents.reviewer.maxRetries`, default `1`); kalau
masih gagal, orchestrator push branch dan membuka (atau update) **Draft PR**
berisi report yang gagal, lalu berhenti dan komentar menunggu manusia.

### Resume pipeline yang berhenti (`/caf-retry-pipeline`)

Run yang gate-exhausted bukan jalan buntu. Resume dengan salah satu cara:

- Komentar `/caf-retry-pipeline` di Draft PR-nya, atau
- Pindahkan ticket Linear balik ke state ready (orchestrator mendeteksi branch
  `ai-agent/<TICKET-KEY>` sudah ada lewat GitHub API dan resume, bukan mulai
  ticket baru)

Dua path ini ketemu di logic resume yang sama persis — tidak ada yang punya
counter atau kode pemilihan gate sendiri-sendiri.

**Bagaimana state-nya bertahan antar invocation.** Tiap kali gate gagal,
orchestrator menulis `orchestration-state.json` ke `.ai/tasks/<TICKET-KEY>/`
di workspace — `orchestrationRetryCount`, `lastFailedGate`
(`implementation`/`qa`/`reviewer`), `lastKnownCommitSha`, dan judul/deskripsi
ticket (supaya resume bisa bangun ulang prompt tanpa planner tanpa perlu fetch
ulang ticket asli). Folder itu ikut ter-commit di akhir tiap run seperti
biasa, jadi file-nya ikut **di branch itu sendiri** — tetap bertahan meski
pakai mode workspace default `ephemeral` yang menghapus clone lokal setelah
tiap job. Begitu pipeline sukses penuh, file-nya dihapus; ketiadaan file itu
yang dicek trigger resume buat menolak ticket yang tidak punya apa-apa untuk
di-resume.

**Apa yang sebenarnya dilakukan resume:**

1. Sync ulang ke branch yang sudah ada (tidak pernah bikin branch baru). Untuk
   checkout mode `persistent`, dulu jalankan `git status` read-only dan
   **berhenti dengan komentar** kalau ketemu residu belum di-commit (mis. run
   sebelumnya terputus di tengah tulis) — tidak diam-diam membuang perubahan
   lokal di sini, beda dengan path sync non-retry biasa.
2. Cek budget retry: tolak dengan komentar kalau state tidak ada, atau kalau
   `orchestrationRetryCount` sudah mencapai
   `orchestration.maxOrchestrationRetries`; kalau belum, counter di-increment.
3. Kalau HEAD sudah lewat dari `lastKnownCommitSha` (manusia push commit
   selagi ticket berhenti), `git diff --stat` dari gap itu dihitung dan
   dikasih ke agent yang di-resume sebagai context tambahan — ini tidak pernah
   memblokir resume, cuma residu belum di-commit di langkah 1 yang memblokir.
4. Skip planner sepenuhnya. `lastFailedGate` menentukan report mana
   (`verify-report.md` / `qa-report.md` / `review-notes.md`) yang dibaca balik
   sebagai context, lalu re-run implementation agent dan lanjut ke tail normal
   QA → reviewer → docs → PR — kode tail yang sama persis dengan run baru,
   bukan salinan terpisah per gate.

Kalau resume-nya datang dari komentar PR, semua komentar status untuk run itu
— termasuk komentar sukses di akhir — dikirim balik ke PR itu, bukan ke ticket
Linear asli, karena itu yang sedang diperhatikan manusianya.

Tiap repo punya batas jumlah retry lintas-invocation ini —
`orchestration.maxOrchestrationRetries` di `caf.config.yaml` (default global,
override per-project di `projects.<name>.orchestration`) — setelah limit
tercapai, retry otomatis tidak ditawarkan lagi dan ticket butuh follow-up
manual sepenuhnya.

## Automated PR review

Orchestrator juga mendengarkan event PR/komentar GitHub (`/webhooks/github`)
dan bisa menjalankan `caf-reviewer` terhadap sebuah PR, komentar dikirim balik
ke PR itu. Ini terpisah dari pipeline Plan/Implement/Verify di atas dan jalan
di PR mana saja, tidak cuma yang dibuka orchestrator sendiri.

Cuma user dengan permission `write`/`maintain`/`admin` di repo (dicek live
lewat GitHub API tiap trigger) yang bisa mulai review pass; komentar user lain
diam-diam diabaikan. `ENABLE_PIPELINE_TRIGGER=false` juga mematikan ini.

Tiga trigger path, masing-masing dipetakan ke sebuah **mode** review:

| Trigger | Mode | Perilaku |
|---|---|---|
| Komentar `/caf-review` di PR | `initial` | Review penuh dari nol, tanpa context komentar sebelumnya |
| Komentar `/caf-fix-review` di PR | `global` | Re-review terhadap semua thread komentar inline + general yang ada di PR |
| Reply di dalam thread inline review-comment | `scoped` | Re-review dibatasi ke thread itu saja |

Komentar yang diposting akun bot (termasuk komentar summary orchestrator
sendiri) selalu diabaikan — tanpa guard ini, output review orchestrator sendiri
bakal trigger ulang dirinya sendiri saat delivery.

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

Routing multi-repo/multi-team sudah live: map `projects:` di `caf.config.yaml`
punya satu entry per project (`ticketPrefix`, `repoCloneUrl`, `baseBranch`,
`workspaceDir`, opsional `agents.modelOverrides` dan
`orchestration.maxOrchestrationRetries`). Ticket Linear masuk di-routing dengan
mencocokkan prefix ticket key (mis. `ABC-123` → `ABC`) ke `ticketPrefix` sebuah
project; job dari GitHub di-routing berdasarkan repo. Minimal satu project
harus dikonfigurasi — startup gagal langsung kalau `projects:` kosong.
