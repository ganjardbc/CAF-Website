---
title: 'Layer 2: Agent Definitions'
description: Role, batas akses, dan retry policy untuk setiap agent di CAF.
---

Layer 2 mendefinisikan siapa mengerjakan apa. Setiap role di pipeline punya file
definisinya sendiri di `.claude/agents/` — di-generate oleh
`caf-init scaffold agents`, sudah dibekali konteks dari
[Layer 1: Project Knowledge Base](/id/docs/core-concepts/layer-1).

## Role yang tersedia

CAF Initiator menawarkan roster untuk dipilih: Planner, Architect, Frontend dan
Backend (per app yang di-assign), agent implementasi tambahan per app, QA, Reviewer,
Documentation, Auditor, PM, dan UX Designer. CAF menyarankan mulai dari Planner plus
satu agent implementasi.

Pipeline CAF Orchestrator menjalankan sebagian dari mereka secara berurutan,
dipanggil berdasarkan nama file:

| File | Role | Tools |
|---|---|---|
| `caf-planner.md` | Menyusun `requirements.md` dan `tasks.md` dari ticket | `Read`, `Write` — hanya artifact, tidak menyentuh kode |
| `caf-frontend.md` / `caf-backend.md` | Menulis kode sesuai plan, di dalam scope-nya sendiri | `Read`, `Write`, `Edit`, `Bash` |
| `caf-qa.md` | Mengecek hasil kerja terhadap acceptance criteria, menjalankan test/build | `Read`, `Bash`, `Write` untuk `qa-report.md` — tidak mengubah kode |
| `caf-reviewer.md` | Me-review diff dan menulis verdict | `Read`, `Bash`, `Write` untuk `review-notes.md` |
| `caf-documentation.md` | Memperbarui dokumentasi yang terdampak perubahan | `Read`, `Write`, `Edit` |

`caf-reviewer.md` **tidak** menggantikan manusia. Verdict-nya memudahkan manusia
mengambil keputusan — keputusan merge selalu ada di tangan manusia.

Di repo single-package, `scaffold agents` menawarkan satu agent implementasi,
`caf-implementer.md`, sebagai ganti pembagian frontend/backend. Orchestrator tidak
me-routing nama file itu; pakai `--role frontend` atau `--role backend` untuk
men-generate agent yang sama sebagai `caf-frontend.md` / `caf-backend.md`.

## Isi sebuah file definisi

- **Role** dan **Scope** — batas tanggung jawab role tersebut
- **Allowed Tools** — tool yang boleh dipakai agent (lihat tabel di atas)
- **Input** / **Output** — artifact yang dibaca dan wajib ditulis (lihat
  [Layer 3: Artifact Handoff](/id/docs/core-concepts/layer-3))
- **Working Pattern (PIV)** dan **Verify Checklist**
- **Retry Logic** dan, untuk QA, Reviewer, dan Auditor, **Report Format** — baris
  status persis yang di-parse CAF Orchestrator
- **Skills** — pointer opsional ke skill CAF (di bawah)
- **Constraints**

## Skills

`caf-init scaffold skills` menulis lima skill universal ke
`.claude/skills/<name>/SKILL.md`: `caf-verify`, `caf-scope-discipline`,
`caf-no-guess`, `caf-escalate`, dan `caf-piv`. Agent membacanya lewat pointer `Read`
di section `## Skills`; sesi Claude Code manual memakainya lewat description-nya.
Skill adalah panduan — enforcement tetap di tahap Verify, QA, dan Reviewer. Lihat
[CAF Initiator](/id/docs/caf-initiator#caf-init-scaffold-skills).

## Kustomisasi

File-file ini bukan konfigurasi yang terkunci. `Role`, `Scope`, `Verify Checklist`,
`Constraints`, dan `Skills` berisi data per proyek dan bebas kamu edit — misalnya
menambah aturan di `caf-backend.md` seperti "selalu tulis test untuk setiap function
baru."

Section lainnya **di-track**: `caf-init curate` membandingkannya dengan template
terbaru supaya perbaikan template bisa sampai ke agent yang di-generate sebelumnya.
Section ter-track yang kamu edit manual akan dilaporkan, tidak pernah ditimpa. Kalau
kamu pakai CAF Orchestrator, biarkan `Retry Logic` dan `Report Format` apa adanya —
Orchestrator mem-parse baris statusnya kata per kata.

## Hubungan dengan layer lain

Layer 2 memakai konteks dari **Layer 1** dan menentukan format artifact yang ditulis
ke [Layer 3: Artifact Handoff](/id/docs/core-concepts/layer-3) di akhir setiap fase.
