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

**Section muncul sebagai `DRIFT` tepat setelah `curate baseline`**

Known issue untuk `Input` milik agent QA dan Reviewer di monorepo, dan
`Working Pattern (PIV)` milik agent PM dan UX Designer. Jalankan
`caf-init curate --sync-only --dry-run` dan review apa yang akan diubah sebelum
sync.

**Agent mengabaikan sebuah skill**

Skill itu masih punya banner `DRAFT` — biasanya `caf-verify`, kalau salah satu
script lint, typecheck, test, atau build tidak ada di `package.json`. Selesaikan
baris `TODO` dan hapus seluruh banner (kedua barisnya), lalu jalankan ulang
`caf-init scaffold skills`: ia menawarkan pointer ke agent yang belum punya section
`## Skills`, dan menyebutkan baris yang perlu kamu tambahkan sendiri untuk agent
yang sudah punya. `caf-init curate --check-drafts` melaporkan banner yang baru
dihapus setengah.

**Orchestrator tidak pernah menjalankan agent implementasi saya (repo single-package)**

Di mode `SINGLE_REPO`, agent di-generate sebagai `caf-implementer.md`, yang tidak
di-routing Orchestrator. Generate ulang dengan `--role frontend` atau
`--role backend`.

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

**Comment `/caf-review` atau `/caf-retry-pipeline` diabaikan**

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
(`verify-report.md`, `qa-report.md`, atau `review-notes.md`). Perbaiki manual, atau
comment `/caf-retry-pipeline` di Draft PR untuk melanjutkan.

**`/caf-retry-pipeline` ditolak**

Bisa karena tidak ada yang perlu dilanjutkan (pipeline sudah sukses), branch-nya
sudah tidak ada di remote, atau ticket sudah menghabiskan
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
`caf.config.yaml`, dan `DASHBOARD_BASIC_AUTH_PASSWORD` di `.env`.

## Masih mentok?

Halaman ini akan terus bertambah seiring munculnya masalah baru. Laporkan yang belum
tercakup di sini lewat GitHub:
[caf-initiator](https://github.com/coderiumid/caf-initiator/issues) atau
[caf-orchestrator](https://github.com/coderiumid/caf-orchestrator/issues).
