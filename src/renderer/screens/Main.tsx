/** @jsxImportSource @emotion/react */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { increaseCount, setDarkTheme, setVersion } from '@/renderer/store/slices/appScreenSlice';
import { bodyRoot, jumbo } from '@/renderer/assets/css/global';
import type { RootState } from '@/renderer/store';

const Main = () => {
  const darkTheme = useSelector((state: RootState) => state.appScreen.darkTheme);
  const appVersion = useSelector((state: RootState) => state.appScreen.version);
  const counterValue = useSelector((state: RootState) => state.appScreen.counterValue);
  const [t] = useTranslation(['common']);
  const dispatch = useDispatch();

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
    window.mainApi.receive('msgReceivedVersion', (event, version: string) => {
      dispatch(setVersion(version));
    });

    window.mainApi.send('msgRequestGetVersion');
  }, []);

  return (
    <div css={bodyRoot}>
      <div css={jumbo}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={5}>
            <img id="main-logo" alt="logo" src="images/retron-logo.webp" draggable="false" />
          </Grid>
          <Grid item xs={7}>
            <h1>{t('hello-title')}</h1>
            <p>{t('hello-desc')}</p>
            <p>
              {t('using-version')} <strong>{appVersion}</strong>
            </p>
            <p>
              {t('count-value')}{' '}
              <span id="counter-value">
                <strong>{counterValue}</strong>
              </span>
            </p>
            <ButtonGroup variant="contained">
              <Button onClick={handleGithubLink}>{t('github')}</Button>
              <Button id="btn-change-theme" onClick={handleChangeTheme}>
                {darkTheme ? '🌞' : '🌙'}
              </Button>
              <Button id="btn-counter" color="success" onClick={handleIncreaseCount}>
                +1
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Main;
