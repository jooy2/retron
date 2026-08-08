import { HashRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/renderer/store';
import ThemeProvider from '@/renderer/components/base/ThemeProvider';

import NotFoundScreen from '@/renderer/screens/NotFoundScreen';
import MainScreen from '@/renderer/screens/MainScreen';
import SecondScreen from '@/renderer/screens/SecondScreen';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <HashRouter>
          <Routes>
            <Route path="/">
              <Route index element={<MainScreen />} />
              {/* Opened in a window of its own from the main screen */}
              <Route path="second" element={<SecondScreen />} />
              <Route path="*" element={<NotFoundScreen />} />
            </Route>
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </Provider>
  );
}
