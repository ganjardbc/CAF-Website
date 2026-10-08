---
title: CAF Initiator
description: CLI caf-init — mendeteksi stack kamu dan menulis knowledge base, agent, command, dan skill CAF.
---

CAF Initiator menyiapkan sebuah repository untuk CAF. CLI-nya, `caf-init`,
mendeteksi stack, package manager, dan ticket tracker, lalu menulis file awal CAF:
knowledge base, definisi agent, dokumen workflow, slash command, dan skill.

`caf-init` tidak pernah memanggil model AI. Semua yang ditulisnya adalah draft
deterministik dari apa yang terdeteksi; apa pun yang tidak terdeteksi dibiarkan
sebagai `TODO`, tidak pernah ditebak.

> CAF Initiator masih pre-1.0 (`v0.1.9`), sudah dipublish ke npm sebagai
> [`caf-initiator`](https://www.npmjs.com/package/caf-initiator). Source:
> [github.com/coderiumid/caf-initiator](https://github.com/coderiumid/caf-initiator).

## Quick start

```bash
# 1. Preview — deteksi stack dan daftar file yang akan ditulis
npx -p caf-initiator caf-init scaffold --dry-run

# 2. Generate draft (konfirmasi sebelum tiap langkah)
npx -p caf-initiator caf-init scaffold

# 3. Opsional: tambahkan skill CAF
npx -p caf-initiator caf-init scaffold skills

# 4. Di AI runner kamu (mis. Claude Code), isi TODO-nya
/caf-complete-drafts

# 5. Cek hasilnya, lalu review diff dan commit
npx -p caf-initiator caf-init curate --check-drafts
```

Jalankan dari dalam repository target, atau pakai `--dir <path>`.

## Instalasi

Butuh **Node.js 18 atau lebih baru**.

```bash
npm install -g caf-initiator      # lalu: caf-init <command>
```

Atau jalankan tanpa install, dengan `npx -p caf-initiator caf-init <command>`.

## Apa yang di-generate

```
<repo kamu>/
├── CLAUDE.md                        # konteks proyek untuk agent (draft)
├── AGENTS.md                        # aturan konkret untuk agent (draft)
├── .caf/
│   ├── tasks/README.md              # konvensi artifact per ticket
│   ├── knowledge/
│   │   ├── INDEX.md                 # status reference docs opsional
│   │   ├── golden-examples/         # RULES.md yang menunjuk file terbaik kamu
│   │   └── decisions/               # draft ADR
│   ├── workflows/
│   │   ├── task-completion.md       # Definition of Done
│   │   ├── piv-workflow.md          # Plan → Implement → Verify
│   │   └── agent-handoff.md
│   └── .generate-manifest.json      # baseline section, ditulis oleh `curate`
└── .claude/
    ├── agents/caf-*.md              # definisi agent
    ├── commands/caf-*.md            # slash command pendamping
    └── skills/caf-*/SKILL.md        # hanya dengan `scaffold skills`
```

Setup juga menambahkan aturan ignore untuk `.caf/discovery/*/` dan `.caf/audits/*/`
ke `.gitignore`.

Folder per ticket di `.caf/tasks/<TICKET-ID>/` (`requirements.md`, `tasks.md`,
`verify-report.md`, ...) ditulis saat runtime oleh agent — CAF Initiator hanya
men-scaffold konvensinya.

## Commands

`caf-init` tanpa subcommand mencetak help.

| Command | Fungsinya |
|---|---|
| `caf-init scaffold` | Menjalankan seluruh rantai setup, konfirmasi di tiap langkah |
| `caf-init scaffold <target>` | Menjalankan satu bagiannya saja |
| `caf-init curate` | Audit setup CAF yang sudah ada, lalu menawarkan sync section agent dengan template terbaru |
| `caf-init curate --check-drafts` | Pengecekan read-only atas draft setelah diisi |
| `caf-init curate baseline` | Merekam section agent saat ini sebagai baseline tracking |
| `caf-init docs` | Scaffold reference docs opsional di `docs/` |
| `caf-init export` | Menyalin definisi agent dan command ke AI runner lain |

Semua command menerima `--dir <path>` (default: direktori saat ini). `--dry-run`
menampilkan apa yang akan terjadi tanpa menulis apa pun.

### `caf-init scaffold`

`scaffold` tanpa target menjalankan langkah-langkah ini secara berurutan, bertanya
sebelum tiap langkah setelah Setup:

| Langkah | Nama target | Output |
|---|---|---|
| Setup | (selalu pertama) | `CLAUDE.md`, `AGENTS.md`, `.caf/tasks/README.md`, `.caf/knowledge/INDEX.md`. Mengecek config AI tool yang sudah ada dulu; mendeteksi stack dan tracker |
| Golden Examples | `golden-examples` | Kamu memilih file referensi; menulis `RULES.md` dengan kerangka do/don't |
| ADR | `adr` | Draft ADR untuk keputusan teknis yang sudah terlihat di repo |
| Agents | `agents` | Definisi agent yang kamu pilih, plus slash command pendampingnya |
| Task Completion | `task-completion` | `.caf/workflows/task-completion.md` dari script verify di `package.json` |
| Workflow | `workflow` | `piv-workflow.md` dan `agent-handoff.md` dari roster agent |
| AI Draft Completion | `complete-drafts` | Command `/caf-complete-drafts` |

Ada dua target lagi yang hanya jalan kalau disebut eksplisit:

| Target | Output | Kenapa tidak masuk rantai |
|---|---|---|
| `skills` | `.claude/skills/caf-*/SKILL.md` | Ia menawarkan untuk mengedit definisi agent yang sudah ada |
| `feature-catalog-sync` | Command `/caf-feature-catalog-sync` | Katalognya perlu review manual sebelum bisa dipakai |

Catatan:

- `scaffold workflow` butuh roster agent; jalankan `scaffold agents` dulu.
- Agent yang ditawarkan: Planner, Architect, Frontend dan Backend (per app yang
  di-assign), agent implementasi tambahan per app, QA, Reviewer, Documentation,
  Auditor, PM, UX Designer. CAF menyarankan mulai dari Planner plus satu agent
  implementasi.
- Frontend dan Backend masing-masing bisa di-assign lebih dari satu app. Agent yang
  di-generate lalu mencantumkan semua app di scope-nya dan membaca tag app di tiap
  baris task di `tasks.md` (`- [ ] (apps/web) Fix email validation`).
- Tracker dideteksi dari `.linear/`, `atlassian.yml`, atau penyebutan di README.
  Kalau tidak ketemu, kamu ditanya (Linear, Jira, GitHub Issues); tidak pernah
  di-default diam-diam.

Opsi:

| Option | Deskripsi | Default |
|---|---|---|
| `--dir <path>` | Direktori repo target | direktori saat ini |
| `--dry-run` | Tampilkan hasil deteksi tanpa menulis apa pun | `false` |
| `--app <app-path>` | Batasi ke satu app. Dipakai `golden-examples`, `adr`, `agents`, `task-completion` | semua app |
| `--agent-dir <path>` | Tempat definisi agent dibaca dan ditulis | `.claude/agents` |
| `--command-dir <path>` | Tempat slash command ditulis | `.claude/commands` |
| `--force` | Timpa file yang sudah ada. Target `agents`: definisi agent dan command-nya. Target `skills`: hanya file `SKILL.md`. Edit manual di file yang ditimpa akan hilang dan manifest `curate` tidak diperbarui | `false` |
| `--mode <single\|mono>` | Override [repo mode](#repo-mode-monorepo-vs-single_repo) yang terdeteksi | auto-detect |
| `--scope <dirs...>` | `SINGLE_REPO`, target `agents`: batasi agent implementasi ke direktori ini | seluruh repo |
| `--role <implementer\|frontend\|backend>` | `SINGLE_REPO`, target `agents`: role dan nama file untuk satu agent implementasi | `implementer` |

### `caf-init scaffold skills`

Menulis lima skill universal ke `.claude/skills/<name>/SKILL.md`.

| Skill | Apa yang disampaikan ke pembacanya | Agent yang menunjuk ke skill ini |
|---|---|---|
| `caf-verify` | Command lint, typecheck, test, dan build yang benar-benar ada di repo | agent implementasi, QA |
| `caf-scope-discipline` | Tetap di dalam scope task; laporkan yang di luar scope, jangan diperbaiki | agent implementasi, Planner, Architect, Reviewer, Documentation |
| `caf-no-guess` | Kutip apa yang kamu baca; hal yang tidak diketahui jadi open item, bukan fakta karangan | semua di atas |
| `caf-escalate` | Kapan harus berhenti dan mengembalikan task ke manusia | agent implementasi |
| `caf-piv` | Plan, tunggu persetujuan, implement, verify | tidak ada (khusus sesi manual) |

Agent Auditor, PM, dan UX Designer tidak mendapat skill.

**Bagaimana skill sampai ke pembacanya**

- **Sesi manual.** Claude Code mengambil skill lewat `description` di frontmatter-nya,
  jadi prompt coding bebas pun tetap dapat aturan PIV, verifikasi, dan scope.
- **Agent CAF.** Definisi agent mendapat section `## Skills` berisi pointer `Read`
  ke file skill. Key frontmatter `skills:` tidak dipakai karena diabaikan saat agent
  dijalankan dengan `claude --agent`.

**Skill DRAFT**

`caf-verify` dibangun dari script yang terdeteksi di `package.json`. Kalau salah
satu dari empat slot tidak punya script, slot itu ditulis sebagai baris `TODO` dan
skill-nya diberi banner `DRAFT`. Selama banner itu ada:

- agent diberi tahu untuk mengabaikan skill tersebut, dan
- tidak ada agent yang mendapat pointer ke sana.

Untuk mengaktifkannya, selesaikan baris `TODO` dan hapus seluruh banner: kalimat
`> DRAFT ...` sekaligus baris `> Agents: this skill is NOT ready...`.

**Pointer di definisi agent yang sudah ada**

- Untuk tiap agent tanpa section `## Skills`, kamu dapat preview dan konfirmasi per
  file.
- Penulisan hanya terjadi kalau konten baru = konten lama plus persis satu section
  itu.
- Agent yang sudah punya section `## Skills` tidak pernah diedit. Kalau ada pointer
  yang kurang, command menyebutkannya dan kamu tambahkan sendiri barisnya.
- File agent yang namanya bukan kind CAF yang dikenal ditanya dengan default **No**.
- Agent yang di-generate `scaffold agents` *setelah* target ini mendapat pointernya
  otomatis.

**Aturan lain**

- `SKILL.md` yang sudah ada tidak pernah ditimpa, kecuali pakai `--force`.
- Skill tidak ditulis kalau sudah ada folder dengan nama yang sama tanpa prefix
  `caf-` (`caf-verify/` vs `verify/`). Exit code 1.
- `## Skills` tidak di-track oleh `curate`: tidak pernah dilaporkan sebagai drift dan
  tidak pernah ditulis ulang oleh sync.

Agent mengikuti skill dengan reliabilitas tinggi tapi tidak sempurna. Skill adalah
panduan; enforcement tetap di tahap Verify, QA, dan Reviewer.

### `caf-init scaffold complete-drafts`

Men-generate `.claude/commands/caf-complete-drafts.md`, command yang kamu jalankan
di AI runner untuk mengisi `TODO` yang ditinggalkan langkah-langkah lain.

Command ini membuat AI bekerja dalam empat fase: baca repo, laporkan rencana dan
pertanyaannya lalu **berhenti menunggu jawaban kamu**, isi draft, verifikasi. AI
diinstruksikan untuk:

- mengambil fakta hanya dari kode dan menyebut file sumbernya (verification command,
  konvensi, aturan konkret);
- tidak pernah mengarang konten milik manusia seperti konteks bisnis, PRD, alasan
  ADR, atau pilihan golden example. Itu hanya datang dari jawaban kamu; kalau tidak
  ada, `TODO`-nya tetap;
- hanya mengedit `Role`, `Scope`, dan `Verify Checklist` di definisi agent, tanpa
  menyentuh section ter-track, `## Skills`, dan frontmatter;
- hanya mengerjakan skill yang masih punya banner `DRAFT`, dan tidak pernah
  mengarang verification command;
- tidak pernah commit atau push.

Kalau definisi agent sudah ada, langkah ini menawarkan untuk merekam baseline-nya
dulu. Jawab ya: tanpa baseline yang diambil sebelum AI jalan, section ter-track yang
berubah tidak bisa dideteksi setelahnya.

### `caf-init curate`

`curate` tanpa flag mencetak laporan audit lalu menawarkan sync section agent:
memperbarui yang drift dari template, dan menambahkan section ter-track yang belum
ada (tiap penambahan dikonfirmasi terpisah). Pakai flag untuk menjalankan satu sisi
saja.

| Option | Deskripsi | Default |
|---|---|---|
| `--dir <path>` | Direktori repo target | direktori saat ini |
| `--agent-dir <path>` | Direktori berisi definisi agent | `.claude/agents` |
| `--audit-only` | Laporan saja, non-interaktif. Exit code 1 kalau ada gap wajib (untuk CI) | `false` |
| `--sync-only` | Lewati laporan, langsung ke sync | `false` |
| `--check-drafts` | Pengecekan read-only atas draft yang sudah diisi (lihat di bawah) | `false` |
| `--output <file>` | Simpan juga laporan audit sebagai Markdown | none |
| `--dry-run` | Dengan `--sync-only` atau `baseline`: tampilkan apa yang akan terjadi, tanpa menulis, tanpa prompt | `false` |
| `--yes` | Dengan `baseline`: lewati prompt konfirmasi | `false` |
| `--mode <single\|mono>` | Override repo mode yang terdeteksi | auto-detect |

#### Section tracking

Untuk section yang kontennya hanya bergantung pada kind agent, `curate`
membandingkan konten aktual dengan template terbaru, supaya perbaikan template bisa
sampai ke agent yang di-generate sebelumnya.

Section yang di-track: `Allowed Tools`, `Input`, `Output`, `Working Pattern (PIV)`,
`Retry Logic`, `What to Look For` (hanya Auditor), dan `Report Format` (Auditor,
Reviewer, QA).

Tidak di-track: `Role`, `Scope`, `Verify Checklist`, `Constraints`, `Skills`. Isinya
data per proyek.

Tiap section ter-track punya hash baseline di `.caf/.generate-manifest.json`.
Perbandingan baseline, file saat ini, dan template saat ini menghasilkan salah satu
dari lima status:

| Status | Arti | Apa yang dilakukan `curate` sync |
|---|---|---|
| `IN_SYNC` | File cocok dengan baseline dan template | tidak ada |
| `DRIFT` | File tidak berubah sejak baseline, template berubah | memperbarui section dan baseline |
| `CUSTOMIZATION` | File diedit sejak baseline, template tidak berubah | tidak pernah ditulis; dilaporkan |
| `CONFLICT` | File dan template sama-sama berubah | tidak pernah ditulis; dilaporkan |
| `UNTRACKED` | Belum ada baseline | tidak pernah ditulis; jalankan `curate baseline` |

Hanya `DRIFT` yang pernah ditulis, dan `DRIFT` mensyaratkan file persis sama dengan
baseline-nya. Jadi section yang kamu edit manual tidak akan pernah tertimpa.

> **Known issue.** Dua section bisa terbaca `DRIFT` tepat setelah `curate baseline`,
> padahal tidak ada yang mengubah template:
>
> - `Input` milik agent QA dan Reviewer di monorepo. Sync akan menggantinya dengan
>   versi generik tanpa nama app.
> - `Working Pattern (PIV)` milik agent PM dan UX Designer. Sync akan menggantinya
>   dengan kalimat generik.
>
> Jalankan `curate --sync-only --dry-run` dulu dan review apa yang akan diubah.

#### `caf-init curate baseline`

Merekam konten saat ini dari setiap section yang untracked sebagai baseline-nya.
Tidak pernah mengedit isi file dan tidak mengecek apakah kontennya cocok dengan
template, jadi review section-nya dulu.

#### `caf-init curate --check-drafts`

Pengecekan read-only setelah `/caf-complete-drafts` atau edit manual. Exit code 1
kalau ada `FAIL`. Tidak bisa digabung dengan `--audit-only` atau `--sync-only`.

| Pengecekan | Level |
|---|---|
| Section agent ter-track berubah atau dihapus sejak baseline-nya | `FAIL` |
| Command `<pm> run <script>` menyebut script yang tidak ada di `package.json` terkait | `FAIL` |
| Masih ada placeholder generate-time `{{...}}` (token runtime seperti `{{TICKET-ID}}` tidak masalah) | `FAIL` |
| Path golden example di tabel `RULES.md` tidak ada | `FAIL` |
| Section `## Skills` sebuah agent menunjuk ke file skill yang tidak ada | `FAIL` |
| Section agent ter-track tidak punya baseline, jadi tidak bisa diverifikasi | `WARN` |
| Path file yang dikutip di `CLAUDE.md`, `AGENTS.md`, atau `docs/` tidak ada | `WARN` |
| Banner `DRAFT` sudah hilang dari `CLAUDE.md`, `AGENTS.md`, sebuah `RULES.md`, atau file `docs/` | `WARN` |
| Section `## Skills` sebuah agent menunjuk ke skill yang masih punya banner `DRAFT` | `WARN` |
| Skill punya baris `TODO` terbuka tapi tanpa banner `DRAFT` | `WARN` |
| Banner `DRAFT` sebuah skill baru dihapus sebagian, sehingga agent akan mengabaikan skill itu selamanya | `WARN` |
| `TODO` yang masih terbuka, per file (di skill: hanya baris yang diawali `TODO`) | `INFO` |

Pengecekan ini mencakup apa yang bisa diverifikasi kode. Benar-tidaknya konten
bisnis tetap kamu yang review. Frontmatter agent (`tools:`) tidak tercakup baseline;
cek di diff.

### `caf-init docs`

Scaffold reference docs opsional. Tidak ada yang wajib untuk pipeline CAF, file yang
sudah ada tidak pernah ditimpa, dan mode interaktif bertanya per item.

| Item (`--include`) | File |
|---|---|
| `product` | `docs/product/prd.md` |
| `architecture` | `docs/architecture/system-overview.md` |
| `schema` | `docs/schema/erd.md` |
| `testing-strategy` | `docs/testing-strategy.md` |
| `api-contract` | `docs/api-contract.md` (hanya ditawarkan kalau frontend dan backend adalah app terpisah di repo yang sama) |
| `--feature <name...>` | `docs/product/features/<name>.md` |

Juga menerima `--dir`, `--dry-run`, dan `--mode`.

### `caf-init export`

Menyalin definisi agent Claude Code, slash command, atau keduanya ke AI runner lain,
dengan konversi format kalau perlu.

| Runner | Agent ke | Command ke | Enforcement scope |
|---|---|---|---|
| OpenCode | `.opencode/agent/` | `.opencode/commands/` | ada bug enforcement yang diketahui |
| Cline | `.cline/agents/` | `.clinerules/workflows/` | hanya mengandalkan kepatuhan model |
| Cursor | `.cursor/agents/` | `.cursor/commands/` | belum divalidasi |
| Kiro | `.kiro/agents/` | `.kiro/steering/` | belum divalidasi |

Hanya Claude Code yang tervalidasi benar-benar meng-enforce batasan tool dan scope
agent secara teknis. Sebelum menulis, command menampilkan peringatan ini dan meminta
kamu mengonfirmasi risikonya (default: No). Kamu juga bisa publish ke folder custom.
Skill tidak ikut di-export.

| Option | Deskripsi | Default |
|---|---|---|
| `--dir <path>` | Direktori repo target | direktori saat ini |
| `--agent-dir <path>` | Direktori sumber definisi agent | `.claude/agents` |
| `--kind <agent\|command\|both>` | Apa yang di-publish | `agent` |
| `--dry-run` | Tampilkan apa yang akan di-publish tanpa menulis | `false` |
| `--force` | Timpa file yang sudah ada di tujuan | `false` |

`--kind` default-nya hanya `agent`. Pakai `--kind both` (atau `--kind command`)
kalau slash command pendamping juga perlu di-publish ulang; kalau tidak, run
`--force` memperbarui agent tapi meninggalkan command lama di tujuan.

## Bekerja dengan CAF Orchestrator

Kamu tidak butuh [CAF Orchestrator](/id/docs/caf-orchestrator) untuk memakai hasil
generate `caf-init`. Agent-nya juga bisa jalan langsung di Claude Code, atau lewat
command `/caf-run-pipeline` yang di-generate.

Kalau kamu memakainya, ada tiga hal di repo kamu yang penting:

- **Nama file agent.** Orchestrator memanggil agent berdasarkan nama: `caf-planner`,
  `caf-frontend`, `caf-backend`, `caf-qa`, `caf-reviewer`, `caf-documentation`. Ia
  tidak memanggil `caf-implementer`, jadi di repo single-package generate agent
  implementasi dengan `--role frontend` atau `--role backend` (lihat
  [Repo mode](#repo-mode-monorepo-vs-single_repo)).
- **Format report.** Agent serah-terima lewat file di `.caf/tasks/<TICKET-ID>/`, dan
  Orchestrator mem-parse baris statusnya kata per kata. Baris itu ada di section
  ter-track `Retry Logic` dan `Report Format`; biarkan apa adanya.
- **Skills.** Agent yang dijalankan Orchestrator membaca skill lewat pointer
  `## Skills`, sama seperti di tempat lain.

## Repo mode: `MONOREPO` vs `SINGLE_REPO`

Setiap command yang menjalankan deteksi stack lebih dulu menentukan repo mode.

- **`MONOREPO`**: root punya field `workspaces`, `pnpm-workspace.yaml`,
  `turbo.json`, `nx.json`, atau `lerna.json`, atau `apps/*` / `packages/*` berisi
  `package.json`. App-nya adalah workspace package.
- **`SINGLE_REPO`**: selain itu. Ini bukan error. Root repo adalah satu-satunya app.

`--mode single` atau `--mode mono` meng-override deteksi di `scaffold`, `docs`, dan
`curate`. Mode tidak disimpan; berikan lagi di run berikutnya.

Yang berubah di `SINGLE_REPO`:

- Satu `CLAUDE.md` di root; `RULES.md` langsung di `.caf/knowledge/golden-examples/`.
- `scaffold agents` menawarkan satu agent implementasi, `caf-implementer`, sebagai
  ganti pembagian frontend/backend. Verify command-nya adalah script root, tanpa
  scope workspace.
- `--scope domain,application` membatasi agent itu ke direktori tersebut. Semua
  direktori harus ada.
- `--role frontend` atau `--role backend` menulis agent yang sama sebagai
  `caf-frontend.md` atau `caf-backend.md`. Pakai ini kalau proyek jalan lewat CAF
  Orchestrator, yang hanya me-routing dua nama file itu. Role adalah pilihan kamu;
  tidak pernah disimpulkan dari framework.

`--scope` dan `--role` ditolak di `MONOREPO`. Dengan `scaffold` tanpa target, pakai
bentuk koma untuk `--scope` supaya direktorinya tidak terbaca sebagai argumen target.

Package manager diambil dari field `packageManager` di root, lalu dari lockfile.
Kalau dua-duanya tidak ada, `CLAUDE.md` mendapat `TODO` dan command ber-scope
workspace ditulis sebagai baris `TODO`. Satu pengecualian: command root tanpa scope
fallback ke `npm run <script>`, jadi cek yang itu.

## Jaminan keamanan

- **File yang sudah ada tidak pernah ditimpa.** Pengecualiannya eksplisit: `--force`,
  dan kasus-kasus di bawah.
- **`curate` sync menulis ulang section hanya kalau statusnya `DRIFT`**, artinya kamu
  tidak menyentuhnya sejak baseline.
- **`curate` sync menambahkan section ter-track yang hilang** hanya setelah kamu
  konfirmasi, section per section.
- **`scaffold skills` menambahkan section `## Skills` ke agent yang sudah ada** hanya
  setelah konfirmasi kamu, dan hanya kalau hasilnya adalah file lama plus satu
  section itu.
- **Setup menambahkan aturan ignore ke `.gitignore` yang sudah ada** tanpa menyentuh
  baris lain.
- **`--dry-run` memakai code path yang sama dengan run sungguhan** dan tidak menulis
  apa pun.
- **Tidak menebak.** Nilai yang tidak terdeteksi jadi `TODO` (satu pengecualian:
  fallback `npm run` yang dijelaskan di
  [Repo mode](#repo-mode-monorepo-vs-single_repo)). Placeholder generate-time yang
  tersisa seperti `{{APP_1}}` membatalkan penulisan.
- **Tidak ada pemanggilan AI.** Output-nya deterministik.
