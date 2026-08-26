<script setup lang="ts">
const { t } = useI18n()

const stageKeys = ['ticket', 'plan', 'implement', 'qa', 'reviewer', 'docs', 'pr', 'merge'] as const

const stages = computed(() =>
  stageKeys.map((key) => ({
    key,
    title: t(`pipeline.stages.${key}.title`),
    subtitle: t(`pipeline.stages.${key}.subtitle`),
    detail: t(`pipeline.stages.${key}.detail`),
    highlight: key === 'merge',
  })),
)

const openKey = ref<string | null>(null)

function toggleDetail(key: string) {
  openKey.value = openKey.value === key ? null : key
}
</script>

<template>
  <section class="mx-auto max-w-[720px] px-lg pt-2xl pb-4xl sm:pt-3xl sm:pb-section">
    <div class="mb-2xl text-center">
      <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
        {{ t('pipeline.eyebrow') }}
      </span>
      <h2 class="mt-xs text-2xl font-semibold tracking-[-1.28px] text-ink sm:text-[32px] sm:leading-[40px]">
        {{ t('pipeline.title') }}
      </h2>
      <i18n-t
        keypath="pipeline.description"
        tag="p"
        class="mx-auto mt-sm max-w-xl text-sm text-body sm:text-base"
      >
        <template #review>
          <strong class="text-ink">{{ t('pipeline.reviewHighlight') }}</strong>
        </template>
      </i18n-t>
    </div>

    <ol :aria-label="t('pipeline.ariaLabel')" class="flex flex-col">
      <li v-for="(stage, index) in stages" :key="stage.key" class="flex gap-md sm:gap-lg">
        <div class="flex flex-col items-center">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-mono text-sm sm:h-12 sm:w-12 sm:text-base"
            :class="
              stage.highlight
                ? 'border-ink bg-ink text-canvas-elevated'
                : 'border-hairline bg-canvas-elevated text-faint'
            "
          >
            <Icon v-if="stage.highlight" name="lucide:lock" class="h-5 w-5" />
            <span v-else>{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
          <div v-if="index < stages.length - 1" class="my-xxs w-px flex-1 bg-hairline" />
        </div>

        <div class="relative flex-1" :class="index === stages.length - 1 ? '' : 'pb-xl sm:pb-2xl'">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-sm pt-xxs text-left sm:pt-xs"
            :aria-expanded="openKey === stage.key"
            @click="toggleDetail(stage.key)"
          >
            <p class="text-base font-semibold text-ink sm:text-lg">{{ stage.title }}</p>

            <Icon
              name="lucide:chevron-down"
              class="h-4 w-4 shrink-0 text-faint transition-transform duration-200"
              :class="{ 'rotate-180': openKey === stage.key }"
            />
          </button>

          <p class="mt-xxs text-sm text-mute sm:text-base">{{ stage.subtitle }}</p>

          <Transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <p
              v-if="openKey === stage.key"
              class="mt-sm max-w-md rounded-md border border-hairline bg-canvas-elevated px-sm py-xs text-sm text-body shadow-[0px_2px_2px_rgba(0,0,0,0.04),0px_8px_16px_-4px_rgba(0,0,0,0.04)]"
            >
              {{ stage.detail }}
            </p>
          </Transition>
        </div>
      </li>
    </ol>
  </section>
</template>
