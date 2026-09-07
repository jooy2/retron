/** @jsxImportSource @emotion/react */
import { ReactNode, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { THEME_STORAGE_KEY, setSystemDarkTheme } from '@/renderer/store/slices/appScreenSlice';
import { useAppDispatch, useAppSelector } from '@/renderer/store/hooks';
import { SYSTEM_DARK_THEME_QUERY } from '@/renderer/constants';

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
    // Only an explicit choice is stored, so that removing it restores the
    // "follow the operating system" behavior on the next launch.
    if (followSystemTheme) {
      localStorage.removeItem(THEME_STORAGE_KEY);

      return;
    }

    localStorage.setItem(THEME_STORAGE_KEY, String(darkTheme));
  }, [darkTheme, followSystemTheme]);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkTheme ? 'dark' : 'light',
          background: {
            default: darkTheme ? '#111111' : '#ffffff',
          },
        },
      }),
    [darkTheme],
  );

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <EmotionThemeProvider theme={muiTheme}>{children}</EmotionThemeProvider>
    </MuiThemeProvider>
  );
}
