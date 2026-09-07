import { BrowserWindow, nativeTheme } from 'electron';
import { rendererChannels } from '@/common/ipc';
import { backgroundColors } from '@/common/theme';
import { supportedLanguages, type SupportedLanguage } from '@/common/locales';

/*
 * The look the windows share.
 *
 * Every window runs its own copy of the renderer with its own store, so a choice
 * made in one of them reaches the others only if the main process passes it on.
 * What the renderer reports is also kept here, so that a window opened later
 * starts on the right background instead of flashing the previous one.
 * */

// `null` while no window has reported an explicit choice, which means the
// operating system still decides
let darkTheme: boolean | null = null;
let language: SupportedLanguage | null = null;

/*
 * Sends a value to every window but the one it came from, which already has it.
 * */
const broadcast = (channel: string, payload: unknown, sender: BrowserWindow | null): void => {
  BrowserWindow.getAllWindows().forEach((browserWindow) => {
    if (browserWindow.isDestroyed() || browserWindow === sender) {
      return;
    }

    browserWindow.webContents.send(channel, payload);
  });
};

export const getBackgroundColor = (): string =>
  (darkTheme ?? nativeTheme.shouldUseDarkColors) ? backgroundColors.dark : backgroundColors.light;

export const getLanguage = (): SupportedLanguage | null => language;

/*
 * Both setters take a value the renderer chose, so each one is checked before it
 * is stored and passed on.
 * */
export const setDarkTheme = (value: unknown, sender: BrowserWindow | null): void => {
  if (typeof value !== 'boolean') {
    console.warn(`Ignored a theme that is not a boolean: ${String(value)}`);

    return;
  }

  darkTheme = value;

  broadcast(rendererChannels.darkThemeUpdated, value, sender);
};

export const setLanguage = (value: unknown, sender: BrowserWindow | null): void => {
  if (!supportedLanguages.includes(value as SupportedLanguage)) {
    console.warn(`Ignored an unsupported language: ${String(value)}`);

    return;
  }

  language = value as SupportedLanguage;

  broadcast(rendererChannels.languageUpdated, language, sender);
};
