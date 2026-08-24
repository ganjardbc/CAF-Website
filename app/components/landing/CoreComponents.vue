<script setup lang="ts">
const components = [
  {
    icon: 'lucide:terminal',
    eyebrow: 'CLI scaffold generator',
    title: 'CAF Initiator',
    description:
      'Deteksi stack proyek kamu secara otomatis, lalu generate seluruh knowledge base yang dibutuhkan agent — dari definisi agent sampai template task.',
    points: [
      'Auto-deteksi stack: framework, package manager, struktur repo',
      'Generate .claude/agents/ — definisi tiap agent role',
      'Generate .ai/tasks/ — template artifact handoff',
    ],
    command: 'npx caf-initiator init',
  },
  {
    icon: 'lucide:server',
    eyebrow: 'Webhook-driven agent runner',
    title: 'CAF Orchestrator',
    description:
      'Fastify + BullMQ + Redis, jalan di VPS kecil milik kamu sendiri. Menerima webhook dari tracker, lalu spawn agent Claude Code headless untuk tiap fase.',
    points: [
      'Trigger otomatis dari perubahan status ticket (Linear/Jira)',
      'Queue per-fase dengan BullMQ + Redis',
      'Self-hosted — jalan di VPS kamu, bukan SaaS Coderium',
    ],
    command: 'docker compose up -d',
  },
]
</script>

<template>
  <section class="mx-auto max-w-[1200px] px-lg pt-2xl pb-4xl sm:pt-3xl sm:pb-section">
    <div class="mb-2xl text-center">
      <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
        Dua komponen inti
      </span>
      <h2 class="mt-xs text-2xl font-semibold tracking-[-1.28px] text-ink sm:text-[32px] sm:leading-[40px]">
        Scaffold di lokal, jalankan di VPS kamu
      </h2>
    </div>

    <div class="grid grid-cols-1 gap-lg lg:grid-cols-2">
      <div
        v-for="item in components"
        :key="item.title"
        class="rounded-lg border border-hairline bg-canvas-elevated p-xl shadow-[0px_2px_2px_rgba(0,0,0,0.04),0px_8px_16px_-4px_rgba(0,0,0,0.04)]"
      >
        <Icon :name="item.icon" class="h-6 w-6 text-ink" />

        <span class="mt-md block font-mono text-xs uppercase tracking-wide text-mute">
          {{ item.eyebrow }}
        </span>
        <h3 class="mt-xxs text-xl font-semibold text-ink">{{ item.title }}</h3>
        <p class="mt-sm text-sm text-body">{{ item.description }}</p>

        <ul class="mt-lg flex flex-col gap-xs">
          <li
            v-for="point in item.points"
            :key="point"
            class="flex items-start gap-xs text-sm text-body"
          >
            <Icon name="lucide:check" class="mt-[3px] h-4 w-4 shrink-0 text-ink" />
            <span>{{ point }}</span>
          </li>
        </ul>

        <div class="mt-lg rounded-md border border-hairline bg-canvas px-md py-sm">
          <code class="font-mono text-sm text-ink">{{ item.command }}</code>
        </div>
      </div>
    </div>
  </section>
</template>
