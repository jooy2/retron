/** @jsxImportSource @emotion/react */
import { ReactNode, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { setDarkTheme } from '@/renderer/store/slices/appScreenSlice';
import { useAppDispatch, useAppSelector } from '@/renderer/store/hooks';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const darkTheme = useAppSelector((state) => state.appScreen.darkTheme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // The main process notifies every window when the OS color scheme changes.
    // `on` returns the function that detaches the listener again.
    const unsubscribe = window.mainApi.on(
      'msgNativeThemeUpdated',
      (_event: unknown, shouldUseDarkColors: boolean) => {
        dispatch(setDarkTheme(shouldUseDarkColors));
      },
    );

    return unsubscribe;
  }, [dispatch]);

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
