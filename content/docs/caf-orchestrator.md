---
title: CAF Orchestrator
description: Webhook receiver self-hosted (Fastify + BullMQ + Redis) yang menjalankan agent per fase.
---

CAF Orchestrator adalah service kecil yang jalan di VPS kamu sendiri. Ia menerima webhook
dari tracker, mengantrikan job per fase, lalu spawn agent Claude Code headless untuk
menjalankan Plan, Implement, Verify, sampai membuka PR.

## Setup

Orchestrator didistribusikan sebagai image Docker — cara paling cepat menjalankannya adalah
lewat `docker compose`:

```bash
docker compose up -d
```

Sebelum itu, siapkan file `.env` dengan variabel berikut:

| Variabel | Keterangan |
|---|---|
| `REDIS_URL` | Koneksi ke instance Redis untuk queue BullMQ |
| `CLAUDE_CODE_TOKEN` | Kredensial untuk menjalankan Claude Code headless |
| `WEBHOOK_SECRET` | Secret untuk memverifikasi payload webhook masuk |
| `LINEAR_API_KEY` / `JIRA_API_TOKEN` | Kredensial tracker, isi sesuai yang kamu pakai |

Setelah container jalan, cek endpoint kesehatannya:

```bash
curl http://localhost:PORT/healthz
```

## Konfigurasi webhook (Linear / Jira)

Orchestrator trigger otomatis dari perubahan status ticket. Daftarkan webhook di tracker
kamu supaya mengarah ke endpoint orchestrator:

- Linear: `https://<host-vps-kamu>/webhooks/linear`
- Jira: `https://<host-vps-kamu>/webhooks/jira`

Alurnya:

1. Status ticket berubah (misal ke "Ready for Plan") di Linear/Jira
2. Tracker mengirim webhook ke orchestrator
3. Orchestrator memverifikasi signature payload dengan `WEBHOOK_SECRET`
4. Job untuk fase yang sesuai masuk ke antrian BullMQ
5. Orchestrator spawn agent Claude Code headless untuk fase itu

Setiap fase tetap berhenti di checkpoint human-review — orchestrator tidak pernah
melanjutkan ke fase berikutnya tanpa approval eksplisit.

## Multi-repo

Dukungan menjalankan satu instance orchestrator untuk banyak repo sekaligus masih dalam
roadmap dan belum tersedia di v1.0.0. Untuk saat ini, jalankan satu instance orchestrator
per repo. Halaman ini akan diperbarui begitu fitur multi-repo dirilis.
