<script setup lang="ts">
const linkGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Docs', to: '/docs' },
      { label: 'Changelog', to: '/changelog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'GitHub', to: 'https://github.com', external: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', to: '/legal/terms' },
      { label: 'Privacy', to: '/legal/privacy' },
    ],
  },
]
</script>

<template>
  <footer class="border-t border-hairline bg-canvas">
    <div class="mx-auto max-w-[1200px] px-lg py-3xl">
      <div class="grid grid-cols-2 gap-xl sm:grid-cols-4">
        <div>
          <span class="font-mono text-sm font-semibold tracking-tight text-ink">CAF</span>
        </div>

        <div v-for="group in linkGroups" :key="group.title" class="flex flex-col gap-xs">
          <span class="text-xs font-medium uppercase tracking-wide text-mute">
            {{ group.title }}
          </span>
          <NuxtLink
            v-for="link in group.links"
            :key="link.label"
            :to="link.to"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noopener' : undefined"
            class="text-sm text-body hover:text-ink"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </div>

      <p class="mt-2xl text-xs text-faint">
        &copy; {{ new Date().getFullYear() }} Coderium. All rights reserved.
      </p>
    </div>
  </footer>
</template>
