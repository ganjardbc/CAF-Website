<script setup lang="ts">
const route = useRoute()
const router = useRouter()

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
    title: 'Core Concepts',
    links: [
      { label: 'Layer 1: Project Knowledge Base', to: '/docs/core-concepts/layer-1' },
      { label: 'Layer 2: Agent Definitions', to: '/docs/core-concepts/layer-2' },
      { label: 'Layer 3: Artifact Handoff', to: '/docs/core-concepts/layer-3' },
      { label: 'Layer 4: Quality Gates', to: '/docs/core-concepts/layer-4' },
      { label: 'Layer 5: Orchestration', to: '/docs/core-concepts/layer-5' },
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
  {
    title: 'Integrations',
    links: [
      { label: 'Linear', to: '/docs/integrations/linear' },
      { label: 'Jira', to: '/docs/integrations/jira' },
      { label: 'GitHub / GitLab', to: '/docs/integrations/github-gitlab' },
    ],
  },
  {
    title: 'Reference',
    links: [
      { label: 'Environment Variables', to: '/docs/reference/environment-variables' },
      { label: 'Troubleshooting', to: '/docs/reference/troubleshooting' },
    ],
  },
]

const selected = computed({
  get: () => route.path,
  set: (to: string) => router.push(to),
})
</script>

<template>
  <div>
    <select
      v-model="selected"
      class="w-full rounded-sm border border-hairline bg-canvas-elevated px-sm py-xs text-sm text-ink lg:hidden"
      aria-label="Navigasi docs"
    >
      <optgroup v-for="section in sections" :key="section.title" :label="section.title">
        <option v-for="link in section.links" :key="link.to" :value="link.to">
          {{ link.label }}
        </option>
      </optgroup>
    </select>

    <nav class="hidden flex-col gap-lg lg:flex">
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
  </div>
</template>
