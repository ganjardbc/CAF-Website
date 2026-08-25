<script setup lang="ts">
const { t, tm, rt } = useI18n()

const icons = [
  'lucide:repeat',
  'lucide:file-text',
  'lucide:columns-3',
  'lucide:user-check',
  'lucide:eye',
]

const features = computed(() =>
  (tm('featureGrid.items') as { title: string; description: string }[]).map((item, index) => ({
    icon: icons[index],
    title: rt(item.title),
    description: rt(item.description),
  })),
)
</script>

<template>
  <section class="mx-auto max-w-[1200px] px-lg pt-2xl pb-4xl sm:pt-3xl sm:pb-section">
    <div class="mb-2xl text-center">
      <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
        {{ t('featureGrid.eyebrow') }}
      </span>
      <h2 class="mt-xs text-2xl font-semibold tracking-[-1.28px] text-ink sm:text-[32px] sm:leading-[40px]">
        {{ t('featureGrid.title') }}
      </h2>
    </div>

    <div class="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="rounded-md border border-hairline bg-canvas-elevated p-lg"
      >
        <Icon :name="feature.icon" class="h-5 w-5 text-ink" />
        <h3 class="mt-md text-lg font-semibold text-ink">{{ feature.title }}</h3>
        <p class="mt-xs text-sm text-body">{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>
