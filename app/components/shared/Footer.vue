<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const links = computed(() => [
  { label: t('footer.about'), to: localePath('/about') },
  { label: t('footer.changelog'), to: localePath('/changelog') },
  { label: t('footer.terms'), to: localePath('/legal/terms') },
  { label: t('footer.privacy'), to: localePath('/legal/privacy') },
])
</script>

<template>
  <footer class="border-t border-hairline bg-canvas">
    <div class="mx-auto max-w-[1200px] px-lg py-xl">
      <div class="flex flex-col items-center gap-lg sm:flex-row sm:items-center sm:justify-between">
        <span class="font-mono text-sm font-semibold tracking-tight text-ink">CAF</span>

        <div class="flex flex-row flex-wrap items-center justify-center gap-sm sm:gap-lg">
          <NuxtLink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="text-sm text-body hover:text-ink"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </div>

      <p class="mt-lg text-center text-xs text-faint">
        {{ t('footer.copyright', { year: new Date().getFullYear() }) }}
      </p>
    </div>
  </footer>
</template>
