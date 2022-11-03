/** @jsxImportSource @emotion/react */
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useTranslation } from 'react-i18next';

import * as exampleActions from '../store/modules/example';
import { bodyRoot, jumbo } from '../assets/css/global';

const Main = ({ ExampleActions, example }) => {
  const [t] = useTranslation(['common']);
  const remote = window.require('@electron/remote');

  const getVersion = async (): Promise<void> => {
    await ExampleActions.setVersion(remote.getGlobal('APP_VERSION_NAME'));
  };

  useEffect(() => {
    getVersion();
  }, []);

  return (
    <div className="root" css={bodyRoot}>
      <div css={jumbo}>
        <img alt="retron-logo" src="images/retron-logo.webp" draggable="false" />
        <p>{t('hello-retron')}</p>
        <p>
          {t('using-version')} <strong>{example.version}</strong>
        </p>
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
