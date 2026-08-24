<script setup lang="ts">
useSeoMeta({
  title: 'Terms of Service',
  description: 'Syarat penggunaan CAF (Coderium Agent Framework).',
})

definePageMeta({
  layout: 'default',
})
</script>

<template>
  <article class="mx-auto max-w-2xl px-lg py-4xl sm:py-section">
    <h1 class="text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
      Terms of Service
    </h1>
    <p class="mt-xs text-sm text-mute">Terakhir diperbarui: draf awal, belum dipublikasikan resmi.</p>

    <div class="mt-lg rounded-md border border-hairline bg-hairline-soft px-md py-sm text-sm text-body">
      <strong class="text-ink">Draf.</strong> Halaman ini disusun mengikuti kerangka di
      <code class="rounded-sm bg-canvas-elevated px-[4px] py-[1px] font-mono text-xs">PLAN.md</code>
      dan belum melalui tinjauan hukum. Jangan dijadikan acuan final sebelum direview oleh
      pihak yang berwenang.
    </div>

    <div class="prose-legal mt-xl">
      <h2>1. Apa itu CAF</h2>
      <p>
        CAF (Coderium Agent Framework) adalah sebuah framework — kumpulan kode, konvensi,
        dan tooling yang kamu jalankan sendiri di repo dan infrastruktur kamu. CAF
        <strong>bukan</strong> layanan SaaS yang di-hosting oleh Coderium. Tidak ada
        instance CAF Orchestrator yang dijalankan atau dikelola oleh Coderium atas nama
        kamu.
      </p>

      <h2>2. Lisensi</h2>
      <p>
        Kode CAF didistribusikan di bawah lisensi <strong>[Lisensi TBD]</strong> — akan
        ditentukan sebelum repo publik dirilis. Sampai lisensi final ditetapkan, anggap
        semua hak dilindungi.
      </p>

      <h2>3. Disediakan &quot;sebagaimana adanya&quot;</h2>
      <p>
        CAF v1.0.0 gratis dan disediakan <strong>as-is</strong>, tanpa jaminan (warranty)
        dalam bentuk apa pun, tersurat maupun tersirat. Tidak ada SLA (service level
        agreement) di versi gratis — tidak ada komitmen waktu respons atau uptime, karena
        CAF Orchestrator berjalan di infrastruktur kamu sendiri, bukan milik Coderium.
      </p>

      <h2>4. Batasan tanggung jawab</h2>
      <p>
        Agent AI yang dijalankan CAF bisa menghasilkan kode yang salah, tidak lengkap,
        atau tidak sesuai maksud. Ini konsisten dengan prinsip governance CAF sendiri:
        <strong>review manusia wajib</strong> di setiap checkpoint sebelum kode
        digabungkan. Kamu — bukan Coderium — bertanggung jawab penuh atas keputusan
        untuk me-review, meng-approve, atau menggabungkan perubahan apa pun yang
        dihasilkan agent.
      </p>
      <p>
        Coderium tidak bertanggung jawab atas kerugian yang timbul dari penggunaan CAF,
        termasuk namun tidak terbatas pada kesalahan kode yang lolos review manusia.
      </p>

      <h2>5. Perubahan Terms</h2>
      <p>
        Ketentuan ini bisa berubah seiring perkembangan CAF. Perubahan akan diumumkan di
        <NuxtLink to="/changelog">changelog</NuxtLink> proyek.
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
