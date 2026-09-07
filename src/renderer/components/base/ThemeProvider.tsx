import { ReactNode, useEffect, useLayoutEffect } from 'react';
import {
  THEME_STORAGE_KEY,
  setDarkTheme,
  setSystemDarkTheme,
} from '@/renderer/store/slices/appScreenSlice';
import { useAppDispatch, useAppSelector } from '@/renderer/store/hooks';
import { SYSTEM_DARK_THEME_QUERY, THEME_SOURCE_COLOR } from '@/renderer/constants';
import { backgroundColors } from '@/common/theme';
import { mainChannels, rendererChannels } from '@/common/ipc';

/*
 * Material Plus has no provider of its own: a component reads the color roles
 * off the document, and every role is generated from one source color. So this
 * component holds the theme state and writes those two custom properties, and
 * the tree below it needs nothing wrapped around it.
 * */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const darkTheme = useAppSelector((state) => state.appScreen.darkTheme);
  const followSystemTheme = useAppSelector((state) => state.appScreen.followSystemTheme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // The renderer is told about a color scheme change directly, so the main
    // process does not have to watch `nativeTheme` and relay it.
    const systemDarkTheme = window.matchMedia(SYSTEM_DARK_THEME_QUERY);

    const handleSystemThemeChange = (event: MediaQueryListEvent): void => {
      dispatch(setSystemDarkTheme(event.matches));
    };

    systemDarkTheme.addEventListener('change', handleSystemThemeChange);

    return () => {
      systemDarkTheme.removeEventListener('change', handleSystemThemeChange);
    };
  }, [dispatch]);

  useEffect(() => {
    // An explicit choice made in another window. Only explicit ones are handed
    // around: a change the operating system makes reaches every window on its
    // own through the media query above.
    const unsubscribe = window.mainApi.on(rendererChannels.darkThemeUpdated, (_event, value) => {
      dispatch(setDarkTheme(value));
    });

    return unsubscribe;
  }, [dispatch]);

  useEffect(() => {
    // Only an explicit choice is stored, so that removing it restores the
    // "follow the operating system" behavior on the next launch.
    if (followSystemTheme) {
      localStorage.removeItem(THEME_STORAGE_KEY);

      return;
    }

    localStorage.setItem(THEME_STORAGE_KEY, String(darkTheme));
    // Each window has a store of its own, so the choice goes through the main
    // process to reach the windows that are already open. The main process also
    // keeps it, and paints the next window with it before its page loads.
    window.mainApi.send(mainChannels.setDarkTheme, darkTheme);
  }, [darkTheme, followSystemTheme]);

  useLayoutEffect(() => {
    const { dataset, style } = document.documentElement;

    // `data-mp-scheme` is what the library reads instead of the media query, so
    // setting it is what makes an explicit choice beat the operating system.
    dataset.mpScheme = darkTheme ? 'dark' : 'light';
    style.setProperty('--mp-source-color', THEME_SOURCE_COLOR);
    // The surface is the one role the library does not get to generate: the main
    // process paints the window with this exact value before the page loads.
    style.setProperty(
      '--mp-sys-color-surface',
      darkTheme ? backgroundColors.dark : backgroundColors.light,
    );
    // Written in a layout effect rather than in `useEffect`, so the first paint
    // of a window already carries the theme it settled on.
  }, [darkTheme]);

  return children;
}
