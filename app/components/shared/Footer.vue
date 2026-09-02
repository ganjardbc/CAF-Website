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

        <div class="flex flex-col md:flex-row flex-wrap items-center justify-center gap-sm sm:gap-lg">
          <div class="flex flex-row items-center gap-sm">
            <a
              href="https://github.com/coderiumid/caf-initiator"
              target="_blank"
              rel="noopener"
              aria-label="GitHub"
              class="text-body hover:text-ink w-8 h-8 flex items-center justify-center rounded-full"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.896-.014 3.286 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
            </a>

            <a
              href="https://www.npmjs.com/package/caf-initiator"
              target="_blank"
              rel="noopener"
              aria-label="npm"
              class="text-body hover:text-ink w-8 h-8 flex items-center justify-center rounded-full"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332H10.665v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" /></svg>
            </a>
          </div>

          <div class="flex flex-row items-center gap-sm">
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
      </div>

      <p class="mt-lg text-center text-xs text-faint">
        {{ t('footer.copyright', { year: new Date().getFullYear() }) }}
      </p>
    </div>
  </footer>
</template>
