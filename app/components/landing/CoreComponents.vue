<script setup lang="ts">
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

interface Step {
  comment?: string
  command: string
  // false: shown in the box but left out of "Copy" (runs in its own terminal)
  copy?: boolean
}

const initiatorSteps: Step[] = [
  { comment: 'in your repo root: preview what would be written', command: 'npx -p caf-initiator caf-init scaffold --dry-run' },
  { comment: 'generate the drafts', command: 'npx -p caf-initiator caf-init scaffold' },
]

const orchestratorSteps: Step[] = [
  { comment: 'run: web server, worker & view dashboard', command: 'pnpm dev && pnpm dev:worker' },
  { comment: 'or run TUI (terminal UI)', command: 'pnpm tui', copy: false },
]

const copied = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy(key: string, steps: Step[]) {
  const text = steps
    .filter((s) => s.copy !== false)
    .map((s) => s.command)
    .join('\n')
  try {
    await navigator.clipboard.writeText(text)
    copied.value = key
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = null), 1800)
  } catch {
    // clipboard unavailable (insecure context); ignore
  }
}

onBeforeUnmount(() => clearTimeout(timer))

const components = computed(() => [
  {
    icon: 'lucide:terminal',
    eyebrow: t('coreComponents.initiator.eyebrow'),
    title: t('coreComponents.initiator.title'),
    description: t('coreComponents.initiator.description'),
    points: (tm('coreComponents.initiator.points') as string[]).map((p) => rt(p)),
    key: 'initiator',
    steps: initiatorSteps,
    guide: '/docs/caf-initiator',
  },
  {
    icon: 'lucide:server',
    eyebrow: t('coreComponents.orchestrator.eyebrow'),
    title: t('coreComponents.orchestrator.title'),
    description: t('coreComponents.orchestrator.description'),
    points: (tm('coreComponents.orchestrator.points') as string[]).map((p) => rt(p)),
    key: 'orchestrator',
    steps: orchestratorSteps,
    guide: '/docs/caf-orchestrator',
  },
])
</script>

<template>
  <section class="mx-auto max-w-[1200px] px-lg pt-2xl pb-4xl sm:pt-3xl sm:pb-section">
    <div class="mb-2xl text-center">
      <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
        {{ t('coreComponents.eyebrow') }}
      </span>
      <h2 class="mt-xs text-2xl font-semibold tracking-[-1.28px] text-ink sm:text-[32px] sm:leading-[40px]">
        {{ t('coreComponents.title') }}
      </h2>
    </div>

    <div class="grid grid-cols-1 gap-lg lg:grid-cols-2">
      <div
        v-for="item in components"
        :key="item.title"
        class="flex flex-col rounded-lg border border-hairline bg-canvas-elevated p-xl shadow-[0px_2px_2px_rgba(0,0,0,0.04),0px_8px_16px_-4px_rgba(0,0,0,0.04)]"
      >
        <Icon :name="item.icon" class="h-6 w-6 text-ink" />

        <span class="mt-md block font-mono text-xs uppercase tracking-wide text-mute">
          {{ item.eyebrow }}
        </span>
        <h3 class="mt-xxs text-xl font-semibold text-ink">{{ item.title }}</h3>
        <p class="mt-sm text-sm text-body">{{ item.description }}</p>

        <ul class="mt-lg flex flex-col gap-xs">
          <li
            v-for="point in item.points"
            :key="point"
            class="flex items-start gap-xs text-sm text-body"
          >
            <Icon name="lucide:check" class="mt-[3px] h-4 w-4 shrink-0 text-ink" />
            <span>{{ point }}</span>
          </li>
        </ul>

        <div class="mt-auto pt-lg">
          <div class="overflow-hidden rounded-md border border-hairline bg-canvas">
            <div class="flex items-center justify-between gap-sm border-b border-hairline px-md py-xs text-xs">
              <NuxtLink
                :to="localePath(item.guide)"
                class="text-mute transition-colors hover:text-ink"
              >
                {{ t('coreComponents.guide') }}
              </NuxtLink>
              <button
                type="button"
                class="rounded-sm border border-hairline bg-canvas-elevated px-sm py-xxs font-medium transition-colors hover:text-ink"
                :class="copied === item.key ? 'text-link' : 'text-mute'"
                @click="copy(item.key, item.steps)"
              >
                {{ copied === item.key ? t('coreComponents.copied') : t('coreComponents.copy') }}
              </button>
            </div>
            <div class="px-md py-sm font-mono text-xs leading-relaxed sm:text-sm">
              <div v-for="(step, i) in item.steps" :key="step.command">
                <p v-if="step.comment" class="text-faint" :class="i > 0 && 'mt-sm'"># {{ step.comment }}</p>
                <p class="flex gap-sm">
                  <span class="select-none text-link" aria-hidden="true">$</span>
                  <code class="min-w-0 break-all text-ink">{{ step.command }}</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
