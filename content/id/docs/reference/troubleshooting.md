---
title: Troubleshooting
description: Masalah umum saat setup CAF Initiator dan CAF Orchestrator, dan cara memperbaikinya.
---

Masalah yang paling sering muncul saat setup, dikelompokkan per komponen.

## CAF Initiator

**`caf-init scaffold` tidak mendeteksi stack dengan benar**

Pastikan command dijalankan dari root repo (tempat `package.json` berada), bukan
dari subfolder, atau pakai `--dir <path>`. Jalankan dengan `--dry-run` dulu untuk
melihat apa yang terdeteksi. Kalau repo mode-nya salah, override dengan
`--mode single` atau `--mode mono`.

**File sudah ada dan tidak mau di-generate ulang**

CAF Initiator secara default tidak menimpa file yang sudah ada, supaya kustomisasi
kamu tidak hilang (lihat
[Layer 2: Agent Definitions](/id/docs/core-concepts/layer-2)).

- Untuk mengambil perbaikan template di agent tanpa kehilangan edit kamu, pakai
  `caf-init curate` — ia hanya menulis ulang section ter-track yang belum kamu
  sentuh.
- Untuk generate ulang dari nol, pakai `--force` (`caf-init scaffold agents --force`,
  `caf-init scaffold skills --force`, atau `caf-init export --force` untuk salinan
  yang sudah di-publish di `.opencode/`, `.kiro/`, dst.). File ditimpa di tempat,
  termasuk edit manual, jadi cek `git diff` setelahnya.
- `caf-init export` secara default hanya mem-publish ulang definisi agent — pakai
  `--kind both` (atau `--kind command`) kalau slash command pendamping juga perlu
  diperbarui.

**Semua section muncul sebagai `UNTRACKED` di `curate`**

Belum ada baseline. Review section agent-nya, lalu jalankan
`caf-init curate baseline`.

**`curate` melaporkan `unknown-kind` untuk sebuah file agent**

Nama file bukan kind CAF yang dikenal (`caf-<kind>.md`) maupun slug app yang
terdeteksi, jadi `curate` sengaja melewatinya: tidak pernah di-sync, di-baseline, atau
ditawari section `## Skills`. Ganti namanya ke kind yang dikenal, atau biarkan saja.
Kalau repo mode terdeteksi salah, pakai `--mode single` atau `--mode mono`.

**Repo yang di-scaffold lebih awal tidak mendapat teks agent yang baru**

Hanya section ter-track yang bergerak lewat `caf-init curate`: jalankan dan terima
section `DRIFT` (aturan spec ada di `## Output`). `tools:` di frontmatter, `## Skills`,
`## Constraints` milik Planner, slash command, skill, `agent-handoff.md`, dan
`piv-workflow.md` tidak di-sync: `curate audit` memperingatkan tiga yang pertama, dan
untuk sisanya kamu menghapus file-nya lalu men-scaffold ulang.

**Agent mengabaikan sebuah skill**

Skill itu masih punya banner `DRAFT` — biasanya `caf-self-verify`, kalau salah satu
script lint, typecheck, test, atau build tidak ada di `package.json`, atau
`caf-traceability`, yang ditulis sebagai `DRAFT` di setiap repo. Selesaikan
baris `TODO` dan hapus seluruh banner (kedua barisnya), lalu jalankan ulang
`caf-init scaffold skills`: ia menawarkan pointer ke agent yang belum punya section
`## Skills`, dan menyebutkan baris yang perlu kamu tambahkan sendiri untuk agent
yang sudah punya. `caf-init curate --check-drafts` melaporkan banner yang baru
dihapus setengah.

**Orchestrator tidak pernah menjalankan agent implementasi saya (repo single-package)**

