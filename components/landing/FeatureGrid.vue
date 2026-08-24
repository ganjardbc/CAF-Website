<script setup lang="ts">
const features = [
  {
    icon: 'lucide:repeat',
    title: 'Disiplin PIV',
    description:
      'Setiap task berjalan lewat Plan → Implement → Verify, dengan retry maksimal 3x sebelum dieskalasi ke manusia.',
  },
  {
    icon: 'lucide:file-text',
    title: 'Artifact handoff via Markdown',
    description:
      'Hasil tiap fase disimpan sebagai file Markdown di repo — bukan context chat yang hilang begitu sesi berakhir.',
  },
  {
    icon: 'lucide:columns-3',
    title: 'Multi-tracker: Linear & Jira',
    description:
      'Orchestrator terhubung langsung ke tracker yang sudah kamu pakai — trigger otomatis dari perubahan status ticket.',
  },
  {
    icon: 'lucide:user-check',
    title: 'Human review wajib',
    description:
      'Setiap checkpoint — Plan, Implement, Verify, PR — butuh approval manusia eksplisit. Tidak ada auto-merge.',
  },
  {
    icon: 'lucide:eye',
    title: 'Scanner agent read-only',
    description:
      'Agent yang membaca dan menganalisis kode tidak punya write access sampai ada approval gate eksplisit.',
  },
]
</script>

<template>
  <section class="mx-auto max-w-[1200px] px-lg pt-2xl pb-4xl sm:pt-3xl sm:pb-section">
    <div class="mb-2xl text-center">
      <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
        Apa itu CAF?
      </span>
      <h2 class="mt-xs text-2xl font-semibold tracking-[-1.28px] text-ink sm:text-[32px] sm:leading-[40px]">
        Framework, bukan black box
      </h2>
    </div>

    <div class="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="rounded-md border border-hairline bg-canvas-elevated p-lg"
      >
        <Icon :name="feature.icon" class="h-5 w-5 text-ink" />
        <h3 class="mt-md text-lg font-semibold text-ink">{{ feature.title }}</h3>
        <p class="mt-xs text-sm text-body">{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>
