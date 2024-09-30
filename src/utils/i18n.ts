import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslations from '@/locales/en.json'
import zhTranslations from '@/locales/zh.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      zh: { translation: zhTranslations },
    },
    lng: 'en', // 设置默认语言
    fallbackLng: 'zh', // 设置回退语言
    interpolation: {
      escapeValue: false // 不转义 HTML
    }
  })

export default i18n
