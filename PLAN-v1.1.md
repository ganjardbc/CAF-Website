# Plan v1.1 — Dark Mode, Sticky Navbar, Multi-language (EN/ID)

Lanjutan dari `PLAN.md` (v1.0.0). Tiga fitur ini independen satu sama lain dan bisa
dikerjakan secara terpisah/berurutan. Dokumen ini adalah **plan**, belum implementasi —
tidak ada kode yang diubah oleh dokumen ini sendiri.

Keputusan yang sudah diambil bersama user:

- **Locale default: English.** Bahasa Indonesia jadi bahasa tambahan di `/id/*`.
- **Scope i18n: semua halaman** — landing, seluruh 19 halaman docs, legal, about, changelog.

---

## Urutan rekomendasi

1. **Sticky Navbar** — kecil, cepat, tanpa dependency baru. Kerjakan duluan.
2. **Dark Mode** — sedang-besar, menyentuh visual di banyak tempat tapi terisolasi ke
   token warna + beberapa komponen dengan warna hardcoded (SVG, inline style).
3. **Multi-language (i18n)** — paling besar. Effort dominan di penerjemahan konten
   (19 halaman docs + landing + legal), bukan di kode. Kerjakan terakhir.

Alasan urutan ini: dark mode akan lebih mudah diverifikasi kalau navbar sudah sticky
(supaya toggle-nya gampang diakses saat scroll), dan i18n paling masuk akal dikerjakan
setelah visual (dark mode) settle — supaya tidak perlu screenshot ulang 2x lipat (per
locale) selama iterasi dark mode.

---

## 1. Sticky Navbar

**Effort: kecil (~30 menit implementasi + verifikasi visual).**

### Perubahan
- `Navbar.vue`: `<header>` dari `position: static` (default, cuma `border-b`) jadi
  `sticky top-0 z-40`.
- Tambah polish saat discroll: begitu `scrollY > 0`, tambahkan `backdrop-blur` +
  background semi-transparan (atau shadow tipis) supaya ada pemisah visual dari konten
  yang lewat di bawahnya — pola umum di situs dev-tool (termasuk referensi opencode.ai).
  Dideteksi lewat scroll listener sederhana (`useEventListener` atau plain
  `onMounted`/`onUnmounted`).

### Yang perlu dicek ulang
- Dropdown mobile menu (`absolute inset-x-0 top-full z-50`, hasil fix responsif
  sebelumnya) — pastikan masih menempel benar di bawah navbar saat header jadi
  `sticky` (harusnya tidak masalah, `position: sticky` tidak mengubah containing block
  untuk descendant `absolute`).
- Pastikan `z-40` pada header tidak bentrok dengan `z-50` dropdown mobile (dropdown
  harus tetap di atas header saat terbuka — sudah aman karena 50 > 40).

### Tidak ada dependency baru, tidak ada perubahan `package.json`.

---

## 2. Dark Mode

**Effort: sedang-besar.** Kompleksitas utama bukan di banyaknya file, tapi di beberapa
tempat yang pakai warna hardcoded di luar sistem token Tailwind.

### Pendekatan teknis

Alih-alih menambahkan varian `dark:` ke setiap className di ~20 komponen (rework besar,
gampang ada yang kelewat), pakai **CSS custom properties per token**:

1. Definisikan setiap token warna DESIGN.md (`ink`, `canvas`, `canvas-elevated`,
   `hairline`, `hairline-soft`, `body`, `mute`, `faint`, `link`, `link-deep`,
   `link-soft`, `violet`, `cyan`, `pink`, `magenta`, `error`, `error-deep`, `warning`)
   sebagai CSS variable RGB di `:root` (nilai light — sudah ada di `tailwind.config.ts`
   saat ini, tinggal dipindah jadi CSS var).
2. Override semua variable itu di bawah selector `.dark` (nilai gelap — perlu
   ditentukan/dirancang, DESIGN.md saat ini cuma punya sistem light).
3. Ubah `tailwind.config.ts` supaya tiap warna resolve ke
   `rgb(var(--color-ink) / <alpha-value>)` dkk., bukan hex literal.
4. Efeknya: semua utility class yang sudah dipakai di seluruh situs (`bg-canvas`,
   `text-ink`, `border-hairline`, dst) otomatis ikut berubah saat class `.dark`
   ditambahkan ke `<html>` — **tanpa menyentuh markup komponen sama sekali**.

### Modul: `@nuxtjs/color-mode`

