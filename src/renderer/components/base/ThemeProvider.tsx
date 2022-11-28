/** @jsxImportSource @emotion/react */
import { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { css, Global, ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { connect } from 'react-redux';
import { CssBaseline } from '@mui/material';

const ThemeProvider = ({ children, example }) => {
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
          mode: example.darkTheme ? 'dark' : 'light',
          background: {
            default: example.darkTheme ? '#111111' : '#ffffff',
          },
        },
      }),
    [example.darkTheme],
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
      <CssBaseline />
      <EmotionThemeProvider theme={muiTheme}>{children}</EmotionThemeProvider>
    </MuiThemeProvider>
  );
};

const mapStateToProps = (state) => ({
  example: state.example,
});

export default connect(mapStateToProps)(ThemeProvider);
