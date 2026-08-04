import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Languages that have a matching folder in `src/renderer/public/locales`.
// Add a new language here after creating its translation files.
export const supportedLanguages = ['en', 'de', 'fr', 'ja', 'ko'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ns: ['common'],
    supportedLngs: supportedLanguages,
    load: 'languageOnly',
    defaultNS: 'common',
    fallbackNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    backend: {
      loadPath: 'locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
