<script setup lang="ts">
const { t } = useI18n()

const stages = [
  { key: 'ticket', icon: 'lucide:ticket', human: true },
  { key: 'plan', icon: 'lucide:clipboard-list', human: false },
  { key: 'implement', icon: 'lucide:code-xml', human: false },
  { key: 'validate', icon: 'lucide:shield-check', human: false },
  { key: 'reviewer', icon: 'lucide:search-check', human: false },
  { key: 'pr', icon: 'lucide:git-pull-request-arrow', human: false },
  { key: 'merge', icon: 'lucide:lock', human: true },
] as const

const items = computed(() =>
  stages.map((stage) => ({
    ...stage,
    label: t(`pipeline.stages.${stage.key}.title`),
    subtitle: t(`pipeline.stages.${stage.key}.subtitle`),
  })),
)

// How many ticks the finished chain stays lit before the loop restarts.
const HOLD = 3

// Fully lit on the server and for reduced-motion visitors; the loop starts on mount.
const lit = ref(stages.length)
const animate = ref(true)
let timer: ReturnType<typeof setInterval> | undefined

const progress = computed(() => (lit.value <= 1 ? 0 : ((lit.value - 1) / (stages.length - 1)) * 100))
const current = computed(() => items.value[Math.max(lit.value, 1) - 1])

// The reset snaps back instead of sweeping the line backwards.
watch(lit, (now, before) => {
  if (now >= before) return
  animate.value = false
  nextTick(() => requestAnimationFrame(() => (animate.value = true)))
})

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  let tick = 1
  lit.value = tick
  timer = setInterval(() => {
    tick = (tick + 1) % (stages.length + HOLD + 1)
    lit.value = Math.min(tick, stages.length)
  }, 750)
})

onBeforeUnmount(() => clearInterval(timer))

function stateOf(index: number) {
  if (index === lit.value - 1) return 'current'
  return index < lit.value - 1 ? 'past' : 'off'
}
</script>

<template>
  <div class="relative w-full max-w-5xl">
    <div class="relative w-full">
      <!-- track and its progress fill, running through the node centres -->
      <div class="absolute inset-x-[7.1429%] top-[18px] h-0.5 rounded-full bg-hairline sm:top-[22px]">
        <div
          class="h-full rounded-full bg-gradient-to-r from-link to-cyan motion-reduce:transition-none"
          :class="animate ? 'transition-[width] duration-700 ease-out' : ''"
          :style="{ width: `${progress}%` }"
        />
      </div>

      <ol class="relative grid grid-cols-7">
        <li v-for="(item, index) in items" :key="item.key" class="flex flex-col items-center">
          <div
            class="relative flex h-9 w-9 items-center justify-center border transition-[background-color,border-color,color,box-shadow] duration-300 motion-reduce:transition-none sm:h-11 sm:w-11"
            :class="[
              item.human ? 'rounded-md' : 'rounded-full',
              {
                'border-ink bg-ink text-canvas-elevated shadow-[0_0_0_6px_rgb(var(--color-link)/0.16)]':
                  stateOf(index) === 'current',
                'border-ink/30 bg-canvas-elevated text-ink': stateOf(index) === 'past',
                'border-hairline bg-canvas-elevated text-faint': stateOf(index) === 'off',
              },
            ]"
          >
            <span
              v-if="stateOf(index) === 'current'"
              class="pointer-events-none absolute inset-0 border border-link/60 motion-safe:animate-ping motion-reduce:hidden"
              :class="item.human ? 'rounded-md' : 'rounded-full'"
              aria-hidden="true"
            />
            <Icon :name="item.icon" class="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <span
            class="mt-sm text-center text-xs font-medium transition-colors duration-300 motion-reduce:transition-none max-sm:sr-only"
            :class="{
              'text-ink': stateOf(index) === 'current',
              'text-body': stateOf(index) === 'past',
              'text-faint': stateOf(index) === 'off',
            }"
          >
            {{ item.label }}
          </span>
        </li>
      </ol>
    </div>

    <!-- what the active stage does -->
    <div class="mt-md flex h-6 items-center justify-center text-sm" aria-hidden="true">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <p :key="current.key" class="text-mute">
          <strong class="font-medium text-ink sm:hidden">{{ current.label }}</strong>
          <span class="sm:hidden"> · </span>
          {{ current.subtitle }}
        </p>
      </Transition>
    </div>
  </div>
</template>
