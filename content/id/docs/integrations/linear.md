---
title: Linear
description: Hubungkan CAF Orchestrator ke Linear supaya pipeline trigger otomatis dari status ticket.
---

CAF Orchestrator memantau perubahan status ticket di Linear lewat webhook, lalu
mengantrikan fase yang sesuai. Halaman ini melengkapi setup dasar di
[CAF Orchestrator](/id/docs/caf-orchestrator) dengan langkah spesifik untuk Linear.

## 1. Buat API key

Di Linear, buka **Settings → API → Personal API keys**, buat key baru dengan akses baca
ke workspace kamu. Isi ke `.env` orchestrator sebagai `LINEAR_API_KEY`.

## 2. Daftarkan webhook

Di **Settings → API → Webhooks**, tambahkan webhook baru:

- URL: `https://<host-vps-kamu>/webhooks/linear`
- Event: `Issue` — khususnya perubahan status (`state changed`)
- Secret: samakan dengan `WEBHOOK_SECRET` di `.env` orchestrator

## 3. Sepakati mapping status

Orchestrator trigger fase berdasarkan status ticket. Konvensi yang disarankan:

| Status Linear | Fase yang di-trigger |
|---|---|
| Ready for Plan | Plan |
| Ready for Implement | Implement |
| Ready for Verify | Verify |
| In Review | Menunggu human review (tidak ada trigger otomatis) |

Nama status ini cuma konvensi, bukan hardcoded — sesuaikan dengan workflow tim kamu di
konfigurasi orchestrator.

## Yang terjadi setelah webhook diterima

Alurnya sama seperti dijelaskan di [CAF Orchestrator](/id/docs/caf-orchestrator): payload
diverifikasi, job masuk antrian BullMQ, lalu agent Claude Code headless untuk fase itu
dijalankan.
