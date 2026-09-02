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

      <!-- desktop actions -->
      <div class="hidden items-center gap-sm sm:flex">
        <a
          href="https://github.com/coderiumid/caf-initiator"
          target="_blank"
          rel="noopener"
          class="rounded-sm bg-ink px-xs h-8 text-sm font-medium text-canvas-elevated flex items-center"
        >
          {{ t('nav.github') }}
        </a>

        <a
          href="https://www.npmjs.com/package/caf-initiator"
          target="_blank"
          rel="noopener"
          aria-label="npm"
          class="flex h-8 w-8 items-center justify-center rounded-sm border border-hairline text-ink"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332H10.665v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" /></svg>
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
      </div>

      <!-- mobile actions -->
      <div class="flex items-center gap-xxs sm:hidden">
        <a
          href="https://github.com/coderiumid/caf-initiator"
          target="_blank"
          rel="noopener"
          aria-label="GitHub"
          class="flex h-8 w-8 items-center justify-center rounded-sm bg-ink text-canvas-elevated"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.896-.014 3.286 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
        </a>

        <a
          href="https://www.npmjs.com/package/caf-initiator"
          target="_blank"
          rel="noopener"
          aria-label="npm"
          class="flex h-8 w-8 items-center justify-center rounded-sm border border-hairline text-ink"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332H10.665v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" /></svg>
        </a>

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-sm border border-hairline text-ink"
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

      <div class="mt-sm flex items-center gap-xs border-t border-hairline pt-sm">
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
      </div>
    </div>
  </header>
</template>
