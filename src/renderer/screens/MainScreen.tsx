/** @jsxImportSource @emotion/react */
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { increaseCount, setDarkTheme, setVersion } from '@/renderer/store/slices/appScreenSlice';
import { bodyRoot, jumbo } from '@/renderer/assets/css/global';
import { languageNames, supportedLanguages } from '@/common/locales';
import { mainChannels } from '@/common/ipc';
import { useAppDispatch, useAppSelector } from '@/renderer/store/hooks';

export default function MainScreen() {
  const darkTheme = useAppSelector((state) => state.appScreen.darkTheme);
  const appVersion = useAppSelector((state) => state.appScreen.version);
  const counterValue = useAppSelector((state) => state.appScreen.counterValue);
  const [t, i18n] = useTranslation(['common']);
  const dispatch = useAppDispatch();

  const handleGithubLink = (): void => {
    window.mainApi.send(mainChannels.openExternalLink, 'https://github.com/jooy2/retron');
  };

  const handleChangeTheme = (): void => {
    dispatch(setDarkTheme(!darkTheme));
  };

  const handleIncreaseCount = (): void => {
    dispatch(increaseCount());
  };

  const handleChangeLanguage = async (language: string): Promise<void> => {
    // The detector caches the choice, so it is restored on the next launch
    await i18n.changeLanguage(language);
  };

  useEffect(() => {
    // Get application version from package.json version string (Using IPC communication)
    dispatch(setVersion(window.mainApi.sendSync(mainChannels.requestGetVersion)));
  }, []);

  return (
    <div css={bodyRoot}>
      <div css={jumbo}>
        <Grid container sx={{ alignItems: 'center' }} spacing={3}>
          <Grid size={5}>
            <img
              data-testid="main-logo"
              alt="logo"
              src="images/retron-logo.webp"
              draggable="false"
            />
          </Grid>
          <Grid size={7}>
            <h1>{t('hello-title')}</h1>
            <p>{t('hello-desc')}</p>
            <p>
              {t('using-version')} <strong>{appVersion}</strong>
            </p>
            <p data-testid="counter-value">
              {t('count-value')}{' '}
              <span>
                <strong role="status">{counterValue}</strong>
              </span>
            </p>
            <ButtonGroup variant="contained">
              <Button onClick={handleGithubLink}>{t('source-code')}</Button>
              <Button data-testid="btn-change-theme" onClick={handleChangeTheme}>
                {darkTheme ? '🌞' : '🌙'}
              </Button>
              <Button data-testid="btn-counter" color="success" onClick={handleIncreaseCount}>
                +1
              </Button>
            </ButtonGroup>
            <TextField
              select
              size="small"
              margin="normal"
              label={t('language')}
              value={i18n.resolvedLanguage ?? 'en'}
              onChange={(event) => handleChangeLanguage(event.target.value)}
              data-testid="select-language"
              sx={{ display: 'flex', maxWidth: 160 }}
            >
              {supportedLanguages.map((language) => (
                <MenuItem key={language} value={language}>
                  {languageNames[language]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
