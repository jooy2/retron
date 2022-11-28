/** @jsxImportSource @emotion/react */
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useTranslation } from 'react-i18next';

import { Button, ButtonGroup, Grid } from '@mui/material';
import { openExternal } from '@/renderer/assets/js/utils';
import * as exampleActions from '../store/modules/example';
import { bodyRoot, jumbo } from '../assets/css/global';

const Main = ({ ExampleActions, example }) => {
  const [t] = useTranslation(['common']);
  const remote = window.require('@electron/remote');

  const getVersion = async (): Promise<void> => {
    await ExampleActions.setVersion(remote.getGlobal('APP_VERSION_NAME'));
  };

  const handleGithubLink = async (): Promise<void> => {
    await openExternal('https://github.com/jooy2/retron');
  };

  const handleChangeTheme = async (): Promise<void> => {
    await ExampleActions.setDarkTheme(!example.darkTheme);
  };

  useEffect(() => {
    getVersion();
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
              {t('using-version')} <strong>{example.version}</strong>
            </p>
            <ButtonGroup variant="contained">
              <Button onClick={handleGithubLink}>{t('github')}</Button>
              <Button onClick={handleChangeTheme}>{example.darkTheme ? '🌞' : '🌙'}</Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  example: state.example,
});

const mapDispatchToProps = (dispatch) => ({
  ExampleActions: bindActionCreators({ ...exampleActions }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
