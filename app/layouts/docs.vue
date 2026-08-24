<script setup lang="ts">
useSeoMeta({
  ogImage: '/og-image.png',
  twitterImage: '/og-image.png',
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SharedNavbar />
    <div class="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-lg px-lg py-xl lg:flex-row lg:gap-xl">
      <aside class="shrink-0 lg:w-56 lg:border-r lg:border-hairline lg:pr-lg">
        <DocsSidebar />
      </aside>
      <main class="min-w-0 flex-1">
        <slot />
      </main>
    </div>
    <SharedFooter />
  </div>
</template>
