<script setup lang="ts">
import logoWhite from '../../assets/images/logo-white.png'
import logoBlack from '../../assets/images/logo-black.png'

const { t } = useI18n()
const localePath = useLocalePath()
const colorMode = useColorMode()
const logo = computed(() => (colorMode.value === 'dark' ? logoWhite : logoBlack))

const links = computed(() => [
  { label: t('footer.terms'), to: localePath('/legal/terms') },
  { label: t('footer.privacy'), to: localePath('/legal/privacy') },
])
</script>

<template>
  <footer class="border-t border-hairline bg-canvas">
    <div class="mx-auto max-w-[1200px] px-lg py-xl">
      <div class="flex flex-col items-center gap-lg sm:flex-row sm:items-center sm:justify-between">
        <img :src="logo" class="w-20" />

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
