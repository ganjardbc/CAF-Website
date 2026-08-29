<script setup lang="ts">
import logoWhite from '../../assets/images/logo-white.png'
import logoBlack from '../../assets/images/logo-black.png'

const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const colorMode = useColorMode()
const logo = computed(() => (colorMode.value === 'dark' ? logoWhite : logoBlack))

const navLinks = computed(() => [
  { label: t('nav.quickStart'), to: localePath('/docs/quick-start') },
  { label: t('nav.docs'), to: localePath('/docs') },
  { label: t('nav.changelog'), to: localePath('/changelog') },
  { label: t('nav.about'), to: localePath('/about') },
])

const otherLocale = computed(() => (locales.value as { code: string }[]).find((l) => l.code !== locale.value))

const mobileOpen = ref(false)
const route = useRoute()
const scrolled = ref(false)

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

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
    <nav class="mx-auto flex max-w-[1200px] items-center justify-between px-lg py-sm gap-4">
      <NuxtLink :to="localePath('/')" class="font-mono text-2xl font-semibold tracking-tight text-ink">
        <img :src="logo" class="w-20" />
      </NuxtLink>

      <div class="hidden flex-1 items-center gap-xs sm:flex">
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
          href="https://github.com/coderiumid/caf-initiator"
          target="_blank"
          rel="noopener"
          class="rounded-sm bg-ink px-xs py-xxs text-sm font-medium text-canvas-elevated"
        >
          {{ t('nav.github') }}
        </a>

        <NuxtLink
          v-if="otherLocale"
          :to="switchLocalePath(otherLocale.code)"
          class="flex h-8 items-center justify-center rounded-sm border border-hairline px-xs text-xs font-medium uppercase text-ink"
        >
          {{ otherLocale.code }}
        </NuxtLink>

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-sm border border-hairline text-ink"
          :aria-label="t('nav.toggleTheme')"
          @click="toggleColorMode"
        >
          <ClientOnly>
            <Icon
              :name="colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon'"
              class="h-4 w-4"
            />
            <template #fallback>
              <span class="block h-4 w-4" />
            </template>
          </ClientOnly>
        </button>

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-sm border border-hairline text-ink sm:hidden"
          :aria-expanded="mobileOpen"
          :aria-label="t('nav.toggleMenu')"
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
