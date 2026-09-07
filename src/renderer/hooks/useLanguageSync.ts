import { useEffect } from 'react';
import i18n from '@/renderer/i18n';
import { mainChannels, rendererChannels } from '@/common/ipc';
import { supportedLanguages, type SupportedLanguage } from '@/common/locales';

const isSupportedLanguage = (value: unknown): value is SupportedLanguage =>
  supportedLanguages.includes(value as SupportedLanguage);

/*
 * Keeps every open window on the same language.
 *
 * Each window runs its own copy of the app, so the change is reported to the
 * main process, which hands it to the windows that are already open. The guard
 * on the incoming value is what stops the two windows from answering each other.
 * */
export default function useLanguageSync(): void {
  useEffect(() => {
    const handleLanguageChanged = (language: string): void => {
      if (isSupportedLanguage(language)) {
        window.mainApi.send(mainChannels.setLanguage, language);
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    // `on` returns the function that detaches the listener again
    const unsubscribe = window.mainApi.on(
      rendererChannels.languageUpdated,
      (_event: unknown, language: unknown) => {
        if (isSupportedLanguage(language) && language !== i18n.resolvedLanguage) {
          void i18n.changeLanguage(language);
        }
      },
    );

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
      unsubscribe();
    };
  }, []);
}
