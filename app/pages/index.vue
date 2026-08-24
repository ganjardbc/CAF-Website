<script setup lang="ts">
useSeoMeta({
  title: 'CAF — Coderium Agent Framework',
  description:
    'AI agent orchestration framework dengan governance ketat, dari ticket sampai PR.',
})

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
