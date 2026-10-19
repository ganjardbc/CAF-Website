---
title: Spec-Driven Development
description: Cara CAF bekerja dari spec tertulis — Planner menulisnya, manusia menyetujuinya, dan setiap agent berikutnya dicek terhadapnya.
---

CAF mengikuti Spec-Driven Development (SDD). Unit kerjanya adalah spec tertulis,
bukan pesan chat. Level yang dituju CAF adalah **spec-first, menuju spec-anchored** —
bukan spec-as-source.

- **Spec-first.** Planner menulis `requirements.md` (hasil, scope, keputusan,
  acceptance criteria, masing-masing dengan baris `Verify:`) sebelum satu baris kode
  ditulis.
- **Spec-anchored.** Setelah disetujui, spec tetap jadi acuan. Task, implementasi,
  validasi, dan review semuanya dicek terhadap acceptance criteria-nya. Agent tidak
  pernah mengubah spec yang sudah disetujui; perubahan yang dibutuhkan diusulkan di
  `verify-report.md` di bawah `## Proposed Spec Changes` dan manusia yang memutuskan.
- **Bukan spec-as-source.** Kode tetap sumber kebenaran untuk perilaku. Spec tidak
  di-generate menjadi kode, dan kode tidak di-generate dari spec.

Review manusia atas pull request tetap wajib. Tidak ada auto-merge.

## Alurnya

```
ticket atau chat
  → Planner      Specify → Clarify → Plan → Tasks
  → spec gate    opsional, manusia menyetujui spec
  → implement    caf-frontend / caf-backend, lalu self-verify
  → Validator    mengecek setiap acceptance criterion
  → Reviewer     review kualitatif terhadap spec dan diff
  → pull request
```

## Yang ditulis Planner

Planner selalu menulis `requirements.md` dan `tasks.md`, dan menulis file ketiga bila
request membutuhkannya.

| File | Isi | Baris `Status:` |
|---|---|---|
| `requirements.md` | Hasil, scope, finding, assumption, keputusan, constraint, pertanyaan terbuka, dan acceptance criteria bernomor `AC-n`, masing-masing dengan baris `Verify:` | Ya |
| `tasks.md` | Task konkret, dibagi di `## Frontend Tasks`, `## Backend Tasks`, dan `## Docs Tasks`, diakhiri `## Coverage`: peta dari tiap criterion ke task yang melayaninya (bukan task) | Tidak |
| `design.md` | Desain teknis. Ditulis hanya bila ticket melintasi lebih dari satu app atau service, menambah atau mengubah skema atau migrasi, atau menambah atau mengubah kontrak antar layer. Ketiganya tidak terpenuhi: tidak ada `design.md` | Tidak |
| `breakdown.md` | Usulan memecah request yang berisi lebih dari satu hasil yang bisa dikirim dan dipakai sendiri-sendiri (item, urutan, dependensi, garis besar acceptance criteria). Satu hasil dengan banyak langkah tidak dipecah; langkahnya masuk `tasks.md` | Tidak |

`design.md` dan `breakdown.md` tidak punya status sendiri: keduanya ikut persetujuan
spec. Formatnya ada di skill `caf-spec`, `caf-design`, dan `caf-breakdown`.

### Status sebuah spec

Baris `Status:` pertama di `requirements.md` bernilai salah satu dari empat:

| Nilai | Arti |
|---|---|
| `DRAFT` | Sudah ditulis, belum disetujui |
| `NEEDS_CLARIFICATION` | Pertanyaan bertanda `BLOCKING` belum dijawab; `tasks.md` tidak ditulis |
| `APPROVED` | Manusia menyetujuinya. Agent tidak lagi mengeditnya |
| `NEEDS_HUMAN` | Run tidak bisa lanjut tanpa keputusan manusia |

### Acceptance criteria dan buktinya

Setiap acceptance criterion menggambarkan satu perilaku yang teramati dan membawa
baris `Verify:` dalam salah satu dari tiga bentuk:

- `automated test` — menyebut file test, atau task yang membuatnya
- `command: <command> | expect: <exit code atau output>`
- `manual` — manusia yang harus mengecek

Agent implementasi lalu menulis satu baris bukti per criterion di `verify-report.md`,
dalam salah satu dari lima bentuk: `automated-test`, `command`, `build-only`,
`manual`, atau `none`. Validator dan Reviewer menilai baris-baris itu.

## Clarify: bertanya, bukan menebak

