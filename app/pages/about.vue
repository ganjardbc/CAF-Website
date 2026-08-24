<script setup lang="ts">
useSeoMeta({
  title: 'About',
  description: 'CAF dibuat oleh Coderium — kenapa dan untuk masalah apa.',
})

definePageMeta({
  layout: 'default',
})
</script>

<template>
  <article class="mx-auto max-w-2xl px-lg py-4xl sm:py-section">
    <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
      About
    </span>
    <h1 class="mt-xs text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
      Dibuat oleh Coderium
    </h1>

    <div class="prose-legal mt-lg">
      <p>
        CAF (Coderium Agent Framework) dibuat dan dirawat oleh <strong>Coderium</strong>,
        studio yang membangun tooling developer dengan fokus pada agentic coding yang
        tetap bisa dipercaya — bukan cuma cepat.
      </p>

      <h2>Kenapa CAF dibuat</h2>
      <p>
        Banyak agent coding tool yang ada sekarang punya scope sempit (cuma bantu satu
        bagian kecil dari siklus development) atau punya governance yang longgar
        (langsung auto-merge tanpa jaminan review manusia). CAF dibuat untuk mengisi
        celah itu: cakupan implementasi yang luas — dari ticket sampai PR — dipadukan
        dengan governance ketat di setiap fase.
      </p>
      <p>
        Kami percaya agent AI bisa mempercepat development tanpa mengorbankan kontrol.
        Itu sebabnya setiap checkpoint di CAF — Plan, Implement, Verify, PR — mewajibkan
        review manusia eksplisit, dan kenapa CAF Orchestrator sengaja jalan di
        infrastruktur kamu sendiri, bukan sebagai layanan yang dikelola Coderium.
      </p>

      <h2>Coderium</h2>
      <p>
        CAF adalah proyek terpisah dari situs utama Coderium. Untuk tahu lebih banyak
        tentang Coderium sebagai studio, kunjungi
        <span class="text-mute">situs utama Coderium (segera hadir)</span>.
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
