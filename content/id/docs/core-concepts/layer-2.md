---
title: 'Layer 2: Agent Definitions'
description: Peran, batasan akses, dan kebijakan retry untuk tiap agent di CAF.
---

Layer 2 mendefinisikan siapa mengerjakan apa. Setiap role dalam pipeline punya file
definisi sendiri di `.claude/agents/` — hasil generate `caf-init scaffold agents` yang
sudah menyerap konteks dari [Layer 1: Project Knowledge Base](/id/docs/core-concepts/layer-1).

## Role inti

CAF Initiator men-scaffold roster lengkap sesuai stack kamu (Planner, Architect, agent
implementasi per-app, QA, Reviewer, Documentation, DevOps, Auditor, PM, UX Designer).
Pipeline CAF Orchestrator menjalankan sebagian dari role ini secara berurutan:

| File | Role | Akses |
|---|---|---|
| `planner.md` | Menyusun rencana kerja dari ticket | Read-only ke kode |
| `frontend.md` / `backend.md` | Menulis kode sesuai plan yang disetujui, per app | Read-write |
| `qa.md` | Scanner — lint, test, review otomatis | Read-only |
| `reviewer.md` | Menyiapkan ringkasan diff & checklist untuk human review | Read-only |
| `documentation.md` | Update dokumentasi yang terdampak perubahan | Read-write ke docs |

`reviewer.md` **tidak** menggantikan manusia. Isinya instruksi untuk menyusun ringkasan
yang memudahkan manusia mengambil keputusan approve/reject — keputusan akhir tetap selalu
di tangan manusia, sesuai checkpoint wajib di setiap fase.

## Apa isi satu file definisi

- **Scope peran** — batas tanggung jawab role tersebut, tidak lebih
- **Batasan akses** — tools apa yang boleh dipakai, terutama status read-only vs read-write
- **Kebijakan retry** — retry sekali kalau QA gagal atau reviewer beri "changes
  requested", lalu berhenti dan diserahkan ke manusia
- **Format output** — struktur artifact yang harus dihasilkan di akhir fase (lihat
  [Layer 3: Artifact Handoff](/id/docs/core-concepts/layer-3))

## Kustomisasi

File-file ini bukan konfigurasi yang dikunci. Kamu bisa mengedit langsung untuk
menyesuaikan gaya kerja tim — misalnya menambah aturan khusus di `implementer.md` seperti
"selalu tulis test untuk setiap fungsi baru".

## Hubungan dengan layer lain

Layer 2 mengonsumsi konteks dari **Layer 1** dan menentukan format artifact yang akan
ditulis ke [Layer 3: Artifact Handoff](/id/docs/core-concepts/layer-3) di setiap akhir fase.
