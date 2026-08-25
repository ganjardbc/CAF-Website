import en from './locales/en.json'
import id from './locales/id.json'

export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'en',
  messages: { en, id },
}))