Rekomendasi pakai modul ini (bukan bikin toggle manual) supaya:
- Tidak ada FOUC (flash of wrong theme) saat SSR/hydration.
- Preferensi tersimpan otomatis (cookie/localStorage) dan dibaca duluan sebelum render.
- Default mengikuti `prefers-color-scheme` sistem kalau user belum pernah pilih manual.

**Perlu diverifikasi saat implementasi**: kompatibilitas versi dengan Nuxt 4 (pola yang
sama seperti `@nuxt/icon` di v1.0.0 — versi terbaru module belum tentu langsung
kompatibel, mungkin perlu pin versi tertentu).

### Bagian yang TIDAK ikut otomatis berubah (perlu penanganan manual)

Ini yang bikin effort naik ke "sedang-besar", bukan "kecil":

- **`Hero.vue` mesh gradient** — warna ditulis sebagai inline `style` dengan hex
  literal (`#50e3c2`, `#0070f3`, dst), bukan lewat class Tailwind. Perlu dibuat
  reaktif terhadap color mode (opacity/saturation kemungkinan perlu ditata ulang juga
  supaya tetap terlihat elegan di atas background gelap, bukan cuma warna teksnya
  yang diinvert).
- **`PipelineDiagram.vue`** — semua warna SVG (`fill="#171717"`, `stroke="#ebebeb"`,
  `stroke="#8f8f8f"`, dst) ditulis sebagai atribut SVG langsung, bukan class Tailwind.
  Perlu computed binding ke CSS var atau ke state color mode.
- **`public/og-image.png`** — gambar statis, tetap versi light-only. Ini cukup umum
  (OG preview biasanya fixed-theme) dan tidak masuk scope dark mode.
- **`docs-prose` code block styling** (`[[...slug]].vue` `<style>` block) — pakai
  class Tailwind semantik (`bg-hairline-soft`, `text-ink`, dst), jadi harusnya otomatis
  ikut berubah tanpa sentuhan tambahan — cuma perlu verifikasi visual.

### Toggle UI

- Ikon (sun/moon, lucide) di Navbar, di sebelah tombol "View on GitHub".
- Rekomendasi: 2-state (light/dark) untuk implementasi awal, bukan 3-state
  (light/dark/system) — lebih simpel, dan default awal tetap ikut system preference
  sebelum user pertama kali toggle manual (jadi "system" secara efektif adalah default
  behavior, bukan pilihan eksplisit di UI).

### Checklist implementasi (saat dikerjakan)
- [ ] Install & pin `@nuxtjs/color-mode` versi yang kompatibel Nuxt 4
- [ ] Migrasi token warna ke CSS var, tentukan palet gelap (belum ada di DESIGN.md —
      perlu dirancang: canvas gelap biasanya near-black bukan pure black, ink jadi
      near-white, hairline jadi abu gelap redup, dst.)
- [ ] Toggle button di Navbar
- [ ] Rework `Hero.vue` mesh gradient untuk dark
- [ ] Rework `PipelineDiagram.vue` warna SVG untuk dark
- [ ] Screenshot verifikasi tiap halaman di kedua mode (landing + minimal 2-3 docs page
      yang representatif: satu dengan tabel, satu dengan code block, satu dengan FAQ)

---

## 3. Multi-language (i18n) — English (default) + Bahasa Indonesia

**Effort: besar.** Ini bukan cuma soal setup modul — mayoritas waktu ada di
menerjemahkan ulang konten yang sekarang 100% Bahasa Indonesia.

### Modul & strategi routing

- Modul: `@nuxtjs/i18n` (perlu verifikasi versi kompatibel Nuxt 4, sama seperti modul
  lain sebelumnya).
- Strategy: `prefix_except_default` — English di root (`/`, `/docs`, `/about`, dst,
  **URL yang sudah ada sekarang tidak berubah**), Bahasa Indonesia di prefix eksplisit
  (`/id`, `/id/docs`, `/id/about`, dst).
- Locale switcher di Navbar: toggle teks sederhana ("EN" / "ID") atau dropdown kecil,
  pilihan disimpan di cookie supaya kunjungan berikutnya ingat preferensi.

### Dampak ke setiap bagian situs

**UI copy (komponen Vue)** — semua string yang sekarang hardcoded di
`<template>` (Navbar, Footer, Hero, FeatureGrid, CoreComponents, PipelineDiagram, Faq,
halaman about/changelog/legal) perlu dipindah ke file locale (`i18n/locales/en.json`,
`i18n/locales/id.json`), dipanggil lewat `$t()` / `useI18n()`.

