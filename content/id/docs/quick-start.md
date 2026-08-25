---
title: Quick Start
description: Pasang CAF Initiator di repo kamu dalam satu command.
---

Jalankan CAF Initiator di root repo kamu:

```bash
npx caf-initiator init
```

Command ini akan:

1. Mendeteksi stack proyek kamu (framework, package manager, struktur repo)
2. Generate `.claude/agents/` — definisi tiap agent role
3. Generate `.ai/tasks/` — template artifact handoff antar fase

Setelah selesai, sambungkan CAF Orchestrator ke tracker kamu (Linear atau
Jira) supaya task berjalan otomatis begitu status ticket berubah.

> Bagian ini masih placeholder skeleton — konten lengkap instalasi CAF
> Orchestrator akan menyusul di fase berikutnya.
