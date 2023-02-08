/** @jsxImportSource @emotion/react */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Button, ButtonGroup, Grid } from '@mui/material';
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
    <div className="root" css={bodyRoot}>
      <div css={jumbo}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={5}>
            <img alt="logo" src="images/retron-logo.webp" draggable="false" />
          </Grid>
          <Grid item xs={7}>
            <h1>{t('hello-title')}</h1>
            <p>{t('hello-desc')}</p>
            <p>
              {t('using-version')} <strong>{appVersion}</strong>
            </p>
            <p>
              {t('count-value')} <strong>{counterValue}</strong>
            </p>
            <ButtonGroup variant="contained">
              <Button onClick={handleGithubLink}>{t('github')}</Button>
              <Button onClick={handleChangeTheme}>{darkTheme ? '🌞' : '🌙'}</Button>
              <Button color="success" onClick={handleIncreaseCount}>
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