**Docs content (`@nuxt/content`)** — ini bagian paling besar secara volume:
- 19 file Markdown di `content/docs/**` (Bahasa Indonesia, versi existing) perlu:
  1. Dipindah/disalin ke struktur locale-aware — opsi paling umum di Nuxt Content v3
     adalah folder per-locale: `content/en/docs/**` dan `content/id/docs/**`.
  2. Konten existing (Bahasa Indonesia) jadi basis untuk `content/id/docs/**`.
  3. Versi **baru** dalam Bahasa Inggris ditulis untuk `content/en/docs/**` (karena
     English jadi default/utama, bukan sekadar terjemahan tempelan — perlu direview
     supaya natural, bukan hasil translate literal).
- `content.config.ts` perlu update collection definition untuk locale-aware source.
- `app/pages/docs/[[...slug]].vue` (catch-all) perlu query collection sesuai locale
  aktif dari `useI18n()`, bukan `queryCollection('docs')` polos seperti sekarang.
- `DocsSidebar.vue` — daftar link hardcoded (judul + path) perlu ikut locale-aware,
  termasuk dropdown mobile-nya.

**Legal, About, Changelog** — halaman `.vue` biasa (bukan content collection), jadi
translasi masuk pola yang sama dengan UI copy: teks dipindah ke locale file, atau
(alternatif) dibuat sebagai page duplikat per-locale kalau kontennya cukup panjang dan
terstruktur (mis. `pages/legal/terms.vue` dan `pages/id/legal/terms.vue`) — perlu
diputuskan saat implementasi mana yang lebih rapi, tergantung seberapa banyak teks legal
yang beda struktur antar bahasa.

**SEO** — `@nuxtjs/i18n` terintegrasi dengan `@nuxtjs/seo`: `hreflang` tag otomatis
kebentuk kalau modul di-setup benar, dan `sitemap.xml` otomatis mencakup kedua set URL
locale. Perlu verifikasi ini jalan (pola yang sama seperti verifikasi sitemap/OG image
di v1.0.0 — build lalu cek isi file yang di-generate).

### Checklist implementasi (saat dikerjakan)
- [ ] Install & pin `@nuxtjs/i18n` versi kompatibel Nuxt 4
- [ ] Setup `i18n.config.ts` — locale `en` (default) + `id`, strategy
      `prefix_except_default`
- [ ] Locale switcher di Navbar
- [ ] Restrukturisasi `content/docs/**` → `content/en/docs/**` +
      `content/id/docs/**`, update `content.config.ts`
- [ ] Update catch-all docs page + `DocsSidebar.vue` untuk locale-aware query/link
- [ ] Ekstrak semua string UI komponen landing/shared ke locale JSON, ganti dengan
      `$t()`
- [ ] Tulis versi Inggris untuk seluruh 19 halaman docs (bukan translate literal —
      tulis ulang natural)
- [ ] Tulis/pindahkan versi Indonesia (dari konten existing) + terjemahkan legal/about/
      changelog
- [ ] Verifikasi `hreflang` + `sitemap.xml` mencakup kedua locale
- [ ] Verifikasi build (`crawlLinks`) berhasil crawl semua route × 2 locale tanpa
      broken link

---

## Pertanyaan/asumsi yang masih terbuka

Ini bukan blocker untuk mulai kerja, tapi baik dikonfirmasi sebelum eksekusi dimulai
supaya tidak perlu rework:

1. **Dark mode: 2-state atau 3-state (+ system)?** Plan ini asumsi 2-state (light/dark
   manual toggle, default awal ikut system). Kalau mau eksplisit ada opsi "System" di
   UI, kasih tahu — sedikit tambahan effort saja.
2. **i18n routing: `prefix_except_default` (English di root) sudah difinalkan** sesuai
   keputusan locale default = English. Kalau ternyata mau kedua locale di-prefix
   (`/en/*` dan `/id/*`, tidak ada yang di root), ini beda konfigurasi kecil di modul.
3. **Siapa yang menulis teks Bahasa Inggris untuk docs?** Plan ini asumsi saya (AI)
   yang menyusun draft versi Inggris berdasarkan konten Indonesia yang sudah ada, lalu
   Anda review. Kalau Anda mau menyiapkan teks Inggris sendiri (lebih presisi dari sisi
   nuansa bisnis/brand), kasih tahu di awal supaya saya tidak menulis draft yang
   terbuang.
