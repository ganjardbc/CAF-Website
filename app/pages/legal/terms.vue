<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('legal.terms.title'),
  description: () => t('legal.terms.metaDescription'),
})

definePageMeta({
  layout: 'default',
})

const changelogHref = computed(() => localePath('/changelog'))
</script>

<template>
  <article class="mx-auto max-w-2xl px-lg py-4xl sm:py-section">
    <h1 class="text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
      {{ t('legal.terms.heading') }}
    </h1>
    <p class="mt-xs text-sm text-mute">{{ t('legal.lastUpdated') }}</p>

    <div class="mt-lg rounded-md border border-hairline bg-hairline-soft px-md py-sm text-sm text-body">
      <strong class="text-ink">{{ t('legal.draftLabel') }}</strong>
      <span v-html="' ' + t('legal.draftNoticeSuffix')" />
    </div>

    <div class="prose-legal mt-xl">
      <h2>{{ t('legal.terms.s1Title') }}</h2>
      <p v-html="t('legal.terms.s1Body')" />

      <h2>{{ t('legal.terms.s2Title') }}</h2>
      <p v-html="t('legal.terms.s2Body')" />

      <h2>{{ t('legal.terms.s3Title') }}</h2>
      <p v-html="t('legal.terms.s3Body')" />

      <h2>{{ t('legal.terms.s4Title') }}</h2>
      <p v-html="t('legal.terms.s4Body1')" />
      <p>{{ t('legal.terms.s4Body2') }}</p>

      <h2>{{ t('legal.terms.s5Title') }}</h2>
      <p v-html="t('legal.terms.s5Body', { changelogHref })" />
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
