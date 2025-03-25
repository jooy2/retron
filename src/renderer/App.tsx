import { HashRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/renderer/store';
import ThemeProvider from '@/renderer/components/base/ThemeProvider';

import NotFoundScreen from '@/renderer/screens/NotFoundScreen';
import MainScreen from '@/renderer/screens/MainScreen';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <HashRouter>
          <Routes>
            <Route path="/">
              <Route index element={<MainScreen />} />
              <Route path="*" element={NotFoundScreen()} />
            </Route>
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </Provider>
  );
}
