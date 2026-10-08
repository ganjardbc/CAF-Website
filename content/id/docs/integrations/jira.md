---
title: Jira
description: Dukungan Jira untuk CAF Orchestrator direncanakan tapi belum diimplementasikan.
---

> **Belum tersedia.** CAF Orchestrator saat ini hanya menerima webhook dari Linear
> dan GitHub. Dukungan Jira ada di roadmap — halaman ini menjelaskan desain yang
> direncanakan dan akan diperbarui begitu dirilis. Tidak ada environment variable
> `JIRA_*` atau endpoint `/webhooks/jira` di rilis saat ini.

CAF Initiator sudah mengenal Jira sebagai tracker: `caf-init scaffold`
mendeteksinya (atau membiarkan kamu memilihnya) dan mencatatnya di `CLAUDE.md`. Itu
hanya memengaruhi knowledge base yang di-generate — tidak membuat Orchestrator
terpicu dari Jira.

## Desain yang direncanakan

Setelah diimplementasikan, CAF Orchestrator akan memantau perubahan status ticket
Jira lewat webhook, sama seperti yang dilakukannya untuk
[Linear](/id/docs/integrations/linear) saat ini:

1. Buat API token di Jira (**Account Settings → Security → API tokens**)
2. Daftarkan webhook (Jira Cloud: Automation rule dengan trigger "Issue
   transitioned"; Jira Data Center/Server: **System → WebHooks** dengan event
   `Issue: updated`) yang mengarah ke Orchestrator
3. Konfigurasikan status mana yang berarti "Ready for AI", konvensi yang sama dengan
   Linear

Lihat [CAF Orchestrator](/id/docs/caf-orchestrator) untuk cara kerja flow berbasis
Linear dan GitHub saat ini.
