// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxt/content', '@nuxtjs/seo'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
  },

  site: {
    url: 'https://caf.coderium.dev',
    name: 'CAF',
  },

  nitro: {
    prerender: {
      // Fase 1: hanya '/' ada. crawlLinks + link-checker akan diaktifkan lagi
      // begitu semua halaman di sitemap (docs, about, legal, changelog) sudah dibuat.
      crawlLinks: false,
      routes: ['/'],
    },
  },

  linkChecker: {
    enabled: false,
  },
})
