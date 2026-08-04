/** @jsxImportSource @emotion/react */
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { increaseCount, setDarkTheme, setVersion } from '@/renderer/store/slices/appScreenSlice';
import { bodyRoot, jumbo } from '@/renderer/assets/css/global';
import { useAppDispatch, useAppSelector } from '@/renderer/store/hooks';

export default function MainScreen() {
  const darkTheme = useAppSelector((state) => state.appScreen.darkTheme);
  const appVersion = useAppSelector((state) => state.appScreen.version);
  const counterValue = useAppSelector((state) => state.appScreen.counterValue);
  const [t] = useTranslation(['common']);
  const dispatch = useAppDispatch();

  const handleGithubLink = async (): Promise<void> => {
    await window.mainApi.send('msgOpenExternalLink', 'https://github.com/jooy2/retron');
  };

  const handleChangeTheme = (): void => {
    dispatch(setDarkTheme(!darkTheme));
  };

  const handleIncreaseCount = (): void => {
    dispatch(increaseCount());
  };

  useEffect(() => {
    // Get application version from package.json version string (Using IPC communication)
    dispatch(setVersion(window.mainApi.sendSync('msgRequestGetVersion')));
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
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
