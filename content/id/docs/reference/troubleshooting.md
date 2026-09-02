---
title: Troubleshooting
description: Masalah umum saat setup CAF Initiator dan CAF Orchestrator, dan cara mengatasinya.
---

Kumpulan masalah yang paling sering muncul saat setup, dikelompokkan per komponen.

## CAF Initiator

**`caf-init scaffold` tidak mendeteksi stack dengan benar**

Pastikan command dijalankan dari root repo (tempat `package.json`, `go.mod`, atau file
manifest setara berada), bukan dari subfolder. Deteksi stack bergantung pada file
manifest di direktori kerja saat ini.

**`.claude/agents/` sudah ada dan tidak mau di-generate ulang**

CAF Initiator secara default tidak menimpa file yang sudah ada supaya tidak menghapus
kustomisasi kamu (lihat [Layer 2: Agent Definitions](/id/docs/core-concepts/layer-2)).
Kalau memang mau generate ulang — misalnya setelah upgrade `caf-initiator` supaya dapat
template terbaru — pakai `--force` (`caf-init scaffold agents --force`, atau
`caf-init export --force` untuk salinan yang sudah dipublish di `.opencode/`/`.kiro/`/dst):
ini menimpa langsung, termasuk edit manual yang sudah kamu buat sejak generate terakhir,
jadi cek `git diff` setelahnya. `caf-init export` defaultnya cuma republish definisi agent —
pakai `--kind both` (atau `--kind command`) kalau companion slash command juga perlu di-refresh.

## CAF Orchestrator

**Webhook tidak trigger apa-apa**

Cek berurutan:

1. URL webhook di Linear mengarah ke host dan path yang benar (`/webhooks/linear`)
2. `LINEAR_WEBHOOK_SECRET` di `.env` orchestrator sama persis dengan secret yang
   didaftarkan di Linear
3. `LINEAR_READY_STATE_ID` cocok dengan UUID workflow state yang kamu tuju saat
   memindahkan ticket — lihat [Linear](/id/docs/integrations/linear)

**Endpoint `/healthz` tidak merespons**

Cek log proses (`pnpm dev` / `pnpm start`, atau log process manager kamu) untuk error
saat startup — penyebab paling umum adalah `REDIS_URL` yang salah atau Redis belum jalan.

**Agent berhenti dan diserahkan ke manusia**

Ini bukan bug — ini kebijakan retry CAF: retry sekali kalau QA gagal atau reviewer
beri "changes requested", lalu berhenti (lihat [Layer 4: Quality Gates](/id/docs/core-concepts/layer-4)).
Cek `qa-report.md` atau `review-notes.md` di `.ai/tasks/<ticket-id>/` untuk tahu kenapa
gate otomatis gagal.

**PR tidak terbuka setelah fase Implement selesai**

Biasanya token Git host kurang scope. Pastikan `GITHUB_TOKEN` punya akses tulis ke repo
dan bisa buka pull request — lihat
[GitHub / GitLab](/id/docs/integrations/github-gitlab) untuk scope yang tepat.

## Masih belum ketemu solusinya?

Halaman ini akan terus ditambah seiring masalah baru ditemukan. Laporkan lewat GitHub
kalau kamu menemukan masalah yang belum tercakup di sini.
