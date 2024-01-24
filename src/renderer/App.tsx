import { HashRouter, Route, Routes } from 'react-router-dom';

import NotFoundScreen from '@/renderer/screens/NotFoundScreen';
import MainScreen from '@/renderer/screens/MainScreen';

const App = () => (
  <HashRouter>
    <Routes>
      <Route path="/">
        <Route index element={<MainScreen />} />
        <Route path="*" element={NotFoundScreen()} />
      </Route>
    </Routes>
  </HashRouter>
);

export default App;
