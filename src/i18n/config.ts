import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import zh from './locales/zh.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';
import th from './locales/th.json';
import vi from './locales/vi.json';
import ms from './locales/ms.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      fr: { translation: fr },
      de: { translation: de },
      ko: { translation: ko },
      ja: { translation: ja },
      th: { translation: th },
      vi: { translation: vi },
      ms: { translation: ms },
    },
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem('lang', lng);
});

export default i18n;
