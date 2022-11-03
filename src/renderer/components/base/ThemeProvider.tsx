/** @jsxImportSource @emotion/react */
import { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { css, Global, ThemeProvider as EmotionThemeProvider } from '@emotion/react';

const ThemeProvider = ({ children }) => {
  const muiTheme = useMemo(
    () =>
      createTheme({
        breakpoints: {
          values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
          },
        },
        palette: {
          mode: 'light',
        },
      }),
    [],
  );

  return (
    <MuiThemeProvider theme={muiTheme}>
      <Global
        styles={css`
          body {
            margin: 0;
          }
        `}
      />
      <EmotionThemeProvider theme={muiTheme}>{children}</EmotionThemeProvider>
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
