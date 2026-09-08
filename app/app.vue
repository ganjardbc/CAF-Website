<script setup lang="ts">
useSchemaOrg([
  defineOrganization({
    name: 'CAF (Coderium Agent Framework)',
    logo: '/favicon.png',
  }),
  defineWebSite({
    name: 'CAF',
  }),
])
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
