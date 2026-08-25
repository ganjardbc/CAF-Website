<script setup lang="ts">
const { t, tm, rt } = useI18n()

const items = computed(() =>
  (tm('faq.items') as { question: string; answer: string }[]).map((item) => ({
    question: rt(item.question),
    answer: rt(item.answer),
  })),
)

const openIndex = ref(0)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? -1 : index
}
</script>

<template>
  <section class="mx-auto max-w-[1200px] px-lg pt-2xl pb-4xl sm:pt-3xl sm:pb-section">
    <div class="mb-2xl text-center">
      <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
        {{ t('faq.eyebrow') }}
      </span>
      <h2 class="mt-xs text-2xl font-semibold tracking-[-1.28px] text-ink sm:text-[32px] sm:leading-[40px]">
        {{ t('faq.title') }}
      </h2>
    </div>

    <div class="mx-auto max-w-2xl divide-y divide-hairline border-y border-hairline">
      <div v-for="(item, index) in items" :key="item.question">
        <button
          type="button"
          class="flex w-full items-center justify-between gap-md py-md text-left"
          :aria-expanded="openIndex === index"
          @click="toggle(index)"
        >
          <span class="text-base font-medium text-ink">{{ item.question }}</span>
          <Icon
            name="lucide:chevron-down"
            class="h-4 w-4 shrink-0 text-mute transition-transform duration-200"
            :class="{ 'rotate-180': openIndex === index }"
          />
        </button>
        <div v-show="openIndex === index" class="pb-md pr-2xl">
          <p class="text-sm text-body">{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
