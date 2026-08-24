---
title: Jira
description: Hubungkan CAF Orchestrator ke Jira supaya pipeline trigger otomatis dari status ticket.
---

Sama seperti Linear, CAF Orchestrator memantau perubahan status ticket di Jira lewat
webhook. Halaman ini melengkapi setup dasar di [CAF Orchestrator](/docs/caf-orchestrator)
dengan langkah spesifik untuk Jira.

## 1. Buat API token

Di Jira, buka **Account Settings → Security → API tokens**, buat token baru. Isi ke
`.env` orchestrator sebagai `JIRA_API_TOKEN`, bersama `JIRA_EMAIL` dan `JIRA_BASE_URL`
akun yang dipakai.

## 2. Daftarkan webhook

Webhook Jira dikonfigurasi di level project atau instance, tergantung paket Jira kamu:

- **Jira Cloud**: gunakan fitur Automation (**Project settings → Automation**), buat
  rule dengan trigger "Issue transitioned" yang mengirim web request ke
  `https://<host-vps-kamu>/webhooks/jira`
- **Jira Data Center/Server**: daftarkan lewat **System → WebHooks** dengan event
  `Issue: updated`

Sertakan header dengan secret yang sama dengan `WEBHOOK_SECRET` di `.env` orchestrator
supaya payload bisa diverifikasi.

## 3. Sepakati mapping status

Sama seperti Linear, orchestrator trigger fase berdasarkan status ticket:

| Status Jira | Fase yang di-trigger |
|---|---|
| Ready for Plan | Plan |
| Ready for Implement | Implement |
| Ready for Verify | Verify |
| In Review | Menunggu human review (tidak ada trigger otomatis) |

Sesuaikan nama status dengan workflow Jira kamu — ini konvensi, bukan nilai yang
di-hardcode di orchestrator.

## Yang terjadi setelah webhook diterima

Alurnya identik dengan Linear: payload diverifikasi, job masuk antrian BullMQ, lalu
agent Claude Code headless untuk fase itu dijalankan. Lihat
[CAF Orchestrator](/docs/caf-orchestrator) untuk detail lengkapnya.
