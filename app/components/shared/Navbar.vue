<script setup lang="ts">
const navLinks = [
  { label: 'Docs', to: '/docs' },
  { label: 'About', to: '/about' },
]
</script>

<template>
  <header class="border-b border-hairline bg-canvas">
    <nav class="mx-auto flex max-w-[1200px] items-center justify-between px-lg py-sm">
      <NuxtLink to="/" class="font-mono text-sm font-semibold tracking-tight text-ink">
        CAF
      </NuxtLink>

      <div class="hidden items-center gap-xs sm:flex">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-full px-sm py-xxs text-sm text-body hover:text-ink"
        >
          {{ link.label }}
        </NuxtLink>
      </div>

      <a
        href="https://github.com"
        target="_blank"
        rel="noopener"
        class="rounded-sm bg-ink px-xs py-xxs text-sm font-medium text-canvas-elevated"
      >
        View on GitHub
      </a>
    </nav>
  </header>
</template>
