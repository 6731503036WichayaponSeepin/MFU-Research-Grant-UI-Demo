
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import th from './locales/th.json'
import en from './locales/en.json'

let savedLanguage
try { savedLanguage = localStorage.getItem('mfu-language') } catch { savedLanguage = 'th' }

i18n.use(initReactI18next).init({
  resources: {
    th: { translation: th },
    en: { translation: en }
  },
  lng: savedLanguage === 'en' ? 'en' : 'th',
  fallbackLng: false,
  saveMissing: false,
  interpolation: {
    escapeValue: false
  }
})

export default i18n

i18n.on('languageChanged', language => { document.documentElement.lang = language })
document.documentElement.lang = i18n.language
