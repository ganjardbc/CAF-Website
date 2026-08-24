<script setup lang="ts">
useSeoMeta({
  ogImage: '/og-image.png',
  twitterImage: '/og-image.png',
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SharedNavbar />
    <main class="flex-1">
      <slot />
    </main>
    <SharedFooter />
  </div>
</template>
