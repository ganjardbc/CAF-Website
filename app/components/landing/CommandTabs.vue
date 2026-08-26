<script setup lang="ts">
const tabs = [
  { label: 'install', command: 'npm install -g caf-initiator' },
  { label: 'run', command: 'caf-init scaffold' },
]

const active = ref(0)
</script>

<template>
  <div class="w-full max-w-lg overflow-hidden rounded-md border border-hairline bg-canvas-elevated">
    <div class="flex border-b border-hairline">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.label"
        type="button"
        class="px-md py-xs font-mono text-sm transition-colors"
        :class="index === active ? 'text-ink' : 'text-mute hover:text-body'"
        @click="active = index"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="flex items-center justify-between gap-sm px-md py-sm">
      <code class="truncate font-mono text-sm text-ink">{{ tabs[active].command }}</code>
      <span class="shrink-0 text-xs text-faint">$</span>
    </div>
  </div>
</template>
