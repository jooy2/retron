import { HashRouter, Route, Routes } from 'react-router-dom';

import ScreenNotFound from '@/renderer/screens/ScreenNotFound';
import Main from '@/renderer/screens/Main';

const App = () => (
  <HashRouter>
    <Routes>
      <Route path="/">
        <Route index element={<Main />} />
        <Route path="*" element={ScreenNotFound()} />
      </Route>
    </Routes>
  </HashRouter>
);

export default App;
