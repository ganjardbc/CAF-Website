---
title: Jira
description: Dukungan Jira untuk CAF Orchestrator direncanakan tapi belum diimplementasikan.
---

> **Belum tersedia.** CAF Orchestrator saat ini cuma menerima webhook dari
> Linear. Dukungan Jira ada di roadmap — halaman ini mendeskripsikan desain
> yang direncanakan dan akan diperbarui begitu fiturnya rilis. Belum ada
> variabel environment `JIRA_*` atau endpoint `/webhooks/jira` di rilis saat ini.

## Desain yang direncanakan

Setelah diimplementasikan, CAF Orchestrator akan memantau perubahan status
ticket Jira lewat webhook, sama seperti [Linear](/id/docs/integrations/linear)
saat ini:

1. Buat API token di Jira (**Account Settings → Security → API tokens**)
2. Daftarkan webhook (Jira Cloud: rule Automation dengan trigger "Issue
   transitioned"; Jira Data Center/Server: **System → WebHooks** dengan event
   `Issue: updated`) yang mengarah ke orchestrator
3. Sepakati mapping status ke fase, konvensi yang sama dengan Linear

Lihat [CAF Orchestrator](/id/docs/caf-orchestrator) untuk cara kerja alur
berbasis Linear saat ini.
