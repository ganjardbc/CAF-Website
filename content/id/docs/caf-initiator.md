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

CAF mengikuti [Spec-Driven Development](/id/docs/sdd). Agent yang di-generate
`caf-init` menulis dan menghormati sebuah spec: Planner menulis `requirements.md`
(dengan acceptance criteria bernomor) sebelum `tasks.md`, agent implementasi dan
Validator mengecek hasil kerja terhadap criteria itu, dan tidak ada yang mengubah spec
yang sudah disetujui. Semua ini adalah instruksi di dalam file yang di-generate;
`caf-init` tidak mengecek apakah agent mengikutinya.

> CAF Initiator masih pre-1.0 (`v0.1.12`), sudah dipublish ke npm sebagai
> [`caf-initiator`](https://www.npmjs.com/package/caf-initiator). Source:
> [github.com/coderiumid/caf-initiator](https://github.com/coderiumid/caf-initiator).

## Quick start

```bash
# 1. Preview — deteksi stack dan daftar file yang akan ditulis
npx -p caf-initiator caf-init scaffold --dry-run

# 2. Generate draft dan skill CAF (satu ringkasan, satu Enter)
npx -p caf-initiator caf-init scaffold

# 3. Di AI runner kamu (mis. Claude Code), isi TODO-nya
/caf-complete-drafts

# 4. Cek hasilnya, lalu review diff dan commit
npx -p caf-initiator caf-init curate --check-drafts
```

Jalankan dari dalam repository target, atau pakai `--dir <path>`.

![Command caf-init menampilkan scaffold, export, dan curate](/images/caf-cli-2.webp)

## Instalasi

Butuh **Node.js 18 atau lebih baru**.

```bash
npm install -g caf-initiator      # lalu: caf-init <command>
```

Atau jalankan tanpa install, dengan `npx -p caf-initiator caf-init <command>`.

## Apa yang di-generate

```
<repo kamu>/
├── CLAUDE.md                        # konteks project untuk agent (draft)
├── AGENTS.md                        # aturan konkret untuk agent (draft)
├── .caf/
│   ├── tasks/README.md              # konvensi artifact per ticket
│   ├── knowledge/                   # dibuat saat pertama dipakai, bukan oleh Setup
│   │   ├── golden-examples/         # RULES.md yang menunjuk file terbaik kamu (`scaffold golden-examples`)
│   │   └── decisions/               # draft ADR (`scaffold adr`)
│   ├── workflows/
│   │   ├── task-completion.md       # Definition of Done
│   │   ├── piv-workflow.md          # Plan → Implement → Verify
│   │   └── agent-handoff.md         # format artifact
│   └── .generate-manifest.json      # baseline section, ditulis oleh `curate`
└── .claude/
    ├── agents/caf-*.md              # definisi agent
    ├── commands/caf-*.md            # slash command pendamping
    └── skills/caf-*/SKILL.md        # ditulis oleh langkah Skills di `scaffold`
```

Setup juga menambahkan aturan ignore untuk `.caf/discovery/*/` dan `.caf/audits/*/`
ke `.gitignore`.

Folder per ticket di `.caf/tasks/<TICKET-ID>/` (`requirements.md`, `tasks.md`,
`verify-report.md`, ...) ditulis saat runtime oleh agent — CAF Initiator hanya
men-scaffold konvensinya.

## Roster default

Repo baru mendapat lima agent dan lima slash command.

| Agent | Role | Tools | Menulis |
|---|---|---|---|
| `caf-planner` | Mengubah ticket atau request chat menjadi spec: Specify → Clarify → Plan → Tasks. Tidak menyentuh kode | `Read`, `Write`, `Glob`, `Grep` | `requirements.md`, `tasks.md`, opsional `design.md` atau `breakdown.md` |
| `caf-frontend`, `caf-backend` | Implementasi sesuai spec, lalu self-verify | `Read`, `Write`, `Edit`, `Bash` | kode dan `verify-report.md` |
| `caf-validator` | Mengecek setiap acceptance criterion dengan menjalankan buktinya sendiri. Melapor, tidak memperbaiki | `Read`, `Write`, `Bash` | `validate-report.md` |
| `caf-reviewer` | Review kualitatif terhadap spec dan diff. Verdict `APPROVE` / `CHANGES REQUESTED` / `DEFER` | `Read`, `Write`, `Bash` | `review-notes.md`, dan `fix-review-log.md` di mode fix |

| Command | Fungsinya |
|---|---|
| `/caf-plan` | Menjalankan Planner pada sebuah ticket atau pesan chat dan berhenti setelah spec ditulis. Boleh membuat ticket dari `breakdown.md`, satu per satu, hanya setelah dijawab "ya" per ticket dan hanya bila tool tracker terhubung |
| `/caf-run` | Menjalankan seluruh pipeline Delivery dalam satu sesi Claude Code, tanpa Orchestrator (dulu `/caf-run-pipeline`) |
| `/caf-review` | Review penuh sebuah PR, diposting sebagai GitHub PR review |
| `/caf-fix-review` | Menangani komentar review manusia pada sebuah PR |
| `/caf-complete-drafts` | Mengisi `TODO` di draft, dari kode dan jawaban kamu |

`/caf-review` dan `/caf-fix-review` juga nama command komentar PR milik Orchestrator.

### Tidak lagi di-scaffold

Desain spec-driven menghapus beberapa role. Repo baru tidak mendapatkannya, dan
tidak ada yang bisa dipilih di picker agent:

| | Tidak ditulis oleh scaffold baru |
|---|---|
| Agent | `caf-architect` (Planner menulis `design.md` lewat skill `caf-design`), `caf-qa` (diganti `caf-validator`), `caf-implementer` (diganti `caf-frontend` + `caf-backend`), `caf-documentation`, `caf-devops`, `caf-pm`, `caf-ux-designer`, `caf-auditor` |
| Command | `/caf-run-pipeline` (sekarang `/caf-run`), `/caf-plan-ticket` (sekarang `/caf-plan`), `/caf-discovery-start`, `/caf-discovery-to-ticket`, `/caf-audit-scan`, `/caf-audit-to-ticket`, `/caf-design-ticket`, `/caf-qa-check`, `/caf-review-ticket`, `/caf-feature-catalog-sync` |

Repo yang di-scaffold lebih awal tetap memegang semua file yang sudah ada. Tidak ada
file yang dihapus atau ditulis ulang, dan `curate` tetap mengenali kind agent itu dan
men-sync-nya seperti sebelumnya. Klaster Discovery, Audit, dan Release tetap bagian
dari desain CAF, dijalankan manual kasus per kasus; hanya saja tidak lagi di-scaffold.

## Commands

`caf-init` tanpa subcommand hanya mencetak help.

| Command | Fungsinya |
|---|---|
| `caf-init scaffold` | Mendeteksi repo, menampilkan satu ringkasan, lalu menjalankan seluruh rantai setup setelah satu `Proceed?` |
| `caf-init scaffold <target>` | Menjalankan satu bagian saja |
| `caf-init curate` | Mengaudit setup CAF yang sudah ada, lalu menawarkan sync section agent dengan template terbaru |
| `caf-init curate --check-drafts` | Pengecekan read-only atas draft setelah diisi |
| `caf-init curate baseline` | Mencatat section agent saat ini sebagai baseline tracking |
| `caf-init export` | Menyalin definisi agent dan command ke AI runner lain |

Setiap command menerima `--dir <path>` (default: direktori saat ini). `--dry-run`
menampilkan apa yang akan terjadi tanpa menulis.

Command `docs`, yang dulu men-scaffold dokumen referensi opsional di `docs/`, sudah
dihapus. File `docs/` yang sudah ada di repo tidak disentuh dan `curate` tidak lagi
mengauditnya. Setup juga tidak lagi menulis `.caf/knowledge/INDEX.md` (tabel status
dokumen itu) maupun folder kosong `knowledge/decisions/` dan
`knowledge/golden-examples/`: `scaffold adr` dan `scaffold golden-examples` membuat
foldernya saat menulis. Repo yang sudah punya `INDEX.md` tetap menyimpannya; `curate`
mengabaikannya.

### `caf-init scaffold`

`scaffold` tanpa target mendeteksi dulu, dan hanya menanyakan apa yang tidak bisa
disimpulkan:

1. **Detect** (read-only): package manager, monorepo dan app, stack, script, default
   branch dan git host dari repo target, plus ticket tracker.
2. **Tracker**: tepat satu tracker yang punya sinyal dipakai dan alasannya
   ditampilkan; tidak ada atau lebih dari satu membuka picker tanpa pilihan awal.
   Tracker tidak pernah ditebak.
3. **Ringkasan** dalam satu layar (repo, tracker dan alasannya, app golden example,
   agent, file yang dibuat atau dilewati), lalu `Proceed? (Y/n/e)`. Enter lanjut; `e`
   memungkinkan kamu mengubah tracker, app golden example, atau agent, lalu menampilkan
   ringkasan lagi; `n` berhenti tanpa menulis apa pun.

Artinya **1 Enter** bila tracker hanya punya satu sinyal, **2** bila ambigu, **0**
dengan `--yes`. Setelah `Proceed?`, langkah di bawah berjalan tanpa pertanyaan lagi,
dengan pilihan dari ringkasan. File yang sudah ada tidak pernah ditimpa diam-diam:
bila ada yang sudah ada dan berbeda, satu pertanyaan tambahan menawarkan *Skip all*
(default), *Overwrite all*, atau *Choose one by one* (masing-masing default No).

Jalankan langkah satu per satu, dengan pertanyaannya sendiri, lewat
`scaffold <target>` (nama di tabel).

Langkah-langkahnya, berurutan:

| Langkah | Nama target | Output |
|---|---|---|
| Setup | (selalu pertama) | `CLAUDE.md`, `AGENTS.md`, `.caf/tasks/README.md`. Tidak menulis apa pun di `.caf/knowledge/`. Mengecek konfigurasi tool AI yang sudah ada lebih dulu; mendeteksi stack dan tracker |
| Golden Examples | `golden-examples` | Kamu memilih file referensi; menulis `RULES.md` (satu per app) dengan kerangka do/don't. Di monorepo kamu mencentang app yang dipindai (app yang layak dipindai sudah tercentang), dan bisa menjalankan langkah ini lagi nanti untuk app yang belum punya; app yang `RULES.md`-nya sudah ada dilewati |
| ADR | `adr` | Draft ADR untuk keputusan teknis yang sudah terlihat di repo |
| Agents | `agents` | Definisi agent yang kamu pilih, plus slash command pendampingnya |
| Skills | `skills` | `.claude/skills/caf-*/SKILL.md`; menawarkan section pointer `## Skills` untuk definisi agent dari langkah sebelumnya (satu konfirmasi per agent) |
| Task Completion | `task-completion` | `.caf/workflows/task-completion.md` dari script verify di `package.json` |
| Workflow | `workflow` | `piv-workflow.md` dan `agent-handoff.md` dari roster agent |
| AI Draft Completion | `complete-drafts` | Command `/caf-complete-drafts` |

Catatan:

- `scaffold workflow` butuh roster agent; jalankan `scaffold agents` dulu.
- Langkah Skills berjalan setelah Agents, jadi pointer-nya sampai ke agent yang baru
  di-generate. Skill yang sudah ada tidak pernah diganti.
- Agent yang ditawarkan: Planner, Frontend dan Backend, Validator, Reviewer. Di
  monorepo Frontend dan Backend di-assign per app (masing-masing boleh memegang lebih
  dari satu app; agent hasil generate lalu mendaftar semua app di scope-nya dan
  membaca tag app di tiap baris task di `tasks.md`, mis.
  `- [ ] (apps/web) Fix email validation`). Di `SINGLE_REPO` keduanya dua agent
  seluruh-repo. CAF menyarankan mulai dari Planner plus satu agent implementasi.
- Command yang ditulis: `/caf-plan` bersama Planner, `/caf-run` (Planner plus satu
  agent implementasi, hanya remote GitHub), dan `/caf-complete-drafts` dari langkahnya
  sendiri. `/caf-review` dan `/caf-fix-review` (Reviewer) tidak di-generate oleh
  `scaffold` tanpa target, karena keduanya memposting review dan balasan publik di PR;
  `scaffold agents` menawarkannya, default No.
- `/caf-run` di-generate oleh flow kapan pun Planner dan satu agent implementasi ada di
  set. Ringkasan menjelaskan apa yang dilakukannya: bila sukses ia commit, push branch,
  dan membuka PR tanpa bertanya. Bila ditanyakan sendiri (`scaffold agents`),
  `Generate /caf-run?` default Yes dan peringatannya tetap ditampilkan dulu.
- **Hanya GitHub.** `/caf-run` (langkah PR-nya), `/caf-review`, dan `/caf-fix-review`
  memakai CLI `gh` dan PR GitHub. Bila repo punya remote yang bukan GitHub (GitLab,
  Bitbucket, ...), ketiganya tidak ditawarkan dan tidak ditulis, dan ringkasan
  mengatakannya. Repo yang belum punya remote dianggap GitHub.
- Sinyal tracker, dihitung per tracker (git host saja tidak pernah jadi sinyal):
  - Linear: `.linear/`, `LINEAR_API_KEY` di `.env*`, atau referensi `linear.app` di
    dokumen atau konfigurasi repo.
  - Jira: `atlassian.yml`, `JIRA_*` di `.env*`, atau referensi `atlassian.net`.
  - GitHub Issues: `.github/ISSUE_TEMPLATE` **dan** remote GitHub.
  - GitLab Issues: `.gitlab/issue_templates` **dan** remote GitLab.

  README yang menyebut kata "linear" atau "jira" tidak lagi jadi sinyal, dan GitLab
  Issues adalah pilihan baru. Repo yang mengandalkan sebutan di README kini ditanya,
  atau memakai `--tracker`.
- App golden example direkomendasikan bila app itu dijalankan atau di-deploy (script
  `dev`, `start`, `serve`, atau `preview`), stack-nya dikenali, dan punya file source
  sungguhan; library `packages/*` bersama dan package yang hanya berisi config tidak.
  Rekomendasi yang sama dipakai picker (tercentang awal), ringkasan, dan `--yes`.
  `RULES.md` tetap draft.
- Draft ADR tidak pernah otomatis di `scaffold` tanpa target: rekomendasi, `--yes`, dan
  run tanpa TTY semuanya bilang none. Draft dibuat hanya bila kamu mencentang "ADR
  drafts" di editor `e` atau memberi `--adr`. Keputusan yang sudah punya file ADR
  dilewati, bukan di-draft lagi dengan nomor berikutnya.
- Konvensi prompt: setiap prompt punya default, ditandai huruf kapital (`(Y/n)`,
  `(y/N)`); apa pun yang akan menimpa atau menghapus default-nya No.
- Banner: `caf-init` tanpa subcommand dan awal `scaffold` mencetak banner "CAF" huruf
  blok. Banner disembunyikan tanpa TTY, dengan `--yes`, dengan `--no-banner`, dan dengan
  environment variable `CAF_NO_BANNER`; `NO_COLOR` mencetaknya tanpa warna.
- Non-interaktif: dengan `--yes`, atau saat stdin atau stdout bukan TTY, tidak ada
  prompt yang ditampilkan. Bila tracker ambigu, command keluar dengan kode 1 dan
  menyebut `--tracker`.

Opsi:

| Opsi | Deskripsi | Default |
|---|---|---|
| `--dir <path>` | Direktori repo target | direktori saat ini |
| `--dry-run` | Tampilkan hasil deteksi dan ringkasan tanpa menulis apa pun | `false` |
| `--yes` | `scaffold` tanpa target: ambil semua pilihan hasil deteksi atau rekomendasi, tanpa bertanya. Keluar dengan kode 1 (tidak menulis apa pun) bila tracker ambigu. Pada satu target, pertanyaannya memakai default | `false` |
| `--tracker <linear\|jira\|github\|gitlab>` | `scaffold` tanpa target: set tracker alih-alih mendeteksinya | hasil deteksi |
| `--apps <a,b>` | `scaffold` tanpa target: app yang dipindai untuk golden example (path atau slug); `--apps none` tidak memindai app mana pun | app yang direkomendasikan |
| `--adr` | `scaffold` tanpa target: sekaligus men-draft ADR untuk keputusan yang terdeteksi dari stack | off |
| `--agents <list>` | `scaffold` tanpa target: agent yang di-generate, dari `planner,frontend,backend,validator,reviewer` | agent yang direkomendasikan |
| `--no-banner` | Jangan cetak banner (atau set `CAF_NO_BANNER=1`) | banner tampil di TTY |
| `--app <app>` | Batasi ke satu app, lewat path (`apps/api`) atau slug (`api`). Dipakai `golden-examples`, `adr`, `agents`, `task-completion`. Boleh diulang (`--app api --app web`) hanya untuk `scaffold golden-examples`; di tempat lain mengulangnya adalah error | semua app |
| `--all-apps` | Hanya `scaffold golden-examples`: pindai semua app yang terdeteksi tanpa picker app (pertanyaan file mana yang dipakai tetap jalan per app). Tidak bisa digabung dengan `--app` | off |
| `--agent-dir <path>` | Tempat definisi agent dibaca dan ditulis | `.claude/agents` |
| `--command-dir <path>` | Tempat slash command ditulis | `.claude/commands` |
| `--force` | Timpa file yang sudah ada. Target `agents`: definisi agent dan command-nya. Target `skills`: hanya file `SKILL.md`. Edit manual di file yang ditimpa hilang dan manifest `curate` tidak di-update | `false` |
| `--mode <single\|mono>` | Override [repo mode](#repo-mode-monorepo-vs-single_repo) hasil deteksi | auto-detect |
| `--scope <dirs...>` | `SINGLE_REPO`, target `agents`: batasi agent implementasi ke direktori ini | seluruh repo |
| `--role <frontend\|backend>` | `SINGLE_REPO`, target `agents`: generate hanya satu agent implementasi, sebagai `caf-frontend.md` atau `caf-backend.md` | kedua agent |

### `caf-init scaffold skills`

Menulis sembilan skill ke `.claude/skills/<name>/SKILL.md`. Ini juga langkah Skills di `scaffold` tanpa target (tepat setelah Agents); jalankan target-nya sendiri untuk mengulang, misalnya di repo yang di-scaffold lebih awal.

| Skill | Isinya untuk pembaca | Agent yang menunjuknya |
|---|---|---|
| `caf-self-verify` | Command lint, typecheck, test, dan build yang sungguh ada di repo (dulu `caf-verify`) | Frontend, Backend, Validator |
| `caf-scope-discipline` | Tetap di dalam scope task; laporkan yang di luarnya, jangan diperbaiki | Frontend, Backend, Planner, Reviewer |
| `caf-no-guess` | Sebut apa yang dibaca; hal yang tidak diketahui jadi open item, tidak pernah fakta karangan | semua di atas |
| `caf-escalate` | Kapan harus berhenti dan mengembalikan task ke manusia | Frontend, Backend |
| `caf-piv` | Plan, tunggu persetujuan, implement, verify | tidak ada (hanya sesi manual) |
| `caf-spec` | Format `requirements.md`: scope, finding, assumption, pertanyaan terbuka, acceptance criteria dengan baris `Verify:` (`v4`) | Planner |
| `caf-traceability` | Hubungkan tiap acceptance criterion ke task, kode, dan test bernama; satu baris bukti per criterion di `verify-report.md` | Planner, Frontend, Backend, Validator — ditulis sebagai `DRAFT`, jadi belum ada pointer |
| `caf-design` | Format `design.md`, untuk ticket yang melintasi app, mengubah skema, atau mengubah kontrak | Planner |
| `caf-breakdown` | Format `breakdown.md`, usulan memecah request yang berisi lebih dari satu hasil | Planner |

**Bagaimana skill sampai ke pembacanya**

- **Sesi manual.** Claude Code memakai skill lewat `description` di frontmatter-nya,
  jadi prompt coding bebas tetap mendapat aturan PIV, verifikasi, dan scope.
- **Agent CAF.** Definisi agent mendapat section `## Skills` berisi pointer `Read` ke
  file skill. Key `skills:` di frontmatter tidak dipakai karena diabaikan saat agent
  dijalankan dengan `claude --agent`.

**Skill DRAFT**

Skill dengan banner `DRAFT` belum aktif: agent diberi tahu untuk mengabaikannya dan
tidak ada agent yang mendapat pointer ke sana.

- `caf-self-verify` dibangun dari script yang terdeteksi di `package.json`. Kalau salah
  satu dari empat slot tidak punya script, slot itu ditulis sebagai baris `TODO` dan
  skill mendapat banner. Selesaikan baris `TODO` dan hapus seluruh banner (kalimat
  `> DRAFT ...` maupun baris `> Agents: this skill is NOT ready...`) untuk
  mengaktifkannya.
- `caf-traceability` ditulis dengan banner di setiap repo dan tidak punya baris `TODO`.
  Hapus banner setelah kamu menguji skill di run agent sungguhan.
- `caf-spec`, `caf-design`, dan `caf-breakdown` aktif: ditulis tanpa banner dan
  Planner diarahkan ke ketiganya, karena masing-masing lolos pengujian dengan dispatch
  agent sungguhan.

File skill yang sudah ada tidak pernah diganti. Untuk mendapat versi lebih baru, hapus
file-nya dan jalankan `scaffold skills` lagi.

**Pointer di definisi agent yang sudah ada**

- Untuk tiap agent tanpa section `## Skills`, kamu mendapat preview dan konfirmasi per file.
- Penulisan hanya terjadi bila isi baru adalah isi lama plus persis satu section itu.
- Agent yang sudah punya section `## Skills` tidak pernah diedit. Kalau ada pointer
  yang kurang, command menyebutkannya dan kamu menambahkan barisnya sendiri.
- File agent yang namanya bukan kind CAF yang dikenal atau slug app tidak ditawari
  section itu dan tidak diedit.
- Agent yang di-generate `scaffold agents` *setelah* target ini langsung mendapat pointernya.

**Aturan lain**

- `SKILL.md` yang sudah ada tidak pernah ditimpa, kecuali `--force`.
- Skill tidak ditulis bila sudah ada folder dengan nama sama tanpa prefix `caf-`
  (`caf-self-verify/` vs `self-verify/`). Exit code 1.
- Repo yang masih punya `.claude/skills/caf-verify/` membiarkannya: `caf-self-verify`
  ditulis di sebelahnya dan satu catatan menyuruh memindahkan pointer agent secara
  manual, lalu menghapus folder lama.
- `## Skills` tidak di-track `curate`: tidak pernah dilaporkan sebagai drift dan tidak
  pernah ditulis ulang oleh sync.

Agent mengikuti skill dengan keandalan tinggi tapi tidak sempurna. Skill adalah
panduan; enforcement tetap di tahap Validator dan Reviewer.

### `caf-init scaffold complete-drafts`

Men-generate `.claude/commands/caf-complete-drafts.md`, command yang kamu jalankan di
AI runner untuk mengisi `TODO` yang ditinggalkan langkah-langkah lain.

Command ini membuat AI bekerja dalam empat fase: baca repo, laporkan rencana dan
pertanyaannya lalu **berhenti menunggu jawaban kamu**, isi draft, verifikasi. Ia
diinstruksikan untuk:

- mengambil fakta hanya dari kode dan menyebut file-nya (command verifikasi,
  konvensi, aturan konkret);
- tidak pernah mengarang konten milik manusia seperti business context, PRD, alasan
  ADR, atau pilihan golden example. Itu hanya datang dari jawaban kamu; kalau tidak,
  `TODO` tetap;
- hanya mengedit `Role`, `Scope`, dan `Verify Checklist` di definisi agent, tidak
  menyentuh section ter-track, `## Skills`, dan frontmatter;
- hanya mengerjakan skill yang masih punya banner `DRAFT`, dan tidak pernah mengarang
  command verifikasi;
- tidak pernah commit atau push.

Kalau definisi agent sudah ada, langkah ini menawarkan untuk mencatat baseline-nya
lebih dulu. Jawab ya: tanpa baseline yang diambil sebelum AI berjalan, perubahan pada
section ter-track tidak bisa dideteksi sesudahnya.

### `caf-init curate`

`curate` tanpa flag mencetak laporan audit lalu menawarkan sync section agent:
memperbarui yang drift dari template, dan menambah section ter-track yang hilang
(tiap penambahan dikonfirmasi terpisah). Pakai flag untuk menjalankan satu sisi saja.

| Opsi | Deskripsi | Default |
|---|---|---|
| `--dir <path>` | Direktori repo target | direktori saat ini |
| `--agent-dir <path>` | Direktori berisi definisi agent | `.claude/agents` |
| `--audit-only` | Hanya laporan, non-interaktif. Exit code 1 bila ada gap wajib (untuk CI) | `false` |
| `--sync-only` | Lewati laporan dan langsung sync | `false` |
| `--check-drafts` | Pengecekan read-only atas draft yang sudah diisi (lihat di bawah) | `false` |
| `--output <file>` | Simpan juga laporan audit sebagai Markdown | tidak ada |
| `--dry-run` | Bersama `--sync-only` atau `baseline`: tampilkan yang akan terjadi, tanpa tulis dan tanpa prompt | `false` |
| `--yes` | Bersama `baseline`: lewati prompt konfirmasi | `false` |
| `--mode <single\|mono>` | Override repo mode hasil deteksi | auto-detect |

#### File agent mana yang dikenali `curate`

File `.claude/agents/*.md` dikenali dari namanya: kind yang dikenal (`caf-<kind>.md`,
atau `<kind>.md`), atau `<app-slug>.md` untuk app yang terdeteksi `caf-init` (agent
implementasi per app). Nama lain dilewati dan dilaporkan dengan warning — tidak pernah
dibandingkan dengan template, di-sync, di-baseline, atau ditawari section `## Skills`.
Ini berlaku untuk `curate` (audit dan sync), `curate baseline`,
`curate --check-drafts`, dan `scaffold skills`.

- `curate audit`: satu warning `unknown-kind` per file semacam itu; bukan gap, exit code tidak berubah.
- `curate sync`, `curate baseline`: file dibiarkan byte-identik, tidak dapat baseline, dan run mendaftarnya sebagai dilewati.
- `curate --check-drafts`: satu `WARN`, tidak pernah `FAIL`.
- Batas yang diketahui: agent yang kamu tulis sendiri dengan nama sama dengan slug
  app diperlakukan sebagai agent implementasi app itu.

#### Section tracking

Untuk section yang isinya hanya bergantung pada kind agent, `curate` membandingkan isi
aktual dengan template terbaru, sehingga perbaikan template bisa sampai ke agent yang
di-generate lebih awal.

Section yang di-track: `Allowed Tools`, `Input`, `Output`, `Working Pattern (PIV)`,
`Retry Logic`, `What to Look For` (hanya Auditor), dan `Report Format` (Validator,
Reviewer, QA, Auditor).

Tidak di-track: `Role`, `Scope`, `Verify Checklist`, `Constraints`, `Skills`. Section
itu berisi data per-project.

Setiap section ter-track punya hash baseline di `.caf/.generate-manifest.json`.
Membandingkan baseline, file saat ini, dan template saat ini menghasilkan salah satu
dari lima status:

| Status | Arti | Yang dilakukan sync `curate` |
|---|---|---|
| `IN_SYNC` | File sama dengan baseline dan template | tidak ada |
| `DRIFT` | File tidak berubah sejak baseline, template berubah | meng-update section dan baseline |
| `CUSTOMIZATION` | File diedit sejak baseline, template tetap | tidak pernah ditulis; dilaporkan |
| `CONFLICT` | File dan template sama-sama berubah | tidak pernah ditulis; dilaporkan |
| `UNTRACKED` | Belum ada baseline | tidak pernah ditulis; jalankan `curate baseline` |

Hanya `DRIFT` yang pernah ditulis, dan `DRIFT` mensyaratkan file sama persis dengan
baseline-nya. Jadi section yang kamu edit manual tidak mungkin tertimpa.

`Input` agent QA dan Reviewer di monorepo juga menyebut app yang di-assign saat
generate. `curate` membaca daftar itu kembali dari section-nya sendiri, jadi sync
tetap menjaganya. Kalau daftar tidak bisa dibaca dengan pasti (kalimatnya diubah),
section itu tidak pernah dianggap `DRIFT`: dibiarkan dan `curate --sync-only` mendaftarnya
sebagai tidak bisa dibandingkan.

Aturan spec-driven baru sampai ke repo yang sudah ada lewat `## Output`, jadi tiba sebagai
`DRIFT` biasa: workflow spec dan aturan bahasa Planner, aturan spec agent implementasi
dan Reviewer, serta aturan per-criterion Validator.

#### Rollout warning

Beberapa bagian perubahan template tidak pernah sampai ke file agent lewat
`curate sync`: frontmatter, section `## Skills`, dan `## Constraints` milik Planner.
Laporan audit mendaftarnya sebagai warning, ditandai `!`:

| Warning | Kapan | Yang dilakukan |
|---|---|---|
| `tools:` berbeda | List `tools:` di frontmatter agent bukan list yang diberikan template untuk kind-nya (urutan tidak penting) | Edit baris frontmatter secara manual, atau biarkan kalau kamu mengubahnya dengan sengaja |
| `## Constraints` Planner berbeda | Section di `caf-planner.md` bukan teks template | Edit section secara manual ke teks template terbaru, atau biarkan |
| Pointer skill hilang / skill di-rename | Skill aktif yang dipetakan ke kind agent tidak terdaftar di `## Skills`-nya; atau agent masih menunjuk `caf-verify` padahal `caf-self-verify` aktif | Bila ada section `## Skills`: tambah baris pointer secara manual. Bila tidak: jalankan `caf-init scaffold skills` |

Hanya warning: dihitung di baris ringkasan sendiri, bukan gap, dan tidak pernah
mengubah exit code (juga dengan `--audit-only`). Skill yang masih punya banner `DRAFT`
tidak pernah diminta.

Command, skill, `agent-handoff.md`, dan `piv-workflow.md` ditulis sekali dan tidak
di-track: untuk mendapat teks lebih baru di repo yang di-scaffold lebih awal, hapus
file-nya dan jalankan lagi `scaffold agents`, `scaffold skills`, atau `scaffold workflow`.

#### `caf-init curate baseline`

Mencatat isi saat ini dari setiap section untracked sebagai baseline-nya. Ia tidak
pernah mengedit isi file dan tidak mengecek apakah isinya cocok dengan template, jadi
review section-nya dulu.

#### `caf-init curate --check-drafts`

Pengecekan read-only setelah `/caf-complete-drafts` atau edit manual. Exit code 1 pada
`FAIL` apa pun. Tidak bisa digabung dengan `--audit-only` atau `--sync-only`.

| Pengecekan | Level |
|---|---|
| Section agent ter-track berubah atau hilang sejak baseline-nya | `FAIL` |
| Command `<pm> run <script>` menyebut script yang tidak ada di `package.json` terkait | `FAIL` |
| Placeholder `{{...}}` generate-time tersisa (token runtime seperti `{{TICKET-ID}}` boleh) | `FAIL` |
| Path golden-example di tabel `RULES.md` tidak ada | `FAIL` |
| Section `## Skills` agent menunjuk file skill yang tidak ada | `FAIL` |
| Section agent ter-track belum punya baseline, jadi tidak bisa diverifikasi | `WARN` |
| Path file yang dikutip di `CLAUDE.md`, `AGENTS.md`, atau `docs/` tidak ada | `WARN` |
| Banner `DRAFT` hilang dari `CLAUDE.md`, `AGENTS.md`, `RULES.md`, atau file `docs/` | `WARN` |
| Section `## Skills` agent menunjuk skill yang masih punya banner `DRAFT` | `WARN` |
| Skill punya baris `TODO` terbuka tapi tanpa banner `DRAFT` | `WARN` |
| Banner `DRAFT` skill hanya terhapus sebagian, sehingga agent akan mengabaikan skill itu selamanya | `WARN` |
| File agent dengan kind tak dikenal (section-nya tidak dicek) | `WARN` |
| `TODO` yang masih terbuka, per file (di skill: hanya baris yang diawali `TODO`) | `INFO` |

Pengecekan ini mencakup apa yang bisa dibuktikan kode. Apakah isi bisnisnya benar tetap
kamu yang me-review. Frontmatter agent (`tools:`) tidak tercakup baseline; cek di diff.

### `caf-init export`

Menyalin definisi agent Claude Code, slash command, atau keduanya ke AI runner lain,
mengonversi formatnya bila perlu.

| Runner | Agent ke | Command ke | Enforcement scope |
|---|---|---|---|
| OpenCode | `.opencode/agent/` | `.opencode/commands/` | ada bug enforcement yang diketahui |
| Cline | `.cline/agents/` | `.clinerules/workflows/` | hanya mengandalkan kepatuhan model |
| Cursor | `.cursor/agents/` | `.cursor/commands/` | belum divalidasi |
| Kiro | `.kiro/agents/` | `.kiro/steering/` | belum divalidasi |

Hanya Claude Code yang tervalidasi menegakkan batasan tool dan scope agent secara
teknis. Sebelum menulis, command menampilkan peringatan ini dan meminta kamu
mengonfirmasi risikonya (default: No). Kamu juga bisa publish ke folder kustom. Skill
tidak ikut di-export.

| Opsi | Deskripsi | Default |
|---|---|---|
| `--dir <path>` | Direktori repo target | direktori saat ini |
| `--agent-dir <path>` | Direktori sumber definisi agent | `.claude/agents` |
| `--kind <agent\|command\|both>` | Apa yang di-publish | `agent` |
| `--dry-run` | Tampilkan yang akan di-publish tanpa menulis | `false` |
| `--force` | Timpa file yang sudah ada di tujuan | `false` |

`--kind` default-nya hanya `agent`. Pakai `--kind both` (atau `--kind command`) bila
slash command pendamping juga perlu di-publish ulang; kalau tidak, run `--force`
menyegarkan agent dan meninggalkan command lama di tujuan.

## Apa yang dikerjakan agent hasil generate

Ini adalah instruksi di dalam file agent hasil generate. `caf-init` tidak mengecek
apakah agent mengikutinya. Lihat [Spec-Driven Development](/id/docs/sdd) untuk alur
lengkapnya.

### Planner

- Punya `Read`, `Write`, `Glob`, dan `Grep` (dua yang terakhir read-only, jadi ia
  mencari fakta tentang repo sendiri). Tanpa `Edit`, tanpa `Bash`.
- Membaca file yang sudah ada di folder task sebelum menulis apa pun, jadi tidak pernah
  menimpa spec yang sudah disetujui dengan draft.
- Membaca apa yang ia klaim: `Finding:` atau acceptance criterion tentang perilaku
  sebuah file berasal dari file yang ia buka di run itu. Klaim yang bukan dari file
  maupun ticket ditulis `Assumption A-n:` beserta dasarnya.
- Menulis satu perilaku yang teramati per acceptance criterion (`AC-n`), masing-masing
  dengan baris `Verify:`, dan mengakhiri `tasks.md` dengan `## Coverage`, peta dari
  criterion ke task yang melayaninya.
- Menulis `Tidak ada` untuk section yang tidak punya isi, tidak pernah placeholder.
- Tidak menulis `tasks.md` selama pertanyaan `BLOCKING` belum punya `Answer:`. Di run
  ticket tidak ada yang menjawab di chat, jadi ia menulis `Status: NEEDS_CLARIFICATION`
  lalu berhenti; [CAF Orchestrator](/id/docs/caf-orchestrator#clarify-dan-spec-gate)
  mem-push draft dan bertanya di ticket.
- Tidak mengubah spec yang sudah disetujui. Perubahan yang diminta masuk ke
  `verify-report.md` di bawah `## Proposed Spec Changes` dengan `Status: NEEDS_HUMAN`.
- Menulis `design.md` bila ticket melintasi lebih dari satu app atau service, menambah
  atau mengubah skema atau migrasi, atau menambah atau mengubah kontrak antar layer
  (ketiganya tidak terpenuhi: tidak ada `design.md`). Menulis `breakdown.md` dan
  berhenti bila request berisi lebih dari satu hasil yang bisa dikirim dan dipakai
  sendiri-sendiri (satu hasil dengan banyak langkah tetap satu spec).
- Menulis prosa artifact-nya dalam bahasa penulis ticket, dinilai dari judul dan
  kalimat si penulis sendiri, bukan dari teks UI yang dikutip ticket. Kata struktural
  (`Status:`, `AC-n:`, `Verify:`, heading section, `Tidak ada`) tetap seperti di
  template di semua bahasa.
- Memulai pesan akhirnya dengan satu baris polos `Status: <value>`. Nilainya: `DRAFT`,
  `NEEDS_CLARIFICATION`, `APPROVED`, `NEEDS_HUMAN`.

### Agent implementasi (Frontend, Backend)

- Membaca `requirements.md`, `tasks.md`, dan `verify-report.md` (bila ada) sebelum
  mengubah kode apa pun.
- Berhenti dengan `Status: NEEDS_HUMAN` bila spec berstatus `NEEDS_CLARIFICATION` atau
  pertanyaan `BLOCKING` belum punya `Answer:`. `DRAFT` dan `APPROVED` tidak menghentikan.
- Memperlakukan setiap acceptance criterion di scope-nya sebagai kontrak; yang tidak
  bisa dipenuhi dilaporkan, tidak dilewati diam-diam.
- Tidak pernah menulis `requirements.md` atau `tasks.md`.
- Menulis satu baris bukti per criterion di `verify-report.md`, dalam salah satu dari
  lima bentuk: `automated-test`, `command`, `build-only`, `manual`, atau `none`.

### Validator

- Membaca spec, `tasks.md`, dan `verify-report.md`, menjalankan Verify Checklist-nya,
  dan memberi tiap criterion satu status. Ia tidak mengubah kode, test, atau spec.
- `PASS` hanya untuk bukti `automated-test` atau `command` yang dijalankan Validator
  sendiri. `FAIL` bila ia menjalankannya dan hasilnya bertentangan dengan criterion.
  `UNVERIFIED` untuk yang lain (`manual`, `build-only`, tidak ada test bernama, command
  yang tidak boleh ia jalankan, atau tidak ada baris bukti). `UNVERIFIED` tidak pernah
  membuat report menjadi `FAIL`, tapi jumlah dan id-nya selalu ada di baris `Unverified:`.
- Sebuah criterion bisa menyebut pengecekannya sendiri:
  `Verify: command: <command> | expect: <hasil>`. Command dijalankan hanya bila spec
  berstatus `Status: APPROVED`, sebagai satu command atau rantai dengan `&&`. Command
  yang mengandung `;`, `|`, redirect, `$()`, backtick, `sudo`, `rm`, `curl`, `wget`, atau
  `git push` tidak pernah dijalankan dan criterion-nya `UNVERIFIED`. Ini aturan teks di
  definisi agent; [CAF Orchestrator](/id/docs/caf-orchestrator#validator-terbatas)
  menambah allowlist teknis di atasnya.
- Menulis `validate-report.md`:

```markdown
## Validate Report — {TICKET-ID}
Ticket: {TICKET-ID}
Agent: caf-validator
Status: PASS | FAIL | NEEDS_HUMAN
Unverified: {count} — {AC ids, comma-separated, or "none"}

### Acceptance Criteria
| AC | Status | Evidence kind | Evidence |

### Verification Gate
| Command | Result |

### Verification Gate Gaps

### Notes
```

### Reviewer

- Membaca spec, report, `design.md` bila ada, ADR, dan diff.
- Melaporkan perubahan yang tidak dicakup task mana pun sebagai scope deviation, dan
  task yang tidak tercermin di diff sebagai task not done. Mendaftar setiap criterion
  dengan bukti `manual`, `build-only`, `none`, atau tidak ada sebagai
  `needs human check`, tidak pernah sebagai lulus.
- Memperlakukan perubahan pada spec yang sudah disetujui sebagai temuan yang
  memblokir, dan mengangkat setiap entri `## Proposed Spec Changes` ke manusia.
- Tidak menjalankan test lagi dan tidak mengedit kode, test, atau spec. Menulis
  `review-notes.md` dengan baris `Verdict:`.

### `/caf-fix-review`

Tidak pernah mengedit `requirements.md`. Komentar review yang meminta perubahan
tujuan, scope, atau acceptance criterion ditulis sebagai usulan di
`## Proposed Spec Changes` pada `verify-report.md`, dicatat `SKIPPED` dengan catatan
yang diawali `Needs a human decision:`, dan didaftar terpisah.

## Repo yang sudah punya file lama

- **`caf-qa.md`.** `scaffold agents` menambahkan `caf-validator.md` di sebelahnya dan
  tidak pernah menyentuh `caf-qa.md`. CAF Orchestrator memilih gate dari file di
  checkout: dengan `caf-validator.md` ia menjalankan validator, selain itu `caf-qa`.
  Jadi menambahkan `caf-validator.md` memindahkan gate; hapus lagi untuk mempertahankan
  gate lama.
- **`caf-implementer.md`.** Tidak pernah disentuh. `scaffold agents` menambahkan
  `caf-frontend.md` dan `caf-backend.md` di sebelahnya dan mencetak satu catatan bahwa
  Orchestrator hanya me-routing dua itu. Hapus file lama secara manual bila sudah tak dibutuhkan.
- **`caf-run-pipeline.md`.** Tidak pernah disentuh. `caf-run.md` ditulis di sebelahnya
  dengan satu catatan.

## Bekerja dengan CAF Orchestrator

Kamu tidak butuh [CAF Orchestrator](/id/docs/caf-orchestrator) untuk memakai apa yang
di-generate `caf-init`. Agent-nya juga jalan langsung di Claude Code, atau lewat
command `/caf-run` hasil generate.

Kalau kamu memakainya, tiga hal di repo kamu penting:

- **Nama file agent.** Orchestrator memanggil agent berdasarkan nama: `caf-planner`,
  `caf-frontend`, `caf-backend`, `caf-validator` (atau `caf-qa` di repo yang tidak
  punya `caf-validator.md`), `caf-reviewer`, dan `caf-documentation` hanya bila file itu
  ada. Repo yang di-scaffold sekarang tidak punya `caf-documentation`, dan Orchestrator
  melewati tahap itu tanpa gagal. Ia tidak memanggil `caf-implementer`, jadi di repo
  single-package pakai default `caf-frontend` + `caf-backend` (atau `--role`).
- **Format report.** Agent saling menyerahkan pekerjaan lewat file di
  `.caf/tasks/<TICKET-ID>/`, dan Orchestrator mem-parse baris status-nya kata per kata.
  Baris-baris itu ada di section ter-track `Retry Logic` dan `Report Format`; biarkan
  seperti hasil generate.
- **Skill.** Agent yang dijalankan Orchestrator membaca skill lewat pointer `## Skills`,
  sama seperti di tempat lain.

## Repo mode: `MONOREPO` vs `SINGLE_REPO`

Setiap command yang menjalankan deteksi stack lebih dulu menentukan repo mode.

- **`MONOREPO`**: root punya field `workspaces`, `pnpm-workspace.yaml`, `turbo.json`,
  `nx.json`, atau `lerna.json`, atau `apps/*` / `packages/*` berisi `package.json`.
  App-nya adalah package workspace.
- **`SINGLE_REPO`**: selain itu. Ini bukan error. Root repo adalah satu-satunya app.

`--mode single` atau `--mode mono` meng-override deteksi di `scaffold` dan
`curate`. Mode tidak disimpan; berikan lagi di run berikutnya.

Yang berubah di `SINGLE_REPO`:

- Satu `CLAUDE.md` di root; `RULES.md` langsung di `.caf/knowledge/golden-examples/`.
- `scaffold agents` menawarkan `caf-frontend` dan `caf-backend`, keduanya untuk seluruh
  repo, bukan pembagian per app. Command verify adalah script root, tanpa scope.
- `--scope domain,application` membatasi kedua agent ke direktori itu. Setiap direktori
  harus ada.
- `--role frontend` atau `--role backend` hanya men-generate satu agent itu, dengan isi
  yang sama seperti di default. Role adalah pilihan kamu; tidak pernah ditebak dari
  framework. `--role implementer` ditolak.
- `/caf-run` me-routing task berdasarkan header `## Frontend Tasks` / `## Backend Tasks`
  di `tasks.md`, sama seperti Orchestrator.

`--scope` dan `--role` ditolak di `MONOREPO`. Pada `scaffold` tanpa target, pakai bentuk
koma untuk `--scope` supaya direktori tidak terbaca sebagai argumen target.

Package manager berasal dari field `packageManager` di root, lalu dari lockfile. Kalau
tidak ada keduanya, `CLAUDE.md` mendapat `TODO` dan command ber-scope workspace ditulis
sebagai baris `TODO`. Satu pengecualian: command root tanpa scope fallback ke
`npm run <script>`, jadi cek itu.

## Jaminan keamanan

- **File yang sudah ada tidak pernah ditimpa.** Pengecualiannya eksplisit: `--force`,
  dan kasus di bawah.
- **Sync `curate` menulis ulang section hanya bila `DRIFT`**, artinya kamu tidak
  menyentuhnya sejak baseline.
- **Sync `curate` menambah section ter-track yang hilang** hanya setelah kamu
  konfirmasi, section per section.
- **`scaffold skills` menambah section `## Skills` ke agent yang sudah ada** hanya
  setelah konfirmasi kamu, dan hanya bila hasilnya adalah file lama plus section itu.
- **Setup menambahkan aturan ignore-nya ke `.gitignore` yang sudah ada** dan tidak
  menyentuh baris lain.
- **`--dry-run` memakai jalur kode yang sama dengan run sungguhan** dan tidak menulis apa pun.
- **Tidak menebak.** Nilai yang tidak terdeteksi menjadi `TODO` (satu pengecualian:
  fallback `npm run` yang dijelaskan di [Repo mode](#repo-mode-monorepo-vs-single_repo)).
  Placeholder generate-time yang tersisa seperti `{{APP_1}}` membatalkan penulisan.
- **File agent yang tidak dikenal dilewati**, tidak pernah diperlakukan sebagai kind yang dikenal.
- **Tanpa panggilan AI.** Output-nya deterministik.
