<script setup lang="ts">
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

type Slide = {
  key: 'cli' | 'dashboard' | 'floor'
  icon: string
  src: string
  width: number
  height: number
  chrome: boolean
  url: string
}

const slides: Slide[] = [
  { key: 'cli', icon: 'lucide:terminal', src: '/images/caf-cli.webp', width: 2000, height: 1406, chrome: false, url: '' },
  { key: 'dashboard', icon: 'lucide:layout-dashboard', src: '/images/caf-dashboard.webp', width: 2000, height: 1255, chrome: true, url: 'your-vps/dashboard' },
  { key: 'floor', icon: 'lucide:building-2', src: '/images/caf-agent-floor.webp', width: 2000, height: 1257, chrome: true, url: 'your-vps/dashboard/agent-floor' },
]

const active = ref(0)
const current = computed(() => slides[active.value]!)
const points = computed(() =>
  (tm(`showcase.items.${current.value.key}.points`) as string[]).map((p) => rt(p)),
)

const lightbox = ref(false)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') lightbox.value = false
}

watch(lightbox, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-x-0 top-1/3 mx-auto h-[420px] max-w-[900px] opacity-20 blur-[110px] dark:opacity-30"
      style="background: radial-gradient(40% 50% at 30% 50%, #0070f3 0%, transparent 100%),
        radial-gradient(40% 50% at 70% 50%, #eb367f 0%, transparent 100%),
        radial-gradient(30% 40% at 50% 40%, #f5a623 0%, transparent 100%);"
    />

    <div class="relative mx-auto max-w-[1200px] px-lg pt-2xl pb-4xl sm:pt-3xl sm:pb-section">
      <div class="mb-xl text-center">
        <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
          {{ t('showcase.eyebrow') }}
        </span>
        <h2 class="mt-xs text-2xl font-semibold tracking-[-1.28px] text-ink sm:text-[32px] sm:leading-[40px]">
          {{ t('showcase.title') }}
        </h2>
        <p class="mx-auto mt-sm max-w-xl text-sm text-body sm:text-base">
          {{ t('showcase.description') }}
        </p>
      </div>

      <div
        role="tablist"
        :aria-label="t('showcase.eyebrow')"
        class="mx-auto mb-xl flex w-fit max-w-full flex-wrap justify-center gap-xxs rounded-pill border border-hairline bg-canvas-elevated p-xxs"
      >
        <button
          v-for="(slide, index) in slides"
          :id="`showcase-tab-${slide.key}`"
          :key="slide.key"
          type="button"
          role="tab"
          :aria-selected="active === index"
          :aria-controls="`showcase-panel-${slide.key}`"
          class="inline-flex items-center gap-xs rounded-pill px-md py-xs text-sm font-medium transition-colors"
          :class="active === index ? 'bg-ink text-canvas-elevated' : 'text-body hover:text-ink'"
          @click="active = index"
        >
          <Icon :name="slide.icon" class="h-4 w-4" />
          {{ t(`showcase.items.${slide.key}.tab`) }}
        </button>
      </div>

      <div
        :id="`showcase-panel-${current.key}`"
        role="tabpanel"
        :aria-labelledby="`showcase-tab-${current.key}`"
      >
        <div class="mx-auto mb-xl max-w-2xl text-center">
          <h3 class="text-xl font-semibold text-ink">
            {{ t(`showcase.items.${current.key}.title`) }}
          </h3>
          <p class="mt-xs text-sm text-body sm:text-base">
            {{ t(`showcase.items.${current.key}.description`) }}
          </p>
          <ul class="mt-md flex flex-wrap justify-center gap-xs">
            <li
              v-for="point in points"
              :key="point"
              class="inline-flex items-center gap-xxs rounded-pill border border-hairline bg-canvas-elevated px-sm py-xxs text-xs text-body"
            >
              <Icon name="lucide:check" class="h-3 w-3 text-ink" />
              {{ point }}
            </li>
          </ul>
        </div>

        <Transition
          mode="out-in"
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2 scale-[0.99]"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div :key="current.key" class="mx-auto max-w-[1040px]">
            <button
              type="button"
              class="group relative block w-full overflow-hidden rounded-lg border border-hairline bg-canvas-elevated text-left shadow-[0px_2px_2px_rgba(0,0,0,0.04),0px_24px_64px_-12px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-1"
              :aria-label="t('showcase.enlarge')"
              @click="lightbox = true"
            >
              <div
                v-if="current.chrome"
                class="flex items-center gap-xs border-b border-hairline bg-hairline-soft px-md py-xs"
              >
                <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span
                  class="ml-sm flex-1 truncate rounded-sm border border-hairline bg-canvas-elevated px-sm py-[2px] text-center font-mono text-xs text-mute"
                >
                  {{ current.url }}
                </span>
              </div>
              <img
                :src="current.src"
                :width="current.width"
                :height="current.height"
                :alt="t(`showcase.items.${current.key}.alt`)"
                loading="lazy"
                decoding="async"
                class="block h-auto w-full"
              />
              <span
                class="pointer-events-none absolute right-sm bottom-sm inline-flex items-center gap-xxs rounded-pill bg-ink/85 px-sm py-xxs text-xs font-medium text-canvas-elevated opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Icon name="lucide:maximize-2" class="h-3 w-3" />
                {{ t('showcase.enlarge') }}
              </span>
            </button>
          </div>
        </Transition>

        <div class="mt-lg text-center">
          <NuxtLink
            :to="localePath(t(`showcase.items.${current.key}.link`))"
            class="inline-flex items-center gap-xxs text-sm font-medium text-link hover:underline"
          >
            {{ t(`showcase.items.${current.key}.cta`) }}
            <Icon name="lucide:arrow-right" class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="lightbox"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-md backdrop-blur-sm sm:p-xl"
          role="dialog"
          aria-modal="true"
          :aria-label="t(`showcase.items.${current.key}.alt`)"
          @click="lightbox = false"
        >
          <button
            type="button"
            class="absolute top-md right-md inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            :aria-label="t('showcase.close')"
            @click.stop="lightbox = false"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
          <img
            :src="current.src"
            :alt="t(`showcase.items.${current.key}.alt`)"
            class="max-h-full max-w-full rounded-md object-contain shadow-2xl"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
