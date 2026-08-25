<script setup lang="ts">
const navLinks = [
  { label: 'Docs', to: '/docs' },
  { label: 'About', to: '/about' },
]

const mobileOpen = ref(false)
const route = useRoute()
const scrolled = ref(false)

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)

function onScroll() {
  scrolled.value = window.scrollY > 0
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b transition-colors"
    :class="
      scrolled
        ? 'border-hairline bg-canvas/80 backdrop-blur-md'
        : 'border-transparent bg-canvas'
    "
  >
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

      <div class="flex items-center gap-sm">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener"
          class="rounded-sm bg-ink px-xs py-xxs text-sm font-medium text-canvas-elevated"
        >
          View on GitHub
        </a>

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-sm border border-hairline text-ink sm:hidden"
          :aria-expanded="mobileOpen"
          aria-label="Toggle navigation menu"
          @click="mobileOpen = !mobileOpen"
        >
          <Icon :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" class="h-4 w-4" />
        </button>
      </div>
    </nav>

    <div
      v-if="mobileOpen"
      class="absolute inset-x-0 top-full z-50 border-b border-hairline bg-canvas px-lg py-sm sm:hidden"
    >
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="block py-xs text-sm text-body hover:text-ink"
      >
        {{ link.label }}
      </NuxtLink>
    </div>
  </header>
</template>
