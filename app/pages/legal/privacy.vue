<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('legal.privacy.title'),
  description: () => t('legal.privacy.metaDescription'),
})

definePageMeta({
  layout: 'default',
})

const layer3Href = computed(() => localePath('/docs/core-concepts/layer-3'))
const envVarsHref = computed(() => localePath('/docs/reference/environment-variables'))
</script>

<template>
  <article class="mx-auto max-w-2xl px-lg py-4xl sm:py-section">
    <h1 class="text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
      {{ t('legal.privacy.heading') }}
    </h1>
    <p class="mt-xs text-sm text-mute">{{ t('legal.lastUpdated') }}</p>

    <div class="mt-lg rounded-md border border-hairline bg-hairline-soft px-md py-sm text-sm text-body">
      <strong class="text-ink">{{ t('legal.draftLabel') }}</strong>
      <span v-html="' ' + t('legal.draftNoticeSuffix')" />
    </div>

    <div class="prose-legal mt-xl">
      <h2>{{ t('legal.privacy.s1Title') }}</h2>
      <p v-html="t('legal.privacy.s1Body', { layer3Href })" />

      <h2>{{ t('legal.privacy.s2Title') }}</h2>
      <p v-html="t('legal.privacy.s2Body1')" />
      <p>{{ t('legal.privacy.s2Body2') }}</p>

      <h2>{{ t('legal.privacy.s3Title') }}</h2>
      <p v-html="t('legal.privacy.s3Body', { envVarsHref })" />

      <h2>{{ t('legal.privacy.s4Title') }}</h2>
      <p v-html="t('legal.privacy.s4Body')" />
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
