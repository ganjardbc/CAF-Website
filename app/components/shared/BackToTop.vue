<script setup lang="ts">
const { t } = useI18n()

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 600
}

function toTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <button
      v-if="visible"
      type="button"
      class="fixed right-md bottom-md z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-canvas-elevated text-ink shadow-[0px_2px_2px_rgba(0,0,0,0.04),0px_8px_24px_-4px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5 sm:right-lg sm:bottom-lg"
      :aria-label="t('nav.backToTop')"
      :title="t('nav.backToTop')"
      @click="toTop"
    >
      <Icon name="lucide:arrow-up" class="h-5 w-5" />
    </button>
  </Transition>
</template>