Orchestrator hanya me-routing `caf-frontend` dan `caf-backend`, berdasarkan header
`## Frontend Tasks` / `## Backend Tasks` di `tasks.md`. Repo yang hanya punya
`caf-implementer.md` lama perlu `caf-init scaffold agents` (atau `--role frontend` /
`--role backend`), yang menambahkan dua agent itu di sebelahnya.

**Orchestrator menjalankan `caf-qa`, bukan `caf-validator`**

Ia memilih gate dari checkout: `caf-validator` hanya bila
`.claude/agents/caf-validator.md` ada. Jalankan `caf-init scaffold agents` untuk
menambahkannya, dan commit file-nya ke branch yang di-clone Orchestrator.

## CAF Orchestrator

**Webhook tidak memicu apa pun**

Cek secara berurutan:

1. Dua proses sama-sama jalan — web server saja hanya menerima webhook; worker yang
   menjalankannya
2. URL webhook mengarah ke host dan path yang benar (`/webhooks/linear` atau
   `/webhooks/github`)
3. `LINEAR_WEBHOOK_SECRET` / `GITHUB_WEBHOOK_SECRET` di `.env` persis sama dengan
   secret yang didaftarkan di sisi seberang
4. Linear: `linear.readyStateId` di `caf.config.yaml` adalah UUID state tujuan
   ticket kamu, dan prefix ticket cocok dengan `ticketPrefix` sebuah project —
   lihat [Linear](/id/docs/integrations/linear)
5. GitHub: label cocok dengan `github.readyLabel`, repo cocok dengan `repoCloneUrl`
   sebuah project, dan orang yang memasang label punya akses `write` atau lebih
6. `ENABLE_PIPELINE_TRIGGER` tidak di-set `false`

**Comment `/caf-review`, `/caf-retry-pipeline`, atau `/caf-approve-spec` diabaikan**

Command ini hanya berlaku di PR yang dibuka pipeline (head branch
`ai-agent/<TICKET-KEY>`), dari user dengan permission `write`, `maintain`, atau
`admin`. Comment harus diawali command-nya. Trigger yang ditolak mengembalikan
`200 ignored`, jadi tidak terlihat sebagai delivery gagal di GitHub.

**Orchestrator gagal start**

Config divalidasi saat startup. Penyebab umum: `linear.readyStateId` kosong atau
bukan UUID, map `projects:` kosong, tidak ada jalur auth Claude Code
(`CLAUDE_CODE_OAUTH_TOKEN`, atau `openai.useOpenai: true` + `OPENAI_API_KEY`), hanya
satu dari dua variabel Telegram yang di-set, atau `dashboard.enabled: true` tanpa
`dashboard.basicAuthUser` dan `DASHBOARD_BASIC_AUTH_PASSWORD`.

**`/health` mengembalikan 503 atau tidak merespons**

`503` berarti Redis tidak terjangkau atau `workspace.dir` tidak bisa ditulis — body
response menyebutkan yang mana. Tidak ada respons sama sekali: cek log proses untuk
error startup; penyebab paling umum adalah `REDIS_URL` salah atau Redis belum jalan.

**Pipeline berhenti dan membuka Draft PR**

Ini bukan bug — sebuah gate masih gagal setelah retry-nya habis (lihat
[Layer 4: Quality Gates](/id/docs/core-concepts/layer-4)). Body Draft PR berisi
report yang gagal; file yang sama ada di `.caf/tasks/<TICKET-KEY>/`
(`verify-report.md`, `validate-report.md`, `qa-report.md`, atau `review-notes.md`).
Perbaiki manual, atau comment `/caf-retry-pipeline` di Draft PR untuk melanjutkan.

Report validator yang menyatakan `Status: PASS` padahal setiap acceptance criterion
`UNVERIFIED` juga berhenti di sini, sebagai `NEEDS_HUMAN`: tidak ada yang terbukti.
Beri criterion bukti yang bisa dijalankan Validator (test bernama atau baris
`Verify: command:`).

**Pipeline berhenti dan berkomentar `❓ CAF-CLARIFY`**

