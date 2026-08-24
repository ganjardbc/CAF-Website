<script setup lang="ts">
const sections = [
  {
    title: 'Getting Started',
    links: [{ label: 'Introduction', to: '/docs' }],
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
        class="text-sm text-body hover:text-ink"
      >
        {{ link.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
