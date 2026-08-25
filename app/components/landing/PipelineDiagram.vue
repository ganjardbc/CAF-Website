<script setup lang="ts">
const { t } = useI18n()

const stages = computed(() => [
  { title: t('pipeline.stages.ticket.title'), subtitle: t('pipeline.stages.ticket.subtitle'), x: 40 },
  { title: t('pipeline.stages.plan.title'), subtitle: t('pipeline.stages.plan.subtitle'), x: 250 },
  { title: t('pipeline.stages.implement.title'), subtitle: t('pipeline.stages.implement.subtitle'), x: 460 },
  { title: t('pipeline.stages.qa.title'), subtitle: t('pipeline.stages.qa.subtitle'), x: 670 },
  { title: t('pipeline.stages.review.title'), subtitle: t('pipeline.stages.review.subtitle'), x: 880, highlight: true },
  { title: t('pipeline.stages.pr.title'), subtitle: t('pipeline.stages.pr.subtitle'), x: 1090 },
])

const nodeWidth = 160
const nodeHeight = 80
const nodeY = 60
const centerY = nodeY + nodeHeight / 2

const colorMode = useColorMode()
const palette = computed(() =>
  colorMode.value === 'dark'
    ? {
        canvasElevated: '#171717',
        hairline: '#2e2e2e',
        mute: '#8a8a8a',
        faint: '#6b6b6b',
        highlightBg: '#ededed',
        highlightText: '#0a0a0a',
        highlightSubtle: '#525252',
        ink: '#ededed',
      }
    : {
        canvasElevated: '#ffffff',
        hairline: '#ebebeb',
        mute: '#8f8f8f',
        faint: '#a1a1a1',
        highlightBg: '#171717',
        highlightText: '#fafafa',
        highlightSubtle: '#d1d1d1',
        ink: '#171717',
      },
)
</script>

<template>
  <section class="mx-auto max-w-[1200px] px-lg pt-2xl pb-4xl sm:pt-3xl sm:pb-section">
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

    <div class="overflow-x-auto">
      <svg
        viewBox="0 0 1290 200"
        class="mx-auto block h-auto min-w-[860px] max-w-full"
        role="img"
        :aria-label="t('pipeline.ariaLabel')"
      >
        <defs>
          <marker
            id="pipeline-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" :fill="palette.mute" />
          </marker>
        </defs>

        <template v-for="(stage, index) in stages" :key="stage.title">
          <line
            v-if="index < stages.length - 1"
            :x1="stage.x + nodeWidth"
            :y1="centerY"
            :x2="stages[index + 1].x"
            :y2="centerY"
            :stroke="palette.mute"
            stroke-width="1.5"
            marker-end="url(#pipeline-arrow)"
          />
        </template>

        <g v-for="stage in stages" :key="stage.title">
          <rect
            :x="stage.x"
            :y="nodeY"
            :width="nodeWidth"
            :height="nodeHeight"
            rx="12"
            :fill="stage.highlight ? palette.highlightBg : palette.canvasElevated"
            :stroke="palette.hairline"
          />

          <g v-if="stage.highlight" :transform="`translate(${stage.x + nodeWidth / 2 - 7}, ${nodeY + 14})`">
            <rect x="0" y="6" width="14" height="10" rx="2" fill="none" :stroke="palette.highlightText" stroke-width="1.3" />
            <path d="M3,6 V4 a4,4 0 0 1 8,0 V6" fill="none" :stroke="palette.highlightText" stroke-width="1.3" />
          </g>
          <text
            v-else
            :x="stage.x + nodeWidth / 2"
            :y="nodeY + 22"
            text-anchor="middle"
            font-family="ui-monospace, monospace"
            font-size="10"
            :fill="palette.faint"
          >
            {{ String(stages.indexOf(stage) + 1).padStart(2, '0') }}
          </text>

          <text
            :x="stage.x + nodeWidth / 2"
            :y="nodeY + (stage.highlight ? 48 : 46)"
            text-anchor="middle"
            font-family="inherit"
            font-size="16"
            font-weight="600"
            :fill="stage.highlight ? palette.highlightText : palette.ink"
          >
            {{ stage.title }}
          </text>

          <text
            :x="stage.x + nodeWidth / 2"
            :y="nodeY + 64"
            text-anchor="middle"
            font-family="inherit"
            font-size="11"
            :fill="stage.highlight ? palette.highlightSubtle : palette.mute"
          >
            {{ stage.subtitle }}
          </text>
        </g>
      </svg>
    </div>
  </section>
</template>
