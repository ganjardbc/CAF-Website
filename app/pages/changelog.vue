<script setup lang="ts">
useSeoMeta({
  title: 'Changelog',
  description: 'Histori rilis CAF (Coderium Agent Framework).',
})

definePageMeta({
  layout: 'default',
})

const releases = [
  {
    version: 'v1.0.0',
    date: '2026',
    items: [
      'Rilis awal CAF: disiplin PIV (Plan → Implement → Verify) dengan retry maksimal 3x',
      'CAF Initiator — CLI scaffold generator dengan deteksi stack otomatis',
      'CAF Orchestrator — webhook receiver self-hosted (Fastify + BullMQ + Redis)',
      'Arsitektur 5 layer: Project Knowledge Base, Agent Definitions, Artifact Handoff, Quality Gates, Orchestration',
      'Integrasi tracker: Linear dan Jira',
      'Integrasi Git host: GitHub dan GitLab',
      'Checkpoint human-review wajib di setiap fase — tidak ada auto-merge',
    ],
  },
]
</script>

<template>
  <article class="mx-auto max-w-2xl px-lg py-4xl sm:py-section">
    <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
      Changelog
    </span>
    <h1 class="mt-xs text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
      Histori rilis
    </h1>
    <p class="mt-sm text-base text-body">
      CAF masih di v1.0.0 — halaman ini akan terus bertambah seiring rilis berikutnya.
    </p>

    <div class="mt-xl flex flex-col gap-2xl">
      <section
        v-for="release in releases"
        :key="release.version"
        class="border-l-2 border-hairline pl-lg"
      >
        <div class="flex items-baseline gap-xs">
          <h2 class="font-mono text-lg font-semibold text-ink">{{ release.version }}</h2>
          <span class="text-sm text-mute">{{ release.date }}</span>
        </div>
        <ul class="mt-sm flex list-disc flex-col gap-xs pl-lg">
          <li v-for="item in release.items" :key="item" class="text-base text-body">
            {{ item }}
          </li>
        </ul>
      </section>
    </div>
  </article>
</template>
