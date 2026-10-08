---
title: CAF Orchestrator
description: Webhook receiver self-hosted (Fastify + BullMQ + Redis) yang menjalankan pipeline agent dari ticket sampai PR.
---

CAF Orchestrator adalah service kecil yang jalan di VPS kamu sendiri. Begitu ticket
jadi "Ready for AI", ia clone repo target, menjalankan rantai proses
`claude --agent <name>` headless (`caf-planner` → `caf-frontend` / `caf-backend` →
`caf-qa` → `caf-reviewer` → `caf-documentation`), push branch
`ai-agent/<TICKET-KEY>`, membuka PR di GitHub, lalu melaporkan hasilnya ke ticket.

Ia juga menjalankan AI review pada PR yang sudah ada, dipicu comment di PR.

> Linear dan GitHub Issues sama-sama bisa memicu pipeline saat ini. Dukungan Jira
> direncanakan tapi belum diimplementasikan — lihat [Jira](/id/docs/integrations/jira).
> Source: [github.com/coderiumid/caf-orchestrator](https://github.com/coderiumid/caf-orchestrator).

## Apa yang memicunya

| Trigger | Di mana | Hasil |
|---|---|---|
| Ticket Linear pindah ke state `linear.readyStateId` | `POST /webhooks/linear` | Pipeline agent penuh |
| GitHub Issue mendapat label `github.readyLabel` (default `ready-for-ai`) | `POST /webhooks/github` | Pipeline agent penuh |
| Comment `/caf-retry-pipeline` di Draft PR, atau ticket Linear masuk lagi ke "Ready for AI" saat branch-nya masih ada | salah satu webhook | Melanjutkan pipeline yang berhenti di sebuah gate |
| Comment `/caf-review` di PR | `POST /webhooks/github` | Review penuh, diposting sebagai GitHub PR review |
| Comment `/caf-fix-review` di PR | `POST /webhooks/github` | Reviewer menangani semua comment review di PR |
| Reply di dalam inline review thread | `POST /webhooks/github` | Reviewer menangani satu thread itu |

Trigger dari sisi GitHub mensyaratkan pemberi comment atau label punya permission
`write`, `maintain`, atau `admin` di repo; selain itu diabaikan diam-diam. Trigger
lewat comment PR hanya berlaku di PR yang dihasilkan pipeline ini (head branch
`ai-agent/<TICKET-KEY>`). `ENABLE_PIPELINE_TRIGGER=false` adalah kill switch untuk
semuanya.

## Requirements

- Node.js 22 atau lebih baru
- pnpm
- Redis
- `git`, dengan akses push ke repo target
- CLI `claude` tersedia di PATH, dengan definisi agent (`caf-planner`,
  `caf-frontend`, `caf-backend`, `caf-qa`, `caf-reviewer`, `caf-documentation`) ada
  di `.claude/agents/` **repo target** — inilah yang di-scaffold
  [CAF Initiator](/id/docs/caf-initiator). Orchestrator hanya tahu namanya dan
  memanggilnya

## Setup

CAF Orchestrator jalan sebagai dua proses yang berbagi Redis sebagai backend queue:

- **Web server** — menerima dan memvalidasi webhook Linear/GitHub, memasukkan job ke
  antrian, dan menyajikan dashboard monitoring.
- **Worker** — mengambil job dari antrian dan menjalankannya: `agent-pipeline`
  (ticket → PR) dan `pr-review` (comment PR → review).

Dua-duanya harus jalan supaya ada yang diproses — web server saja hanya menerima
webhook.

```bash
git clone https://github.com/coderiumid/caf-orchestrator.git
cd caf-orchestrator
pnpm install
cp .env.example .env                           # secret dan toggle operasional
cp caf.config.example.yaml caf.config.yaml     # config struktural
```

Isi kedua file (lihat [Konfigurasi](#konfigurasi)), lalu jalankan dua prosesnya:

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

Production, dengan Docker (`docker-compose.yml` menjalankan `redis`, `api`, dan
`worker` dari satu image):

```bash
docker compose build
docker compose up -d
```

Setelah jalan, cek endpoint health-nya:

```bash
curl http://localhost:PORT/health
```

Mengembalikan `200` dengan `{ status: "healthy", services: { redis, disk } }` kalau
koneksi Redis dan write probe ke `workspace.dir` sama-sama berhasil, atau `503`
dengan `status: "unhealthy"` kalau tidak.

### Deploy dengan Docker

`deploy.sh` di repo melakukan pull `origin/main`, rebuild image, dan restart service
— bisa dijalankan manual maupun dari CI. Flag-nya antara lain `--skip-pull` dan
`--skip-build`. Workflow GitHub Actions bawaan menjalankan typecheck, lint, test,
dan build di setiap push dan PR, lalu memanggil `deploy.sh` di VPS lewat SSH untuk
push ke `main`.

## Konfigurasi

Config dibagi ke dua file, dua-duanya divalidasi saat startup — config yang tidak
valid atau tidak lengkap langsung gagal.

### `.env` — secret dan toggle operasional

Lihat [Environment Variables](/id/docs/reference/environment-variables) untuk daftar
lengkap. Wajib: `REDIS_URL`, `LINEAR_WEBHOOK_SECRET`, `LINEAR_API_KEY`,
`GITHUB_TOKEN`, `GITHUB_WEBHOOK_SECRET`, dan satu jalur auth Claude Code
(`CLAUDE_CODE_OAUTH_TOKEN`, atau `OPENAI_API_KEY` bersama `openai.useOpenai: true`).

### `caf.config.yaml` — config struktural

`caf.config.example.yaml` memuat semua field beserta default-nya. Yang wajib kamu
isi:

- `linear.readyStateId` — UUID workflow state "Ready for AI".
- `projects:` — minimal satu entry. Tiap project punya `ticketPrefix` (mis. `ABC`
  untuk `ABC-123`), `repoCloneUrl`, `baseBranch`, dan `workspaceDir` absolut.

Yang sering diatur:

| Field | Yang dikontrol | Default |
|---|---|---|
| `github.readyLabel` | Label yang membuat GitHub Issue jadi "Ready for AI" | `ready-for-ai` |
| `workspace.mode` | `ephemeral` (clone baru per job) atau `persistent` (pakai ulang satu checkout per repo) | `ephemeral` |
| `agents.qa.maxRetries` / `agents.reviewer.maxRetries` | Retry gate dalam satu run | masing-masing `1` |
| `orchestration.maxOrchestrationRetries` | Berapa kali ticket yang gate-nya habis bisa di-resume; bisa di-override per project | `2` |
| `claude.agentTimeoutMs` | Timeout per proses agent | 30 menit |
| `queue.workerConcurrency` | Job pipeline bersamaan per worker | `1` |
| `queue.jobAttempts` | Retry seluruh job setelah kegagalan tak terduga | `3` |
| `openai.*`, `agents.modelOverrides` | Model routing (lihat di bawah) | mati |
| `dashboard.enabled`, `dashboard.basicAuthUser`, `db.path` | Dashboard monitoring | mati |

## Konfigurasi webhook

Daftarkan webhook yang mengarah ke Orchestrator:

- **Linear** — `https://<host-vps-kamu>/webhooks/linear`, secret =
  `LINEAR_WEBHOOK_SECRET`. Lihat [Linear](/id/docs/integrations/linear).
- **GitHub** (per repo target) — `https://<host-vps-kamu>/webhooks/github`, secret =
  `GITHUB_WEBHOOK_SECRET`, event `Issues`, `Issue comments`, dan
  `Pull request review comments`. Lihat
  [GitHub / GitLab](/id/docs/integrations/github-gitlab).

Signature tiap payload diverifikasi, dan delivery di-dedupe berdasarkan delivery ID.

## Pipeline

1. Clone repo target ke workspace project dan buat branch `ai-agent/<TICKET-KEY>`.
   Ticket Linear di-routing ke project berdasarkan prefix ticket, GitHub Issue
   berdasarkan repository.
2. Jalankan `caf-planner`, yang wajib menghasilkan
   `.caf/tasks/<TICKET-KEY>/tasks.md`.
3. Baca `tasks.md`: header `## Frontend Tasks` / `## Backend Tasks` menentukan agent
   implementasi mana yang jalan (`caf-frontend`, lalu `caf-backend`).
4. Jalankan agent implementasi, lalu baca `verify-report.md`.
5. Jalankan `caf-qa` → `qa-report.md`. Kalau `FAIL`, jalankan ulang implementasi
   sampai `agents.qa.maxRetries` kali.
6. Jalankan `caf-reviewer` → `review-notes.md`. Kalau `CHANGES REQUESTED`, jalankan
   ulang implementasi sampai `agents.reviewer.maxRetries` kali.
7. Kalau `tasks.md` punya `## Docs Tasks` yang berisi, jalankan `caf-documentation`.
   Kegagalan docs tidak pernah menggagalkan job.
8. Commit, push, buka PR di GitHub, dan posting comment akhir (link PR plus report QA
   dan reviewer) di ticket Linear atau GitHub Issue.

Orchestrator tidak pernah me-merge PR sendiri.

### Kalau sebuah gate habis

Kalau sebuah gate (implementation verify, QA, atau reviewer) masih gagal setelah
retry-nya habis, pekerjaan tidak dibiarkan terdampar: branch di-push dan **Draft PR**
dibuka — atau diperbarui, kalau sudah ada yang terbuka — dengan report yang gagal
sebagai body-nya. Pipeline lalu berhenti dan memberi comment untuk manusia, yang bisa
memperbaiki manual atau me-resume.

### Kegagalan yang bukan gate

- Agent crash atau timeout mengulang seluruh job dari Planner, sampai
  `queue.jobAttempts` kali.
- `429` (kuota API habis) atau `404` (model tidak ditemukan) dari agent menghentikan
  pipeline dengan rapi lewat comment, bukan retry — mengulangnya hanya akan gagal
  dengan cara yang sama.

### Melanjutkan pipeline yang berhenti (`/caf-retry-pipeline`)

Run yang gate-nya habis bukan jalan buntu. Lanjutkan dengan salah satu cara:

- Comment `/caf-retry-pipeline` di Draft PR, atau
- Pindahkan ticket Linear kembali ke ready state (Orchestrator mendeteksi branch
  `ai-agent/<TICKET-KEY>` sudah ada lewat GitHub API dan me-resume, bukan memulai
  ticket baru)

Kedua jalur berujung di logika resume yang sama — tidak ada yang punya counter atau
kode pemilihan gate sendiri.

**Bagaimana state bertahan antar invocation.** Setiap gate gagal, Orchestrator
menulis `orchestration-state.json` ke `.caf/tasks/<TICKET-KEY>/` di workspace —
`orchestrationRetryCount`, `lastFailedGate` (`implementation`/`qa`/`reviewer`),
`lastKnownCommitSha`, dan judul/deskripsi ticket (supaya resume bisa menyusun ulang
prompt tanpa planner tanpa mengambil ulang ticket aslinya). Folder itu ikut dalam
commit-and-push normal di akhir setiap run, jadi file-nya ikut **di branch itu
sendiri** — tetap bertahan walau pakai workspace mode default `ephemeral`, yang
menghapus clone lokal setelah tiap job. Saat pipeline sukses penuh, file ini
dihapus; ketiadaannya yang dicek trigger resume untuk menolak ticket yang tidak
punya apa pun untuk dilanjutkan.

**Apa yang sebenarnya dilakukan resume:**

1. Memastikan branch masih ada di remote. Retry yang dipicu setelah PR di-merge dan
   branch-nya dihapus berhenti dengan comment; tidak pernah fallback ke checkout
   baru.
2. Sync ulang ke branch yang sudah ada (tidak pernah membuat branch baru). Untuk
   checkout mode `persistent`, ia lebih dulu menjalankan `git status` read-only dan
   **berhenti dengan comment** kalau menemukan sisa perubahan yang belum di-commit
   (mis. run sebelumnya terputus di tengah penulisan) — di sini perubahan lokal
   tidak dibuang diam-diam, berbeda dengan jalur sync normal non-retry.
3. Mengecek jatah retry: menolak dengan comment kalau tidak ada state, atau kalau
   `orchestrationRetryCount` sudah mencapai
   `orchestration.maxOrchestrationRetries`; kalau tidak, counter dinaikkan.
4. Kalau HEAD sudah bergerak melewati `lastKnownCommitSha` (manusia push commit saat
   ticket berhenti), `git diff --stat` untuk selisih itu dihitung dan diberikan ke
   agent yang di-resume sebagai konteks tambahan — ini tidak pernah memblokir
   resume, hanya sisa uncommitted di langkah 2 yang memblokir.
5. Melewati planner sepenuhnya. `lastFailedGate` menentukan report mana
   (`verify-report.md` / `qa-report.md` / `review-notes.md`) yang dibaca ulang
   sebagai konteks, lalu agent implementasi dijalankan ulang dan lanjut lewat ekor
   normal QA → reviewer → docs → PR — kode ekor yang persis sama dengan run baru,
   bukan salinan terpisah per gate.

Kalau resume datang dari comment PR, semua comment status untuk run itu — termasuk
comment sukses di akhir — dikirim ke PR tersebut, bukan ke ticket asalnya, karena
itulah yang sedang dipantau manusia.

## PR review otomatis

Orchestrator bisa menjalankan `caf-reviewer` terhadap sebuah PR sebagai respons atas
comment di PR. Ini job terpisah dari pipeline ticket di atas. Hanya berlaku di PR
yang head branch-nya `ai-agent/<TICKET-KEY>` — yang dibuka pipeline ini.

Tiga jalur trigger, masing-masing dipetakan ke satu **mode** review:

| Trigger | Mode | Perilaku |
|---|---|---|
| Comment `/caf-review` di PR | `initial` | Review penuh dari nol. Verdict diposting sebagai GitHub PR review sungguhan; kalau GitHub menolaknya sebagai self-review, diposting ulang sebagai comment dengan verdict disebut di body |
| Comment `/caf-fix-review` di PR | `global` | Reviewer menangani semua comment inline dan umum yang ada, membalas satu per satu, lalu memposting ringkasan |
| Reply di dalam thread inline review-comment | `scoped` | Sama, tapi hanya untuk satu thread itu |

Di mode `global` dan `scoped`, tiap comment berakhir `FIXED`, `SKIPPED`, atau
`NOT_APPLICABLE`, tercatat di `fix-review-log.md`.

Comment yang diposting akun bot (termasuk comment ringkasan milik Orchestrator
sendiri) selalu diabaikan — tanpa guard ini, output review Orchestrator akan memicu
dirinya sendiri. Job PR review selalu clone ke workspace baru, apa pun isi
`workspace.mode`.

## Dashboard monitoring

Dashboard monitoring pipeline live disajikan web server di `/dashboard`: fase PIV,
jumlah retry per gate, cost nyata yang dilaporkan CLI `claude`, link artifact, dan
run PR review, diperbarui real time. Halaman kedua yang read-only di
`/dashboard/agent-floor` menampilkan run yang sama sebagai kantor agent beranimasi,
dengan mode live, replay, dan demo.

Default-nya mati dan dilindungi basic auth. Untuk mengaktifkannya:

```yaml
# caf.config.yaml
dashboard:
  enabled: true
  basicAuthUser: admin
```

dan set `DASHBOARD_BASIC_AUTH_PASSWORD` di `.env`. Histori run disimpan di file
SQLite (`db.path`, default `./data/caf-dashboard.sqlite`); `pnpm db:migrate` membuat
atau meng-upgrade-nya.

Di belakang reverse proxy, pastikan `/dashboard`, `/api/pipelines*`, dan
`/api/events/stream` semuanya di-proxy dan hanya disajikan lewat HTTPS.

## Fitur opsional (default mati)

- **Notifikasi Telegram** — alert pipeline mulai, selesai, dan gagal. Set
  `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` bersamaan.
- **Model routing** — arahkan agent lewat endpoint kompatibel-Anthropic seperti
  OpenRouter dengan `openai.useOpenai: true` plus `OPENAI_API_KEY`.
  `agents.modelOverrides` memilih model per agent, global atau per project. Setiap
  model id harus terdaftar persis di `openai.allowedModels`; daftarnya kosong (tidak
  ada yang diizinkan) secara default.
- **Dynamic agent skip** — Planner bisa menulis section `## Skip Agents` di
  `tasks.md` untuk melewati agent yang tidak relevan bagi sebuah ticket. Aktifkan
  dengan `AGENT_SKIP_ENABLED=true`. Melewati QA atau Reviewer menambahkan peringatan
  eksplisit di body PR.
- **Persistent workspace** — `workspace.mode: persistent` memakai ulang satu
  checkout per repo, bukan clone per job. Pakai hanya untuk repo besar: job kedua
  untuk repo yang sama ditolak selama job pertama masih memegang workspace.

## Multi-repo

Routing multi-repo/multi-tim sudah aktif: map `projects:` di `caf.config.yaml`
berisi satu entry per project (`ticketPrefix`, `repoCloneUrl`, `baseBranch`,
`workspaceDir`, opsional `agents.modelOverrides` dan
`orchestration.maxOrchestrationRetries`). Ticket Linear yang masuk di-routing dengan
mencocokkan prefix ticket key (mis. `ABC-123` → `ABC`) ke `ticketPrefix` sebuah
project; job dari GitHub di-routing berdasarkan repo, dan ticket key-nya adalah
`<ticketPrefix>-<nomor issue>`. Prefix harus unik dan direktori workspace tidak
boleh tumpang tindih. Minimal satu project harus dikonfigurasi — startup langsung
gagal kalau map `projects:` kosong.

## Batasan scope

- Worker concurrency default-nya 1 — proses agent Claude Code yang berjalan
  bersamaan itu mahal.
- Hanya pipeline yang berhenti rapi di sebuah gate yang bisa di-resume di tengah
  jalan, dan hanya atas permintaan. Selain itu diulang dari Planner.
- Persistent workspace dikunci in-process, jadi mode itu mengasumsikan satu instance
  worker.
