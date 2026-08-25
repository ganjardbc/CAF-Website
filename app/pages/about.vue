<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('about.title'),
  description: () => t('about.metaDescription'),
})

definePageMeta({
  layout: 'default',
})
</script>

<template>
  <article class="mx-auto max-w-2xl px-lg py-4xl sm:py-section">
    <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
      {{ t('about.eyebrow') }}
    </span>
    <h1 class="mt-xs text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
      {{ t('about.heading') }}
    </h1>

    <div class="prose-legal mt-lg">
      <p v-html="t('about.p1')" />

      <h2>{{ t('about.h2Why') }}</h2>
      <p>{{ t('about.p2') }}</p>
      <p>{{ t('about.p3') }}</p>

      <h2>{{ t('about.h2Coderium') }}</h2>
      <p v-html="t('about.p4')" />
    </div>
  </article>
</template>

<style>
.prose-legal h2 {
  @apply mt-xl text-lg font-semibold text-ink;
}

.prose-legal p {
  @apply mt-md text-base leading-relaxed text-body;
}

.prose-legal a {
  @apply text-link underline underline-offset-2;
}
</style>