Spec punya pertanyaan `BLOCKING` yang terbuka. Jawab lewat comment di ticket, lalu
pindahkan ticket Linear kembali ke "Ready for AI", atau hapus dan pasang lagi label
`github.readyLabel`. Lihat
[CAF Orchestrator](/id/docs/caf-orchestrator#clarify-dan-spec-gate).

**Pipeline berhenti di Draft PR yang hanya berisi spec**

Ticket membawa label spec-approval. Review spec-nya, lalu comment `/caf-approve-spec`
di PR itu. Ditolak bila PR tidak sedang menunggu persetujuan, spec
`NEEDS_CLARIFICATION`, atau pertanyaan `BLOCKING` belum dijawab.

**Criterion `Verify: command:` berstatus `UNVERIFIED`**

Validator hanya menjalankannya bila spec berstatus `Status: APPROVED`, sebagai satu
command atau rantai `&&`, dan tidak pernah bila mengandung `;`, `|`, redirect, `$()`,
backtick, `sudo`, `rm`, `curl`, `wget`, atau `git push`. Di Orchestrator, command juga
harus cocok dengan `agents.validator.allowedCommands` (`npx`, `pnpm exec`, `yarn`,
`bun`, dan `make` tidak ada di daftar default).

**Perintah git gagal dengan error autentikasi atau versi**

Orchestrator mengautentikasi git dengan header environment dan butuh `git` 2.31 atau
lebih baru di environment worker (termasuk image Docker). Cek juga `GITHUB_TOKEN`.


**`/caf-retry-pipeline` ditolak**

Bisa karena tidak ada yang perlu dilanjutkan (pipeline sudah sukses, atau branch tidak
punya `orchestration-state.json`), branch-nya sudah tidak ada di remote, atau ticket
sudah menghabiskan
`orchestration.maxOrchestrationRetries`. Comment yang diposting Orchestrator
menyebutkan yang mana.

**Agent gagal dengan `404` model, atau model override tidak dipakai**

Setiap model id — `openai.defaultModel` dan tiap nilai `agents.modelOverrides` —
harus terdaftar persis di `openai.allowedModels`, yang default-nya kosong. Id yang
terdaftar tapi tidak ada di endpoint tetap gagal saat dipanggil.

**"Workspace is busy"**

Dengan `workspace.mode: persistent`, job kedua untuk repo yang sama ditolak selama
job pertama masih memegang workspace. Picu lagi setelah run pertama selesai.

**PR tidak terbuka setelah pipeline selesai**

Biasanya masalah scope token Git host. Pastikan `GITHUB_TOKEN` punya akses write ke
repo dan bisa membuka pull request — lihat
[GitHub / GitLab](/id/docs/integrations/github-gitlab) untuk scope yang benar.

**Dashboard mengembalikan 404**

Default-nya mati. Set `dashboard.enabled: true` dan `dashboard.basicAuthUser` di
`caf.config.yaml`, dan `DASHBOARD_BASIC_AUTH_PASSWORD` di `.env`. Login lewat halaman
`/dashboard/login`; di belakang reverse proxy, proxy juga path itu, serta
`/dashboard/logout` dan `/dashboard/floor/*`.

**Terminal UI menampilkan modal masalah config dan tidak mau menyalakan proses**

TUI memvalidasi `.env` dan `caf.config.yaml` dengan cara yang sama seperti
Orchestrator, tetapi tetap terbuka supaya bisa menampilkan apa yang salah. Perbaiki
field yang tercantum lalu buka lagi. Redis hanya ditampilkan up atau down — nyalakan
sendiri.

## Masih mentok?

Halaman ini akan terus bertambah seiring munculnya masalah baru. Laporkan yang belum
tercakup di sini lewat GitHub:
[caf-initiator](https://github.com/coderiumid/caf-initiator/issues) atau
[caf-orchestrator](https://github.com/coderiumid/caf-orchestrator/issues).
