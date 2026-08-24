<script setup lang="ts">
definePageMeta({
  layout: 'docs',
})

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('docs').path(route.path).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Docs page not found', fatal: true })
}

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
})
</script>

<template>
  <article v-if="page" class="docs-prose">
    <h1 class="text-2xl font-semibold tracking-tight text-ink">{{ page.title }}</h1>
    <p v-if="page.description" class="mt-xs text-base text-body">{{ page.description }}</p>

    <div class="mt-lg">
      <ContentRenderer :value="page" />
    </div>
  </article>
</template>

<style>
.docs-prose h1 {
  @apply text-2xl font-semibold tracking-tight text-ink;
}

.docs-prose h2 {
  @apply mt-xl text-xl font-semibold text-ink;
}

.docs-prose h3 {
  @apply mt-lg text-lg font-semibold text-ink;
}

.docs-prose p {
  @apply mt-md text-base leading-relaxed text-body;
}

.docs-prose ul,
.docs-prose ol {
  @apply mt-md flex flex-col gap-xs pl-lg text-base text-body;
}

.docs-prose ul {
  @apply list-disc;
}

.docs-prose ol {
  @apply list-decimal;
}

.docs-prose p a,
.docs-prose li a {
  @apply text-link underline underline-offset-2;
}

.docs-prose h1 a,
.docs-prose h2 a,
.docs-prose h3 a {
  @apply text-inherit no-underline;
}

.docs-prose blockquote {
  @apply mt-md border-l-2 border-hairline pl-md text-sm text-mute;
}

.docs-prose code {
  @apply rounded-sm bg-hairline-soft px-[4px] py-[1px] font-mono text-sm text-ink;
}

.docs-prose pre {
  @apply mt-md overflow-x-auto rounded-md border border-hairline bg-canvas-elevated p-md;
}

.docs-prose pre code {
  @apply bg-transparent p-0;
}
</style>
