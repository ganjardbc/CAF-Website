<script setup lang="ts">
const stages = [
  { title: 'Ticket', subtitle: 'Linear · Jira', x: 40 },
  { title: 'Plan', subtitle: 'Planner agent', x: 250 },
  { title: 'Implement', subtitle: 'Coding agent', x: 460 },
  { title: 'QA', subtitle: 'Scanner agent · read-only', x: 670 },
  { title: 'Review', subtitle: 'Human checkpoint', x: 880, highlight: true },
  { title: 'PR', subtitle: 'Merged', x: 1090 },
]

const nodeWidth = 160
const nodeHeight = 80
const nodeY = 60
const centerY = nodeY + nodeHeight / 2
</script>

<template>
  <section class="mx-auto max-w-[1200px] px-lg pt-2xl pb-4xl sm:pt-3xl sm:pb-section">
    <div class="mb-2xl text-center">
      <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
        Pipeline
      </span>
      <h2 class="mt-xs text-2xl font-semibold tracking-[-1.28px] text-ink sm:text-[32px] sm:leading-[40px]">
        Ticket sampai PR, dengan gate manusia
      </h2>
      <p class="mx-auto mt-sm max-w-xl text-sm text-body sm:text-base">
        Setiap panah menuju PR melewati checkpoint <strong class="text-ink">Review</strong> —
        tidak ada jalur yang melewatkannya.
      </p>
    </div>

    <div class="overflow-x-auto">
      <svg
        viewBox="0 0 1290 200"
        class="mx-auto block h-auto min-w-[860px] max-w-full"
        role="img"
        aria-label="Diagram pipeline CAF: Ticket dari Linear atau Jira mengalir ke Plan, Implement, QA, lalu wajib melalui checkpoint Review oleh manusia sebelum menjadi PR."
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
            <path d="M0,0 L10,5 L0,10 z" fill="#8f8f8f" />
          </marker>
        </defs>

        <template v-for="(stage, index) in stages" :key="stage.title">
          <line
            v-if="index < stages.length - 1"
            :x1="stage.x + nodeWidth"
            :y1="centerY"
            :x2="stages[index + 1].x"
            :y2="centerY"
            stroke="#8f8f8f"
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
            :fill="stage.highlight ? '#171717' : '#ffffff'"
            stroke="#ebebeb"
          />

          <g v-if="stage.highlight" :transform="`translate(${stage.x + nodeWidth / 2 - 7}, ${nodeY + 14})`">
            <rect x="0" y="6" width="14" height="10" rx="2" fill="none" stroke="#fafafa" stroke-width="1.3" />
            <path d="M3,6 V4 a4,4 0 0 1 8,0 V6" fill="none" stroke="#fafafa" stroke-width="1.3" />
          </g>
          <text
            v-else
            :x="stage.x + nodeWidth / 2"
            :y="nodeY + 22"
            text-anchor="middle"
            font-family="ui-monospace, monospace"
            font-size="10"
            fill="#a1a1a1"
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
            :fill="stage.highlight ? '#fafafa' : '#171717'"
          >
            {{ stage.title }}
          </text>

          <text
            :x="stage.x + nodeWidth / 2"
            :y="nodeY + 64"
            text-anchor="middle"
            font-family="inherit"
            font-size="11"
            :fill="stage.highlight ? '#d1d1d1' : '#8f8f8f'"
          >
            {{ stage.subtitle }}
          </text>
        </g>
      </svg>
    </div>
  </section>
</template>