Planner membaca repo sebelum bertanya. Fakta yang bisa dibaca tidak pernah jadi
pertanyaan, dan klaim yang tidak bisa disumberkan ditulis `Assumption A-n:` beserta
dasarnya. Yang harus diputuskan manusia menjadi pertanyaan, bertanda `BLOCKING` atau
`NON-BLOCKING`.

Selama pertanyaan `BLOCKING` belum punya `Answer:`, `tasks.md` tidak ditulis. Di run
ticket tidak ada yang menjawab di chat, jadi Planner menulis `Status: NEEDS_CLARIFICATION`
lalu berhenti. [CAF Orchestrator](/id/docs/caf-orchestrator#clarify-dan-spec-gate) kemudian
mem-push draft ke branch dan memposting pertanyaannya sebagai komentar di ticket
(`❓ CAF-CLARIFY`). Jawab lewat komentar, picu ticket lagi, dan Planner melanjutkan
draft yang sama.

## Spec gate

Ticket berlabel `spec-approval` (bisa dikonfigurasi) berhenti setelah Planner dengan
Draft PR yang hanya berisi spec. Manusia me-review-nya, mengeditnya di branch bila
perlu, lalu berkomentar `/caf-approve-spec`. Orchestrator hanya mengubah baris `Status:`
menjadi `APPROVED` dan melanjutkan ke implementasi. Tanpa label, pipeline langsung jalan
setelah Planner.

## Spec yang disetujui adalah kontrak

Setelah `requirements.md` berstatus `Status: APPROVED`:

- Tidak ada agent yang menulis ke sana. Agent implementasi tidak pernah menulis
  `requirements.md` atau `tasks.md`; Reviewer memperlakukan perubahan pada spec yang
  disetujui sebagai temuan yang memblokir.
- Spec yang ternyata salah, ambigu, atau mustahil dilaporkan di `verify-report.md` di
  bawah `## Proposed Spec Changes`, dan run berhenti dengan `Status: NEEDS_HUMAN`.
- Komentar review yang meminta perubahan tujuan, scope, atau sebuah criterion
  (`/caf-fix-review`) dicatat sebagai usulan dan ditandai `SKIPPED`, tidak pernah diterapkan.

## Validator dan Reviewer

**Validator** memberi tiap acceptance criterion satu status dengan menjalankan buktinya
sendiri:

| Status | Kapan |
|---|---|
| `PASS` | Bukti `automated-test` atau `command` yang dijalankan Validator sendiri, sesuai dengan criterion |
| `FAIL` | Bukti dijalankan dan hasilnya bertentangan dengan criterion |
| `UNVERIFIED` | Yang lain: `manual`, `build-only`, tidak ada test bernama, command yang tidak boleh dijalankan, atau tidak ada baris bukti |

`UNVERIFIED` tidak pernah membuat report `FAIL`, tapi jumlahnya selalu ada di baris
`Unverified:`. Di pipeline yang dijalankan CAF Orchestrator, report yang menyatakan
`Status: PASS` padahal setiap criterion `UNVERIFIED` diperlakukan sebagai
`NEEDS_HUMAN`: tidak ada yang terbukti.

**Reviewer** membaca bukti dan tidak menjalankan test lagi. Ia melaporkan scope
deviation, task yang belum dikerjakan, criterion yang butuh pengecekan manusia, dan
pelanggaran ADR, lalu mengakhiri dengan `Verdict:` `APPROVE`, `CHANGES REQUESTED`, atau
`DEFER`.

## Bahasa

Planner menulis prosa artifact-nya dalam bahasa penulis ticket, dinilai dari judul dan
kalimat si penulis sendiri, bukan dari teks UI yang dikutip ticket. Kata-kata yang
dibaca agent lain dan Orchestrator tetap di semua bahasa: heading section, `Status:`
beserta nilainya, `AC-n:`, `Verify:`, `Finding:`, `Assumption A-n:`, `Q-n`, `BLOCKING`,
`Answer:`, dan `Tidak ada` (literal untuk section kosong).

## Apa yang ditegakkan dan apa yang tidak

Sebagian besar SDD adalah instruksi yang ditulis ke definisi agent dan skill hasil
generate. `caf-init` tidak mengecek apakah agent mengikutinya. Yang ditegakkan
Orchestrator lewat kode: berhenti pada `NEEDS_CLARIFICATION` atau pertanyaan `BLOCKING`
yang belum dijawab, spec gate dan `/caf-approve-spec`, ringkasan acceptance criteria di
PR, dan allowlist command validator.
