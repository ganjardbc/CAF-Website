<script setup lang="ts">
const items = [
  {
    question: 'Apa itu CAF?',
    answer:
      'CAF (Coderium Agent Framework) adalah framework orkestrasi AI agent yang menjalankan siklus Plan → Implement → Verify → PR dengan governance ketat — setiap checkpoint butuh review manusia eksplisit.',
  },
  {
    question: 'Apakah CAF gratis?',
    answer:
      'Ya. CAF v1.0.0 gratis dan open — kamu jalankan langsung di repo dan infrastruktur kamu sendiri, tanpa biaya lisensi.',
  },
  {
    question: 'Tracker apa saja yang didukung?',
    answer:
      'Linear dan Jira didukung secara native lewat CAF Orchestrator. Tracker lain bisa ditambahkan lewat konfigurasi webhook.',
  },
  {
    question: 'AI runner apa yang dipakai?',
    answer:
      'Claude Code — dijalankan headless per fase (Plan, Implement, Verify, PR) oleh CAF Orchestrator.',
  },
  {
    question: 'Apakah CAF bisa auto-merge?',
    answer:
      'Tidak. Setiap fase punya checkpoint human-review wajib. Tidak ada jalur otomatis yang melewati approval manusia sebelum PR dibuat atau digabungkan.',
  },
  {
    question: 'Apakah CAF menyimpan kode saya di server pihak ketiga?',
    answer:
      'Tidak. CAF Orchestrator jalan di VPS milik kamu sendiri, dan artifact handoff antar fase cuma file Markdown di repo kamu — kode kamu tidak pernah dikirim ke server Coderium.',
  },
]

const openIndex = ref(0)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? -1 : index
}
</script>

<template>
  <section class="mx-auto max-w-[1200px] px-lg pt-2xl pb-4xl sm:pt-3xl sm:pb-section">
    <div class="mb-2xl text-center">
      <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
        FAQ
      </span>
      <h2 class="mt-xs text-2xl font-semibold tracking-[-1.28px] text-ink sm:text-[32px] sm:leading-[40px]">
        Pertanyaan yang sering diajukan
      </h2>
    </div>

    <div class="mx-auto max-w-2xl divide-y divide-hairline border-y border-hairline">
      <div v-for="(item, index) in items" :key="item.question">
        <button
          type="button"
          class="flex w-full items-center justify-between gap-md py-md text-left"
          :aria-expanded="openIndex === index"
          @click="toggle(index)"
        >
          <span class="text-base font-medium text-ink">{{ item.question }}</span>
          <Icon
            name="lucide:chevron-down"
            class="h-4 w-4 shrink-0 text-mute transition-transform duration-200"
            :class="{ 'rotate-180': openIndex === index }"
          />
        </button>
        <div v-show="openIndex === index" class="pb-md pr-2xl">
          <p class="text-sm text-body">{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
