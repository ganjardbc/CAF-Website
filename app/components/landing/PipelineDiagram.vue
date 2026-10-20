<script setup lang="ts">
const { t } = useI18n()

const stageKeys = ['ticket', 'plan', 'approve', 'implement', 'validate', 'reviewer', 'docs', 'pr', 'merge'] as const

type StageKey = (typeof stageKeys)[number]

interface StageMeta {
  icon: string
  kind: 'agent' | 'human'
  actor?: string
  files?: string[]
  gate?: boolean
  optional?: boolean
}

const meta: Record<StageKey, StageMeta> = {
  ticket: { icon: 'lucide:ticket', kind: 'human' },
  plan: { icon: 'lucide:clipboard-list', kind: 'agent', actor: 'caf-planner', files: ['requirements.md', 'tasks.md'] },
  approve: { icon: 'lucide:user-check', kind: 'human', optional: true },
  implement: {
    icon: 'lucide:code-xml',
    kind: 'agent',
    actor: 'caf-frontend · caf-backend',
    files: ['verify-report.md'],
    gate: true,
  },
  validate: { icon: 'lucide:shield-check', kind: 'agent', actor: 'caf-validator', files: ['validate-report.md'], gate: true },
  reviewer: { icon: 'lucide:search-check', kind: 'agent', actor: 'caf-reviewer', files: ['review-notes.md'], gate: true },
  docs: { icon: 'lucide:book-open-text', kind: 'agent', actor: 'caf-documentation', optional: true },
  pr: { icon: 'lucide:git-pull-request-arrow', kind: 'agent', actor: 'caf-orchestrator' },
  merge: { icon: 'lucide:lock', kind: 'human' },
}

const stages = computed(() =>
  stageKeys.map((key) => ({
    key,
    title: t(`pipeline.stages.${key}.title`),
    subtitle: t(`pipeline.stages.${key}.subtitle`),
    detail: t(`pipeline.stages.${key}.detail`),
    ...meta[key],
  })),
)

const openKey = ref<string | null>(null)

function toggleDetail(key: string) {
  openKey.value = openKey.value === key ? null : key
}
</script>

<template>
  <section class="mx-auto max-w-[720px] px-lg pt-2xl pb-4xl sm:pt-3xl sm:pb-section">
    <div class="mb-xl text-center">
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

    <ul class="mb-2xl flex flex-wrap items-center justify-center gap-x-lg gap-y-xs text-xs text-body sm:text-sm">
      <li class="flex items-center gap-xs">
        <span class="h-3 w-3 rounded-full border border-ink" aria-hidden="true" />
        {{ t('pipeline.legend.agent') }}
      </li>
      <li class="flex items-center gap-xs">
        <span class="h-3 w-3 rounded-sm border border-ink bg-ink" aria-hidden="true" />
        {{ t('pipeline.legend.human') }}
      </li>
    </ul>

    <ol :aria-label="t('pipeline.ariaLabel')" class="flex flex-col">
      <li v-for="(stage, index) in stages" :key="stage.key" class="flex gap-md sm:gap-lg">
        <div class="flex flex-col items-center">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center border border-ink sm:h-12 sm:w-12"
            :class="[
              stage.kind === 'human' ? 'rounded-md bg-ink text-canvas-elevated' : 'rounded-full bg-canvas-elevated text-ink',
              stage.optional ? 'border-dashed' : '',
            ]"
          >
            <Icon :name="stage.icon" class="h-5 w-5" />
          </div>

          <div v-if="index < stages.length - 1" class="my-xxs w-px flex-1 bg-hairline" />
        </div>

        <div class="min-w-0 flex-1" :class="index === stages.length - 1 ? '' : 'pb-md sm:pb-lg'">
          <div
            class="rounded-md border bg-canvas-elevated"
            :class="
              openKey === stage.key
                ? 'border-ink/30 shadow-[0px_2px_2px_rgba(0,0,0,0.04),0px_8px_16px_-4px_rgba(0,0,0,0.04)]'
                : 'border-hairline hover:border-ink/20'
            "
          >
            <button
              type="button"
              class="flex w-full items-start gap-sm rounded-md p-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-link"
              :aria-expanded="openKey === stage.key"
              :aria-controls="`pipeline-detail-${stage.key}`"
              @click="toggleDetail(stage.key)"
            >
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-xs">
                  <span class="font-mono text-xs text-faint">{{ String(index + 1).padStart(2, '0') }}</span>
                  <span
                    v-if="stage.kind === 'human'"
                    class="rounded-pill bg-ink px-xs py-xxs font-mono text-[10px] uppercase tracking-wide text-canvas-elevated"
                  >
                    {{ t('pipeline.who') }}
                  </span>
                  <span
                    v-else
                    class="rounded-pill border border-hairline px-xs py-xxs font-mono text-[10px] tracking-wide text-body"
                  >
                    {{ stage.actor }}
                  </span>
                </div>

                <p class="mt-xs text-base font-semibold text-ink sm:text-lg">{{ stage.title }}</p>
                <p class="mt-xxs text-sm text-mute sm:text-base">{{ stage.subtitle }}</p>

                <div
                  v-if="stage.files || stage.gate"
                  class="mt-sm flex flex-wrap items-center gap-x-sm gap-y-xs"
                >
                  <span
                    v-for="file in stage.files"
                    :key="file"
                    class="inline-flex items-center gap-xxs rounded-sm border border-hairline bg-canvas px-xs py-xxs font-mono text-xs text-body"
                  >
                    <Icon name="lucide:file-text" class="h-3 w-3 text-mute" />
                    {{ file }}
                  </span>
                  <span v-if="stage.gate" class="inline-flex items-center gap-xxs text-xs text-mute">
                    <Icon name="lucide:corner-down-right" class="h-3 w-3" />
                    {{ t('pipeline.onFail') }}
                  </span>
                </div>
              </div>

              <Icon
                name="lucide:chevron-down"
                class="mt-xxs h-4 w-4 shrink-0 text-faint"
                :class="{ 'rotate-180': openKey === stage.key }"
              />
            </button>

            <p
              v-if="openKey === stage.key"
              :id="`pipeline-detail-${stage.key}`"
              class="mx-md border-t border-hairline pt-sm pb-md text-sm text-body"
            >
              {{ stage.detail }}
            </p>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>
