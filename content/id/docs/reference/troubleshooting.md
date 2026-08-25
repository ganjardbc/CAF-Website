---
title: Troubleshooting
description: Masalah umum saat setup CAF Initiator dan CAF Orchestrator, dan cara mengatasinya.
---

Kumpulan masalah yang paling sering muncul saat setup, dikelompokkan per komponen.

## CAF Initiator

**`caf-initiator init` tidak mendeteksi stack dengan benar**

Pastikan command dijalankan dari root repo (tempat `package.json`, `go.mod`, atau file
manifest setara berada), bukan dari subfolder. Deteksi stack bergantung pada file
manifest di direktori kerja saat ini.

**`.claude/agents/` sudah ada dan tidak mau di-generate ulang**

CAF Initiator tidak menimpa file yang sudah ada supaya tidak menghapus kustomisasi kamu
(lihat [Layer 2: Agent Definitions](/id/docs/core-concepts/layer-2)). Hapus atau pindahkan
folder itu dulu kalau memang ingin generate ulang dari nol.

## CAF Orchestrator

**Webhook tidak trigger apa-apa**

Cek berurutan:

1. URL webhook di tracker mengarah ke host dan path yang benar
   (`/webhooks/linear` atau `/webhooks/jira`)
2. `WEBHOOK_SECRET` di `.env` orchestrator sama persis dengan secret yang didaftarkan di
   tracker
3. Nama status ticket cocok dengan mapping yang dikonfigurasi — lihat
   [Linear](/id/docs/integrations/linear) atau [Jira](/id/docs/integrations/jira)

**Endpoint `/healthz` tidak merespons**

Cek log container (`docker compose logs -f`) untuk error saat startup — penyebab paling
umum adalah `REDIS_URL` yang salah atau Redis belum jalan.

**Agent berhenti dan mengeskalasi ke manusia**

Ini bukan bug — ini kebijakan retry CAF: maksimal 3x percobaan per fase sebelum
dieskalasi (lihat [Layer 4: Quality Gates](/id/docs/core-concepts/layer-4)). Cek
`verify-report.md` di `.ai/tasks/<ticket-id>/` untuk tahu kenapa gate otomatis gagal.

**PR tidak terbuka setelah fase Implement selesai**

Biasanya token Git host kurang scope. Pastikan `GITHUB_TOKEN`/`GITLAB_TOKEN` punya akses
tulis ke repo dan buka pull request — lihat
[GitHub / GitLab](/id/docs/integrations/github-gitlab) untuk scope yang tepat.

## Masih belum ketemu solusinya?

Halaman ini akan terus ditambah seiring masalah baru ditemukan. Laporkan lewat GitHub
kalau kamu menemukan masalah yang belum tercakup di sini.
