<script setup lang="ts">
useSeoMeta({
  title: 'Privacy Policy',
  description: 'Data apa yang disimpan situs CAF, dan bagaimana kode kamu tetap privat.',
})

definePageMeta({
  layout: 'default',
})
</script>

<template>
  <article class="mx-auto max-w-2xl px-lg py-4xl sm:py-section">
    <h1 class="text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
      Privacy Policy
    </h1>
    <p class="mt-xs text-sm text-mute">Terakhir diperbarui: draf awal, belum dipublikasikan resmi.</p>

    <div class="mt-lg rounded-md border border-hairline bg-hairline-soft px-md py-sm text-sm text-body">
      <strong class="text-ink">Draf.</strong> Halaman ini disusun mengikuti kerangka di
      <code class="rounded-sm bg-canvas-elevated px-[4px] py-[1px] font-mono text-xs">PLAN.md</code>
      dan belum melalui tinjauan hukum. Jangan dijadikan acuan final sebelum direview oleh
      pihak yang berwenang.
    </div>

    <div class="prose-legal mt-xl">
      <h2>1. Kode kamu tidak pernah kami lihat</h2>
      <p>
        Ini poin paling penting: <strong>CAF Orchestrator berjalan di VPS milik kamu
        sendiri</strong>, bukan di server Coderium. Artifact handoff antar fase
        (lihat <NuxtLink to="/docs/core-concepts/layer-3">Layer 3: Artifact Handoff</NuxtLink>)
        cuma file Markdown yang disimpan di repo kamu. Source code project kamu tidak
        pernah dikirim ke, atau disimpan di, infrastruktur Coderium.
      </p>

      <h2>2. Data yang dikumpulkan situs ini</h2>
      <p>
        Situs marketing dan dokumentasi ini (yang sedang kamu baca) saat ini
        <strong>tidak memasang analytics pihak ketiga</strong>. Kalau di masa depan kami
        menambahkan analytics, kami akan memprioritaskan tool privacy-friendly (seperti
        Plausible atau Umami) yang tidak melakukan tracking lintas situs, dan halaman ini
        akan diperbarui untuk menyebutkannya secara eksplisit.
      </p>
      <p>
        Kami tidak mengumpulkan email atau data pribadi lain lewat situs ini — tidak ada
        form newsletter atau pendaftaran akun di v1.0.0.
      </p>

      <h2>3. Kredensial yang kamu simpan sendiri</h2>
      <p>
        Variabel seperti API key tracker atau token Git host (lihat
        <NuxtLink to="/docs/reference/environment-variables">Environment Variables</NuxtLink>)
        disimpan di file <code>.env</code> pada infrastruktur kamu sendiri. Coderium tidak
        pernah menerima atau menyimpan kredensial ini.
      </p>

      <h2>4. Pertanyaan</h2>
      <p>
        Kalau ada pertanyaan soal kebijakan privasi ini, hubungi kami lewat
        <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>.
      </p>
    </div>
  </article>
</template>

<style>
.prose-legal h2 {
  @apply mt-xl text-lg font-semibold text-ink;
}

.prose-legal p {
  @apply mt-md text-base leading-relaxed text-body;
}

.prose-legal a {
  @apply text-link underline underline-offset-2;
}
</style>
