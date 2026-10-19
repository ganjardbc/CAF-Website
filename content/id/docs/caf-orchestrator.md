---
title: CAF Orchestrator
description: Webhook receiver self-hosted (Fastify + BullMQ + Redis) yang menjalankan pipeline agent dari ticket sampai PR.
---

CAF Orchestrator adalah service kecil yang jalan di VPS milik kamu. Begitu sebuah
ticket menjadi "Ready for AI", ia meng-clone repo target dan menjalankan rantai proses
headless `claude --agent <name>` (`caf-planner` → `caf-frontend` / `caf-backend` →
`caf-validator` → `caf-reviewer`, plus `caf-documentation` bila repo punya), mem-push
branch `ai-agent/<TICKET-KEY>`, membuka PR GitHub, dan melaporkan hasilnya kembali di
ticket.

Ia berhenti sebelum implementasi bila spec belum jelas atau belum disetujui (lihat
[Clarify dan spec gate](#clarify-dan-spec-gate)), dan juga menjalankan review AI atas
PR yang sudah ada, digerakkan oleh komentar PR.

> Linear dan GitHub Issues sama-sama bisa memicu pipeline saat ini. Dukungan Jira
> direncanakan tapi belum diimplementasikan — lihat [Jira](/id/docs/integrations/jira)
> untuk statusnya. Source:
> [github.com/coderiumid/caf-orchestrator](https://github.com/coderiumid/caf-orchestrator).

## Apa yang memicunya

| Pemicu | Di mana | Hasil |
|---|---|---|
| Ticket Linear pindah ke state `linear.readyStateId` | `POST /webhooks/linear` | Pipeline agent penuh |
| GitHub Issue mendapat label `github.readyLabel` (default `ready-for-ai`) | `POST /webhooks/github` | Pipeline agent penuh |
| Komentar `/caf-retry-pipeline` di Draft PR, atau ticket Linear masuk lagi ke "Ready for AI" saat branch-nya masih ada | salah satu webhook | Melanjutkan pipeline yang berhenti di sebuah gate |
| Ticket dipicu ulang setelah pertanyaan Clarify dijawab lewat komentar | salah satu webhook | Planner dilanjutkan dengan jawaban itu |
| Komentar `/caf-approve-spec` di Draft PR spec | `POST /webhooks/github` | Menyetujui spec dan lanjut ke implementasi |
| Komentar `/caf-review` di sebuah PR | `POST /webhooks/github` | Review penuh, diposting sebagai GitHub PR review |
| Komentar `/caf-fix-review` di sebuah PR | `POST /webhooks/github` | Reviewer menangani setiap komentar review di PR |
| Reply di dalam thread review inline | `POST /webhooks/github` | Reviewer menangani thread itu saja |

Pemicu dari sisi GitHub mensyaratkan pemberi komentar atau label punya permission
`write`, `maintain`, atau `admin` di repo; selain itu diabaikan diam-diam. Pemicu
komentar PR hanya bekerja di PR yang dihasilkan pipeline ini (head branch
`ai-agent/<TICKET-KEY>`). `ENABLE_PIPELINE_TRIGGER=false` adalah kill switch untuk
semuanya.

## Requirements

- Node.js 22 atau lebih baru
- pnpm
- Redis
- `git` 2.31 atau lebih baru, dengan akses push ke repo target
- CLI `claude` tersedia di PATH, dengan definisi agent (`caf-planner`, `caf-frontend`,
  `caf-backend`, `caf-validator` atau `caf-qa`, `caf-reviewer`, dan opsional
  `caf-documentation`) ada di `.claude/agents/` milik **repo target** — inilah yang
  di-scaffold [CAF Initiator](/id/docs/caf-initiator) untuk kamu. Orchestrator hanya
  tahu namanya dan memanggilnya

Dua generasi repo target bisa dipakai tanpa perubahan config. Pipeline melihat
checkout-nya: dengan `.claude/agents/caf-validator.md` ia menjalankan `caf-validator`
dan membaca `validate-report.md` (fallback ke `qa-report.md`); selain itu ia menjalankan
`caf-qa` dan membaca `qa-report.md`. Tanpa `.claude/agents/caf-documentation.md`, langkah
docs dilewati, bukan gagal. Repo satu app (tidak dipisah front/back) memakai default
`caf-frontend` + `caf-backend`; Orchestrator tidak pernah me-routing `caf-implementer`.

## Setup

CAF Orchestrator berjalan sebagai dua proses yang berbagi Redis sebagai backend queue:

- **Web server** — menerima dan memvalidasi webhook Linear/GitHub, meng-enqueue job,
  dan menyajikan dashboard monitoring.
- **Worker** — mengambil job dari queue dan menjalankannya: `agent-pipeline` (ticket →
  PR) dan `pr-review` (komentar PR → review).

Keduanya harus jalan agar sesuatu diproses — web server saja hanya menerima webhook.

```bash
git clone https://github.com/coderiumid/caf-orchestrator.git
cd caf-orchestrator
pnpm install
cp .env.example .env                           # secret dan toggle operasional
cp caf.config.example.yaml caf.config.yaml     # config struktural
```

Isi kedua file (lihat [Konfigurasi](#konfigurasi)), lalu jalankan kedua proses:

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

Setelah jalan, cek health endpoint-nya:

```bash
curl http://localhost:PORT/health
```

Mengembalikan `200` dengan `{ status: "healthy", services: { redis, disk } }` bila
koneksi Redis dan write probe ke `workspace.dir` sama-sama berhasil, atau `503` dengan
`status: "unhealthy"` bila tidak.

Script lain: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:coverage`, dan
`pnpm db:migrate` (membuat atau meng-upgrade database SQLite dashboard).

### Deploy dengan Docker

`deploy.sh` di repo menarik `origin/main`, membangun ulang image, dan me-restart
service — dimaksudkan untuk dijalankan manual maupun dari CI. Workflow GitHub Actions
bawaan menjalankan typecheck, lint, test, dan build di setiap push dan PR, lalu
memanggil `deploy.sh` di VPS lewat SSH untuk push ke `main`. Image berbasis
`node:22-slim` (glibc, untuk `better-sqlite3`) dan berisi `git`, `openssh-client`, dan
CLI `claude`.

## Konfigurasi

Config terbagi di dua file, keduanya divalidasi saat startup — config yang salah atau
tidak lengkap langsung gagal.

### `.env` — secret dan toggle operasional

Lihat [Environment Variables](/id/docs/reference/environment-variables) untuk daftar
lengkapnya. Wajib: `REDIS_URL`, `LINEAR_WEBHOOK_SECRET`, `LINEAR_API_KEY`,
`GITHUB_TOKEN`, `GITHUB_WEBHOOK_SECRET`, dan satu jalur auth Claude Code
(`CLAUDE_CODE_OAUTH_TOKEN`, atau `OPENAI_API_KEY` bersama `openai.useOpenai: true`).

### `caf.config.yaml` — config struktural

`caf.config.example.yaml` mendaftar setiap field beserta defaultnya. Bagian yang wajib
kamu isi:

- `linear.readyStateId` — UUID workflow state "Ready for AI".
- `projects:` — minimal satu entri. Tiap project punya `ticketPrefix` (mis. `ABC`
  untuk `ABC-123`), `repoCloneUrl`, `baseBranch`, dan `workspaceDir` absolut.

Yang umum disetel:

| Field | Yang dikendalikan | Default |
|---|---|---|
| `github.readyLabel` | Label yang membuat GitHub Issue "Ready for AI" | `ready-for-ai` |
| `linear.specGateLabel` / `github.specGateLabel` | Label yang menaruh ticket di belakang [persetujuan spec](#clarify-dan-spec-gate); bisa di-override per project | `spec-approval` |
| `workspace.mode` | `ephemeral` (clone baru per job) atau `persistent` (pakai ulang satu checkout per repo) | `ephemeral` |
| `agents.qa.maxRetries` / `agents.reviewer.maxRetries` | Retry gate dalam satu run. `agents.qa` mengatur gate validasi, `caf-validator` atau `caf-qa` | `1` masing-masing |
| `agents.validator.restrictBash` / `agents.validator.allowedCommands` | [Validator terbatas](#validator-terbatas) | `true` / lihat di bawah |
| `orchestration.maxOrchestrationRetries` | Berapa kali ticket yang gate-nya habis boleh dilanjutkan; bisa di-override per project | `2` |
| `claude.agentTimeoutMs` | Timeout per proses agent | 30 menit |
| `queue.workerConcurrency` | Job pipeline bersamaan per worker | `1` |
| `queue.jobAttempts` | Retry seluruh job setelah kegagalan tak terduga | `3` |
| `openai.*`, `agents.modelOverrides` | Model routing (lihat di bawah) | mati |
| `dashboard.enabled`, `dashboard.basicAuthUser`, `db.path` | Dashboard monitoring | mati |

## Konfigurasi webhook

Daftarkan webhook yang menunjuk ke Orchestrator:

- **Linear** — `https://<host-vps-kamu>/webhooks/linear`, secret =
  `LINEAR_WEBHOOK_SECRET`. Lihat [Linear](/id/docs/integrations/linear).
- **GitHub** (per repo target) — `https://<host-vps-kamu>/webhooks/github`, secret =
  `GITHUB_WEBHOOK_SECRET`, event `Issues`, `Issue comments`, dan
  `Pull request review comments`. Lihat
  [GitHub / GitLab](/id/docs/integrations/github-gitlab).

Tanda tangan setiap payload diverifikasi (Linear juga mengecek jendela timestamp 60
detik), dan delivery di-dedupe berdasarkan delivery ID.

## Pipeline

1. Clone repo target ke workspace project dan buat branch `ai-agent/<TICKET-KEY>`.
   Ticket Linear di-routing ke project lewat prefix ticket, GitHub Issues lewat repository.
2. Jalankan `caf-planner`, yang menulis spec di `.caf/tasks/<TICKET-KEY>/`
   (`requirements.md`, `tasks.md`, opsional `design.md` atau `breakdown.md`).
3. **Cek spec.** Baca baris `Status:` di `requirements.md`. Spec yang belum jelas atau
   belum disetujui menghentikan run di sini — lihat
   [Clarify dan spec gate](#clarify-dan-spec-gate).
4. Baca `tasks.md`: header `## Frontend Tasks` / `## Backend Tasks` menentukan agent
   implementasi mana yang jalan (`caf-frontend`, lalu `caf-backend`). Agent tidak pernah
   mengubah spec `APPROVED`; usulan perubahan dilaporkan.
5. Jalankan agent implementasi, lalu baca `verify-report.md`. Tanpa `SUCCESS`, run
   berhenti dengan Draft PR.
6. **Gate validasi.** Jalankan `caf-validator` → `validate-report.md` (atau `caf-qa` →
   `qa-report.md` di repo tanpa validator). Bila `FAIL`, atau tidak ada report sama
   sekali, jalankan ulang implementasi sampai `agents.qa.maxRetries` kali. Dengan
   validator, PR juga mendapat [ringkasan acceptance criteria](#ringkasan-acceptance-criteria).
7. Jalankan `caf-reviewer` → `review-notes.md`. Bila `CHANGES_REQUESTED`, jalankan ulang
   implementasi sampai `agents.reviewer.maxRetries` kali. `DEFER` hanya meninggalkan
   komentar untuk manusia.
8. Bila `tasks.md` punya `## Docs Tasks` yang nyata dan repo punya `caf-documentation`,
   jalankan agent itu. Kegagalan docs tidak pernah menggagalkan job.
9. Commit, push, buka PR GitHub, dan posting komentar akhir (link PR plus report gate
   dan reviewer) di ticket Linear atau GitHub Issue.

Orchestrator tidak pernah me-merge PR sendiri.

### Clarify dan spec gate

Pipeline membaca spec tepat setelah planner. Kalau repo tidak punya `requirements.md`,
atau file-nya tidak punya baris `Status:`, semua ini tidak berlaku dan pipeline
berperilaku seperti sebelum spec-driven development.

- **Clarify.** `Status: NEEDS_CLARIFICATION`, atau `Status: DRAFT` dengan pertanyaan
  `[BLOCKING]` yang belum punya `— Answer:`, selalu menghentikan pipeline. Draft spec
  di-commit dan di-push ke `ai-agent/<TICKET-KEY>` (tanpa PR), dan komentar di ticket
  mendaftar setiap pertanyaan yang belum dijawab. Komentarnya diawali `❓ CAF-CLARIFY`.
  Jawab lewat komentar di ticket, lalu pindahkan ticket Linear kembali ke "Ready for
  AI", atau hapus dan pasang lagi label `github.readyLabel` di GitHub Issue. Planner
  melanjutkan draft yang tersimpan dengan komentar yang ditulis setelah komentar
  `❓ CAF-CLARIFY` terakhir (komentar dari akun bot dilewati). Kalau komentar itu
  dihapus, setiap komentar manusia di ticket dihitung sebagai jawaban.
- **Spec gate.** Ticket yang membawa label gate (`spec-approval` secara default)
  berhenti setelah planner dengan `Status: DRAFT` dan tanpa pertanyaan terbuka: spec
  di-push dan Draft PR yang hanya berisi spec (termasuk `design.md` atau `breakdown.md`)
  dibuka. Review, edit di branch bila perlu, lalu komentar `/caf-approve-spec` di PR.
  Orchestrator hanya mengubah baris `Status:` menjadi `APPROVED`, commit, push, dan
  melanjutkan dari implementasi tanpa planner. Ia menolak, dan menjelaskan alasannya di
  PR, bila PR tidak sedang menunggu persetujuan, spec `NEEDS_CLARIFICATION`, atau
  pertanyaan `BLOCKING` belum dijawab. Label dibaca pada saat trigger ready tiba. Ticket
  tanpa label langsung jalan setelah planner.
- Menunggu manusia bukan kegagalan: jawaban Clarify maupun persetujuan spec tidak
  menghabiskan `orchestration.maxOrchestrationRetries`.
- Saat run lanjutan (retry atau spec yang disetujui) akhirnya sukses, Orchestrator
  meng-update PR itu dan menandainya Ready for review lewat GraphQL API GitHub. Bila
  GitHub menolak, PR tetap Draft dan komentar ticket menjelaskan alasannya.
- Ticket yang branch `ai-agent/<TICKET-KEY>`-nya ada tapi tanpa `orchestration-state.json`
  mendapat komentar "nothing to resume" saat dipicu ulang; hapus branch untuk mengulang.

### Ringkasan acceptance criteria

Di repo yang punya `caf-validator` (satu-satunya agent gate yang menulis tabel
per-criterion), bila `requirements.md` punya baris `- AC-n:`, Orchestrator menghitung
tiap criterion terhadap tabel di report dan menaruh ringkasan deterministik di bagian
atas body PR, baik PR biasa maupun Draft: jumlah PASS, FAIL, dan UNVERIFIED, daftar
UNVERIFIED beserta alasan, dan baris `Proposed Spec Changes:` dari report bila ada.
Criterion yang tidak ada di report dihitung `UNVERIFIED`.

Gate lolos bila tidak ada `FAIL`. Satu pengecualian: report yang menyatakan
`Status: PASS` padahal *semua* criterion `UNVERIFIED` tidak membuktikan apa-apa, jadi
diperlakukan sebagai `NEEDS_HUMAN` (Draft PR dan komentar, tanpa retry). Repo `caf-qa`
tidak mendapat ringkasan maupun aturan ini.

### Kalau sebuah gate habis

Ketika sebuah gate (verify implementasi, validasi, atau reviewer) masih gagal setelah
retry-nya, pekerjaan tidak dibiarkan terlantar: branch di-push dan **Draft PR** dibuka
— atau di-update bila sudah ada yang terbuka — dengan report yang gagal sebagai
body-nya. Pipeline lalu berhenti dan berkomentar untuk manusia, yang bisa memperbaikinya
manual atau melanjutkannya.

### Kegagalan yang bukan gate

- Crash atau timeout agent mengulang seluruh job dari Planner, sampai
  `queue.jobAttempts`.
- `429` (kuota API habis) atau `404` (model tidak ditemukan) dari agent menghentikan
  pipeline dengan bersih lewat komentar alih-alih retry — mengulangnya hanya gagal dengan
  cara yang sama.

### Melanjutkan pipeline yang berhenti (`/caf-retry-pipeline`)

Run yang gate-nya habis bukan jalan buntu. Lanjutkan dengan:

- Berkomentar `/caf-retry-pipeline` di Draft PR, atau
- Memindahkan ticket Linear kembali ke state ready (Orchestrator mendeteksi branch
  `ai-agent/<TICKET-KEY>` sudah ada lewat GitHub API dan melanjutkannya alih-alih
  memulai ticket baru)

Kedua jalur bertemu di logika resume yang sama — tidak ada yang punya counter atau kode
pemilihan gate sendiri. Jawaban Clarify dan persetujuan spec memakai mekanisme yang sama.

**Bagaimana state bertahan antar pemanggilan.** Di setiap kegagalan gate, Orchestrator
menulis `orchestration-state.json` ke `.caf/tasks/<TICKET-KEY>/` di workspace —
`orchestrationRetryCount`, `lastFailedGate` (`implementation`/`validate`/`reviewer`;
`qa` lama yang tersimpan dibaca sebagai gate yang sama), `lastKnownCommitSha`,
`waitingFor` (`clarify`/`spec-approval` saat menunggu manusia), dan judul/deskripsi
ticket (supaya resume bisa membangun prompt tanpa planner tanpa mengambil ulang ticket
asli). Folder itu ikut commit-and-push normal di akhir setiap run, jadi file-nya
berpindah **di branch itu sendiri** — ia bertahan bahkan dengan mode workspace
`ephemeral` default, yang menghapus clone lokal setelah tiap job. Saat pipeline sukses
penuh, file dihapus; ketiadaannya yang dicek trigger resume untuk menolak ticket yang
tidak punya apa-apa untuk dilanjutkan.

**Yang sebenarnya dilakukan resume:**

1. Memastikan branch masih ada di remote. Retry yang dipicu setelah PR di-merge dan
   branch dihapus berhenti dengan komentar; tidak pernah fallback ke checkout baru.
2. Sinkron ke branch yang ada (tidak pernah membuat yang baru). Untuk checkout mode
   `persistent`, ia menjalankan `git status` read-only dulu dan **berhenti dengan
   komentar** bila menemukan sisa yang belum di-commit (mis. run sebelumnya terputus di
   tengah penulisan) — ia tidak membuang perubahan lokal diam-diam di sini, berbeda
   dengan jalur sinkron non-retry biasa.
3. Mengecek budget retry: menolak dengan komentar bila tidak ada state, atau bila
   `orchestrationRetryCount` sudah mencapai `orchestration.maxOrchestrationRetries`;
   selain itu menaikkan counter.
4. Bila HEAD sudah melewati `lastKnownCommitSha` (manusia mem-push commit saat ticket
   berhenti), `git diff --stat` untuk selisih itu dihitung dan diberikan ke agent yang
   dilanjutkan sebagai konteks tambahan — ini tidak pernah memblokir resume, hanya sisa
   uncommitted dari langkah 2 yang memblokir.
5. Melewati planner sepenuhnya. `lastFailedGate` memilih report mana
   (`verify-report.md` / `validate-report.md` atau `qa-report.md` / `review-notes.md`)
   yang dibaca kembali sebagai konteks, lalu menjalankan ulang agent implementasi dan
   lanjut lewat ekor normal validasi → reviewer → docs → PR — kode ekor yang persis sama
   dengan run baru, bukan salinan terpisah per gate.

Bila resume datang dari komentar PR, setiap komentar status untuk run itu — termasuk
komentar sukses akhirnya — kembali ke PR itu alih-alih ke ticket asli, karena itulah
yang sedang dipantau manusia. Run lanjutan yang ditolak tanpa menjalankan agent apa pun
(branch hilang, sisa di workspace, budget retry habis, persetujuan ditolak) tidak
pernah menyentuh baris dashboard ticket.

## PR review otomatis

Orchestrator bisa menjalankan `caf-reviewer` terhadap sebuah PR sebagai respons atas
komentar PR. Ini job terpisah dari pipeline ticket di atas. Hanya bekerja di PR yang
head branch-nya `ai-agent/<TICKET-KEY>` — PR yang dibuka pipeline ini.

Tiga jalur trigger, masing-masing dipetakan ke **mode** review:

| Trigger | Mode | Perilaku |
|---|---|---|
| Komentar `/caf-review` di sebuah PR | `initial` | Review penuh dari awal. Verdict diposting sebagai GitHub PR review sungguhan; bila GitHub menolaknya sebagai self-review, diposting ulang sebagai komentar dengan verdict di body |
| Komentar `/caf-fix-review` di sebuah PR | `global` | Reviewer menangani setiap komentar inline dan umum yang ada, membalas satu per satu, dan memposting ringkasan |
| Reply di dalam thread komentar review inline | `scoped` | Sama, tapi hanya untuk thread itu |

Di mode `global` dan `scoped`, setiap komentar berakhir `FIXED`, `SKIPPED`, atau
`NOT_APPLICABLE`, dicatat di `fix-review-log.md`. Job ini tidak pernah mengedit
`requirements.md` atau `tasks.md`: komentar yang meminta perubahan spec dicatat di
`## Proposed Spec Changes` pada `fix-review-log.md` dan ditandai `SKIPPED`.

Komentar dari akun bot (termasuk komentar ringkasan milik Orchestrator sendiri) selalu
diabaikan — tanpa penjaga ini, output review Orchestrator sendiri akan memicu dirinya
sendiri saat dikirim. Job PR-review selalu clone ke workspace baru, apa pun nilai
`workspace.mode`. Tidak seperti pipeline ticket, tidak ada gate di sini: kegagalan
melempar error dan BullMQ me-retry job.

## Eksekusi agent dan keamanan

Setiap agent dijalankan sebagai
`claude --agent <name> --print --output-format json --permission-mode bypassPermissions`
di workspace hasil clone, prompt dialirkan lewat stdin, dengan `CAF_HEADLESS=1` di
environment-nya dan baris `[SYSTEM CONTEXT: Environment = headless ...]` di awal
prompt. `bypassPermissions` disengaja: run headless tidak bisa menjawab prompt
persetujuan, dan tiap run terjadi di dalam workspace scratch milik Orchestrator.
Orchestrator tidak pernah memanggil `/caf-run`, `/caf-plan`, atau skill sendiri — hanya
`claude --agent`. Ia tidak memakai `--bare`, yang akan mematikan discovery agent di repo target.

### Validator terbatas

`caf-validator` adalah satu-satunya pengecualian. Dengan `agents.validator.restrictBash: true`
(default) ia berjalan di bawah `--permission-mode dontAsk --setting-sources project`:

- Bash dibatasi ke `agents.validator.allowedCommands`. Daftar default-nya
  `pnpm run *`, `pnpm test [*]`, `pnpm --filter * run *`, `pnpm --filter * test [*]`,
  `npm run *`, `npm test [*]`. `npx`, `pnpm dlx`, `pnpm exec`, `yarn`, `bun`, dan `make`
  sengaja tidak ada, karena akan mengizinkan command sembarang lewat runner; tambahkan
  di config bila repo butuh. Daftar kosong valid dan fail-closed.
- Penulisan dibatasi ke `.caf/tasks/`.
- Setting Claude milik user worker (hook, aturan allow) diabaikan.
- Secret dihapus dari environment-nya: `REDIS_URL`, `LINEAR_*`, `GITHUB_TOKEN`,
  `GITHUB_WEBHOOK_SECRET`, `TELEGRAM_*`, dan `DASHBOARD_BASIC_AUTH_PASSWORD`.

`restrictBash: false` mengembalikan perilaku sebelumnya. Agent lain tidak berubah.

### Autentikasi git

`GITHUB_TOKEN` tidak pernah ditulis ke workspace. Orchestrator meng-clone URL polos
`https://github.com/<owner>/<repo>.git` dan mengautentikasi tiap perintah jaringan
(`clone`, `push`, `fetch`, `ls-remote`) dengan `http.extraheader` per-proses yang
dilewatkan lewat environment variable, jadi token tidak ada di URL remote,
`.git/config`, maupun argumen apa pun. Error di-redact. Ini butuh `git` 2.31 atau lebih
baru. Workspace persistent hasil clone versi lama dibersihkan URL remote-nya pada run
berikutnya; untuk clone yang tidak akan dipakai ulang, jalankan
`git -C <workspace> remote set-url origin https://github.com/<owner>/<repo>.git`.

## Dashboard monitoring

Dashboard pemantauan pipeline live disajikan web server di `/dashboard`: fase PIV,
jumlah retry per gate, biaya nyata sesuai laporan CLI `claude`, link artifact, dan
run PR review, diperbarui real-time. Halaman kedua yang read-only di
`/dashboard/agent-floor` menampilkan run yang sama sebagai kantor agent beranimasi,
dengan mode live, replay, dan demo.

![Dashboard CAF menampilkan run pipeline beserta fase, retry, dan biayanya](/images/caf-dashboard.webp)

![CAF Agent Floor, kantor agent beranimasi](/images/caf-agent-floor.webp)

Defaultnya mati dan dilindungi basic-auth. Untuk mengaktifkan:

```yaml
# caf.config.yaml
dashboard:
  enabled: true
  basicAuthUser: admin
```

dan set `DASHBOARD_BASIC_AUTH_PASSWORD` di `.env`. Riwayat run disimpan di file SQLite
(`db.path`, default `./data/caf-dashboard.sqlite`); `pnpm db:migrate` membuat atau
meng-upgrade-nya.

Di belakang reverse proxy, pastikan `/dashboard`, `/api/pipelines*`, dan
`/api/events/stream` semuanya diproxy dan hanya dilayani lewat HTTPS.

## Fitur opsional (default mati)

- **Notifikasi Telegram** — alert pipeline mulai, selesai, dan gagal. Set
  `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` bersamaan.
- **Model routing** — arahkan agent lewat endpoint yang kompatibel dengan Anthropic
  seperti OpenRouter dengan `openai.useOpenai: true` plus `OPENAI_API_KEY`.
  `agents.modelOverrides` memilih model per agent, global atau per project. Setiap id
  model harus terdaftar persis di `openai.allowedModels`; daftarnya kosong (tidak ada
  yang diizinkan) secara default.
- **Dynamic agent skip** — Planner bisa menulis section `## Skip Agents` di `tasks.md`
  untuk melewati agent yang tidak relevan untuk sebuah ticket. Aktifkan dengan
  `AGENT_SKIP_ENABLED=true`. Tidak pernah menyisakan nol agent implementasi, dan
  melewati gate validasi atau Reviewer menambahkan peringatan eksplisit ke body PR.
- **Persistent workspace** — `workspace.mode: persistent` memakai ulang satu checkout
  per repo alih-alih clone per job. Pakai hanya untuk repo besar: job kedua untuk repo
  yang sama ditolak selama job pertama masih memegang workspace.

## Multi-repo

Routing multi-repo/multi-team sudah aktif: map `projects:` di `caf.config.yaml` berisi
satu entri per project (`ticketPrefix`, `repoCloneUrl`, `baseBranch`, `workspaceDir`,
opsional `agents.modelOverrides`, `specGateLabel`, dan
`orchestration.maxOrchestrationRetries`). Ticket Linear yang masuk di-routing dengan
mencocokkan prefix key ticket (mis. `ABC-123` → `ABC`) ke `ticketPrefix` project;
job yang dipicu GitHub di-routing berdasarkan repo, dan key ticket-nya
`<ticketPrefix>-<nomor issue>`. Prefix harus unik dan direktori workspace tidak boleh
tumpang tindih. Minimal satu project harus dikonfigurasi — startup langsung gagal bila
map `projects:` kosong.

## Batasan scope

- Concurrency worker default 1 — proses agent Claude Code yang bersamaan itu mahal.
- Hanya pipeline yang berhenti dengan bersih di sebuah gate, di Clarify, atau di spec
  gate yang bisa dilanjutkan di tengah jalan, dan hanya atas permintaan. Yang lain
  mengulang dari Planner.
- Hanya `caf-frontend` dan `caf-backend` yang di-routing sebagai agent implementasi;
  `caf-architect` dan `caf-implementer` tidak pernah dijalankan.
- Workspace persistent dikunci di dalam proses, jadi mode itu mengasumsikan satu
  instance worker.
- Batas command validator berupa allowlist plus aturan teks di definisi agent-nya;
  keputusan merge selalu tetap di tangan manusia.
- Tracker: Linear dan GitHub Issues. Git host: hanya GitHub (panggilan GraphQL
  Ready-for-review dibuat untuk github.com).
