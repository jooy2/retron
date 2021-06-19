import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useTranslation } from 'react-i18next';
import './Main.css';

import * as exampleActions from '../store/modules/example';

const Main = ({ ExampleActions, example }) => {
  const [t] = useTranslation(['common']);
  const remote = window.require('@electron/remote');

  const getVersion = async () => {
    await ExampleActions.setVersion(remote.getGlobal('APP_VERSION_NAME'));
  };

  useEffect(() => {
    getVersion().then(() => null);
  }, []);

  return (
    <div className="root">
      <div className="jumbo">
        <h1>Hello, Retron!</h1>
        <p>{t('hello-retron')}</p>
        <p>
          {t('using-version')}
          {' '}
          <strong>{example.version}</strong>
        </p>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  example: state.example,
});

const mapDispatchToProps = dispatch => ({
  ExampleActions: bindActionCreators({ ...exampleActions }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
