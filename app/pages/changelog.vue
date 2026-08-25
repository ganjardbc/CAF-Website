<script setup lang="ts">
const { t, tm, rt } = useI18n()

useSeoMeta({
  title: () => t('changelog.title'),
  description: () => t('changelog.metaDescription'),
})

definePageMeta({
  layout: 'default',
})

const releases = computed(() =>
  (tm('changelog.releases') as { version: string; date: string; items: string[] }[]).map((release) => ({
    version: rt(release.version),
    date: rt(release.date),
    items: (release.items as unknown as string[]).map((item) => rt(item)),
  })),
)
</script>

<template>
  <article class="mx-auto max-w-2xl px-lg py-4xl sm:py-section">
    <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
      {{ t('changelog.eyebrow') }}
    </span>
    <h1 class="mt-xs text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
      {{ t('changelog.heading') }}
    </h1>
    <p class="mt-sm text-base text-body">
      {{ t('changelog.intro') }}
    </p>

    <div class="mt-xl flex flex-col gap-2xl">
      <section
        v-for="release in releases"
        :key="release.version"
        class="border-l-2 border-hairline pl-lg"
      >
        <div class="flex items-baseline gap-xs">
          <h2 class="font-mono text-lg font-semibold text-ink">{{ release.version }}</h2>
          <span class="text-sm text-mute">{{ release.date }}</span>
        </div>
        <ul class="mt-sm flex list-disc flex-col gap-xs pl-lg">
          <li v-for="item in release.items" :key="item" class="text-base text-body">
            {{ item }}
          </li>
        </ul>
      </section>
    </div>
  </article>
</template>
