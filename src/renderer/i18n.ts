import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
// The language list itself is shared with the main process, see `common/locales`
import { fallbackLanguage, supportedLanguages } from '@/common/locales';

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
    fallbackLng: fallbackLanguage,
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
