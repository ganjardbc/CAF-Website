<script setup lang="ts">
const route = useRoute()

const sections = [
  {
    title: 'Getting Started',
    links: [
      { label: 'Introduction', to: '/docs' },
      { label: 'Quick Start', to: '/docs/quick-start' },
      { label: 'Konsep PIV', to: '/docs/piv' },
    ],
  },
  {
    title: 'CAF Initiator',
    links: [{ label: 'CAF Initiator', to: '/docs/caf-initiator' }],
  },
  {
    title: 'CAF Orchestrator',
    links: [{ label: 'CAF Orchestrator', to: '/docs/caf-orchestrator' }],
  },
]
</script>

<template>
  <nav class="flex flex-col gap-lg">
    <div v-for="section in sections" :key="section.title" class="flex flex-col gap-xs">
      <span class="text-xs font-medium uppercase tracking-wide text-mute">
        {{ section.title }}
      </span>
      <NuxtLink
        v-for="link in section.links"
        :key="link.to"
        :to="link.to"
        class="text-sm"
        :class="route.path === link.to ? 'font-medium text-ink' : 'text-body hover:text-ink'"
      >
        {{ link.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
