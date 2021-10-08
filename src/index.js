import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './renderer/App';
import store from './renderer/store';
import './renderer/i18n';
import ThemeProvider from './renderer/components/base/ThemeProvider';

ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </BrowserRouter>,
  document.getElementById('root'),
);
