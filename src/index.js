import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './renderer/App';
import store from './renderer/store';
import './renderer/i18n';
import ThemeProvider from './renderer/components/base/ThemeProvider';

createRoot(document.getElementById('app'))
  .render(
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>,
  );
