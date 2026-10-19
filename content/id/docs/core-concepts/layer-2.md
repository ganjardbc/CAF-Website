---
title: 'Layer 2: Agent Definitions'
description: Role, batas akses, dan retry policy untuk setiap agent di CAF.
---

Layer 2 mendefinisikan siapa mengerjakan apa. Setiap role di pipeline punya file
definisinya sendiri di `.claude/agents/` — di-generate oleh
`caf-init scaffold agents`, sudah dibekali konteks dari
[Layer 1: Project Knowledge Base](/id/docs/core-concepts/layer-1).

## Roster

Roster final CAF adalah lima agent, dipanggil berdasarkan nama file:

| File | Role | Tools |
|---|---|---|
| `caf-planner.md` | Menulis spec dari ticket: `requirements.md`, `tasks.md`, dan `design.md` atau `breakdown.md` bila request membutuhkannya | `Read`, `Write`, `Glob`, `Grep` — hanya artifact, tidak menyentuh kode |
| `caf-frontend.md` / `caf-backend.md` | Menulis kode sesuai spec, di dalam scope-nya sendiri, lalu self-verify | `Read`, `Write`, `Edit`, `Bash` |
| `caf-validator.md` | Mengecek setiap acceptance criterion dengan menjalankan buktinya sendiri; tidak mengubah kode | `Read`, `Write` untuk `validate-report.md`, `Bash` |
| `caf-reviewer.md` | Me-review diff terhadap spec dan menulis verdict | `Read`, `Write` untuk `review-notes.md`, `Bash` |

`caf-reviewer.md` **tidak** menggantikan manusia. Verdict-nya memudahkan manusia
mengambil keputusan — keputusan merge selalu ada di tangan manusia.

Di monorepo, `scaffold agents` meng-assign Frontend dan Backend per app. Di repo
single-package ia menulis dua agent seluruh-repo, `caf-frontend.md` dan
`caf-backend.md`; `--role frontend` atau `--role backend` hanya men-generate salah satunya.

### Role yang diganti dan dibuang

Ini tidak lagi di-scaffold, dan repo baru tidak mendapatkannya. Repo yang di-scaffold
lebih awal tetap memegang file-nya, dan `curate` masih mengenalinya:

- `caf-qa` — diganti `caf-validator`. CAF Orchestrator menjalankan `caf-validator`
  bila repo punya file itu dan fallback ke `caf-qa` bila tidak.
- `caf-architect` — dilipat ke Planner, yang menulis `design.md` lewat skill `caf-design`.
- `caf-implementer` — diganti `caf-frontend` + `caf-backend`.
- `caf-documentation`, `caf-devops`, `caf-pm`, `caf-ux-designer`, `caf-auditor`.
  Orchestrator menjalankan `caf-documentation` hanya bila file itu ada.

File agent yang namanya bukan kind yang dikenal maupun slug app dilewati `curate` dan
dilaporkan sebagai `unknown-kind`.

## Isi sebuah file definisi

- **Role** dan **Scope** — batas tanggung jawab role tersebut
- **Allowed Tools** — tool yang boleh dipakai agent (lihat tabel di atas)
- **Input** / **Output** — artifact yang dibaca dan wajib ditulis (lihat
  [Layer 3: Artifact Handoff](/id/docs/core-concepts/layer-3)). Aturan spec-driven
  tiap agent ada di `Output`
- **Working Pattern (PIV)** dan **Verify Checklist**. Validator dan Reviewer punya pola
  sendiri, karena mereka membaca dan melapor, bukan merencanakan dan mengimplementasikan
- **Retry Logic** dan, untuk Validator, Reviewer, dan QA, **Report Format** — baris
  status persis yang di-parse CAF Orchestrator
- **Skills** — pointer opsional ke skill CAF (di bawah)
- **Constraints**

## Skills

`caf-init scaffold skills` menulis sembilan skill ke `.claude/skills/<name>/SKILL.md`:
`caf-self-verify`, `caf-scope-discipline`, `caf-no-guess`, `caf-escalate`, `caf-piv`,
dan skill spec `caf-spec`, `caf-traceability`, `caf-design`, dan `caf-breakdown`. Agent
membacanya lewat pointer `Read` di section `## Skills`; sesi Claude Code manual
memakainya lewat description-nya. Skill yang masih punya banner `DRAFT` diabaikan agent
(`caf-traceability` lahir seperti itu). Skill adalah panduan — enforcement tetap di
tahap Validator dan Reviewer. Lihat
[CAF Initiator](/id/docs/caf-initiator#caf-init-scaffold-skills).

## Kustomisasi

File-file ini bukan konfigurasi yang terkunci. `Role`, `Scope`, `Verify Checklist`,
`Constraints`, dan `Skills` berisi data per-project dan boleh kamu edit — misalnya
menambah aturan di `caf-backend.md` seperti "selalu tulis test untuk setiap fungsi baru."

Section lainnya **di-track**: `caf-init curate` membandingkannya dengan template
terbaru supaya perbaikan template bisa sampai ke agent yang di-generate lebih awal.
Section ter-track yang kamu edit manual dilaporkan, tidak pernah ditimpa. Kalau kamu
jalan lewat CAF Orchestrator, biarkan `Retry Logic` dan `Report Format` seperti hasil
generate — Orchestrator mem-parse baris status-nya kata per kata.

## Hubungan dengan layer lain

Layer 2 mengonsumsi konteks dari **Layer 1** dan menentukan format artifact yang
ditulis ke [Layer 3: Artifact Handoff](/id/docs/core-concepts/layer-3) di akhir setiap
fase.
