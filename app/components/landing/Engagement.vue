<script setup lang="ts">
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

const contactUrl = 'mailto:coderium.id@gmail.com'

const options = computed(() =>
  ['self', 'installed', 'support'].map((key) => ({
    key,
    featured: key === 'installed',
    title: t(`engagement.${key}.title`),
    subtitle: t(`engagement.${key}.subtitle`),
    points: (tm(`engagement.${key}.points`) as string[]).map((p) => rt(p)),
    cta: t(`engagement.${key}.cta`),
  })),
)
</script>

<template>
  <section class="mx-auto max-w-[1200px] px-lg pt-2xl pb-4xl sm:pt-3xl sm:pb-section">
    <div class="mb-2xl text-center">
      <span class="font-mono text-xs font-medium uppercase tracking-wide text-mute">
        {{ t('engagement.eyebrow') }}
      </span>
      <h2 class="mt-xs text-2xl font-semibold tracking-[-1.28px] text-ink sm:text-[32px] sm:leading-[40px]">
        {{ t('engagement.title') }}
      </h2>
    </div>

    <div class="grid grid-cols-1 gap-lg lg:grid-cols-3">
      <div
        v-for="option in options"
        :key="option.key"
        class="flex flex-col rounded-lg bg-canvas-elevated p-xl"
        :class="
          option.featured
            ? 'border-2 border-ink shadow-[0px_2px_2px_rgba(0,0,0,0.04),0px_8px_16px_-4px_rgba(0,0,0,0.04)]'
            : 'border border-hairline'
        "
      >
        <h3 class="text-xl font-semibold text-ink">{{ option.title }}</h3>
        <p class="mt-xs text-base font-medium text-body">{{ option.subtitle }}</p>

        <ul class="mt-lg flex flex-1 flex-col gap-xs">
          <li
            v-for="point in option.points"
            :key="point"
            class="flex items-start gap-xs text-sm text-body"
          >
            <Icon name="lucide:check" class="mt-[3px] h-4 w-4 shrink-0 text-ink" />
            <span>{{ point }}</span>
          </li>
        </ul>

        <NuxtLink
          v-if="option.key === 'self'"
          :to="localePath('/docs')"
          class="mt-xl rounded-pill border border-hairline px-md py-xs text-center text-base font-medium text-ink"
        >
          {{ option.cta }}
        </NuxtLink>
        <a
          v-else
          :href="contactUrl"
          class="mt-xl inline-flex items-center justify-center gap-xs rounded-pill px-md py-xs text-base font-medium"
          :class="
            option.featured
              ? 'bg-ink text-canvas-elevated'
              : 'border border-hairline text-ink'
          "
        >
          <Icon name="lucide:mail" class="h-4 w-4" />
          {{ option.cta }}
        </a>
      </div>
    </div>

    <div class="mt-lg flex items-start gap-md rounded-lg border border-hairline bg-canvas-elevated p-xl">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-hairline bg-canvas">
        <Icon name="lucide:handshake" class="h-5 w-5 text-ink" />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-ink">{{ t('engagement.partner.title') }}</h3>
        <p class="mt-xxs text-sm text-body">{{ t('engagement.partner.description') }}</p>
      </div>
    </div>
  </section>
</template>
