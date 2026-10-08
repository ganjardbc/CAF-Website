---
title: Linear
description: Hubungkan CAF Orchestrator ke Linear supaya pipeline kamu terpicu otomatis dari status ticket.
---

CAF Orchestrator memantau perubahan status ticket Linear lewat webhook, lalu
menjalankan pipeline agent. Halaman ini menambahkan setup khusus Linear di atas
dasar yang dibahas di [CAF Orchestrator](/id/docs/caf-orchestrator).

## 1. Buat API key

Di Linear, buka **Settings → API → Personal API keys** dan buat key baru.
Orchestrator memakainya untuk membaca ticket dan memposting comment. Tambahkan ke
`.env` Orchestrator sebagai `LINEAR_API_KEY`.

## 2. Daftarkan webhook

Di **Settings → API → Webhooks**, tambahkan webhook baru:

- URL: `https://<host-vps-kamu>/webhooks/linear`
- Event: `Issue`
- Secret: samakan dengan `LINEAR_WEBHOOK_SECRET` di Orchestrator

## 3. Tentukan state "Ready for AI"

Pipeline dipicu oleh **satu** workflow state. Buat state di tim Linear kamu
(misalnya "Ready for AI") dan taruh UUID-nya di `caf.config.yaml`:

```yaml
linear:
  readyStateId: 00000000-0000-0000-0000-000000000000
```

Nama state-nya bebas — yang dicocokkan hanya UUID. Startup langsung gagal kalau
`linear.readyStateId` tidak diisi.

## 4. Petakan prefix ticket ke project

Ticket di-routing berdasarkan prefix key-nya. Untuk ticket seperti `ABC-123`,
tambahkan project dengan `ticketPrefix: ABC`:

```yaml
projects:
  your-project:
    ticketPrefix: ABC
    repoCloneUrl: https://github.com/your-org/your-repo.git
    baseBranch: main
    workspaceDir: /tmp/caf-orchestrator/workspace/your-project
```

## Apa yang terjadi setelah webhook diterima

Orchestrator memverifikasi signature dan timestamp, lalu dedupe berdasarkan delivery
ID. Ia hanya bereaksi pada transisi state yang sesungguhnya ke ready state —
mengedit field lain di ticket yang sudah ada di sana tidak memicu apa pun. Dari situ
seluruh rantai agent jalan seperti dijelaskan di
[CAF Orchestrator](/id/docs/caf-orchestrator#pipeline), dan hasilnya diposting balik
sebagai comment di ticket.

Memindahkan ticket kembali ke ready state saat branch `ai-agent/<TICKET-KEY>`-nya
masih ada akan **melanjutkan** pipeline yang berhenti, bukan memulai yang baru.
