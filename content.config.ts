import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: [
        { include: 'en/docs/**/*.md', prefix: '/docs' },
        { include: 'id/docs/**/*.md', prefix: '/id/docs' },
      ],
    }),
  },
})
