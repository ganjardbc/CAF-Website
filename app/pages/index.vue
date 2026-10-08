<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('index.title'),
  description: () => t('index.description'),
})

useSchemaOrg([
  defineSoftwareApp({
    name: 'CAF (Coderium Agent Framework)',
    description:
      'AI agent orchestration framework with strict governance — Plan, Implement, Verify, PR, behind quality gates, with a human deciding every merge.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Linux, macOS',
    offers: { price: 0, priceCurrency: 'USD' },
  }),
])

definePageMeta({
  layout: 'default',
})
</script>

<template>
  <LandingHero />
  <LandingFeatureGrid />
  <LandingCoreComponents />
  <LandingPipelineDiagram />
  <LandingFaq />
</template>
