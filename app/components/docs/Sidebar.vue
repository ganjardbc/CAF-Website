<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const localePath = useLocalePath()

const sections = computed(() => [
  {
    title: t('docsSidebar.gettingStarted.title'),
    links: [
      { label: t('docsSidebar.gettingStarted.introduction'), to: localePath('/docs') },
      { label: t('docsSidebar.gettingStarted.quickStart'), to: localePath('/docs/quick-start') },
      { label: t('docsSidebar.gettingStarted.piv'), to: localePath('/docs/piv') },
    ],
  },
  {
    title: t('docsSidebar.coreConcepts.title'),
    links: [
      { label: t('docsSidebar.coreConcepts.layer1'), to: localePath('/docs/core-concepts/layer-1') },
      { label: t('docsSidebar.coreConcepts.layer2'), to: localePath('/docs/core-concepts/layer-2') },
      { label: t('docsSidebar.coreConcepts.layer3'), to: localePath('/docs/core-concepts/layer-3') },
      { label: t('docsSidebar.coreConcepts.layer4'), to: localePath('/docs/core-concepts/layer-4') },
      { label: t('docsSidebar.coreConcepts.layer5'), to: localePath('/docs/core-concepts/layer-5') },
    ],
  },
  {
    title: t('docsSidebar.initiator.title'),
    links: [{ label: t('docsSidebar.initiator.title'), to: localePath('/docs/caf-initiator') }],
  },
  {
    title: t('docsSidebar.orchestrator.title'),
    links: [{ label: t('docsSidebar.orchestrator.title'), to: localePath('/docs/caf-orchestrator') }],
  },
  {
    title: t('docsSidebar.integrations.title'),
    links: [
      { label: t('docsSidebar.integrations.linear'), to: localePath('/docs/integrations/linear') },
      { label: t('docsSidebar.integrations.jira'), to: localePath('/docs/integrations/jira') },
      { label: t('docsSidebar.integrations.githubGitlab'), to: localePath('/docs/integrations/github-gitlab') },
    ],
  },
  {
    title: t('docsSidebar.reference.title'),
    links: [
      { label: t('docsSidebar.reference.envVars'), to: localePath('/docs/reference/environment-variables') },
      { label: t('docsSidebar.reference.troubleshooting'), to: localePath('/docs/reference/troubleshooting') },
    ],
  },
])

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
      :aria-label="t('docsSidebar.selectLabel')"
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
