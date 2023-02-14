import { HashRouter, Route, Routes } from 'react-router-dom';

import PageNotFound from '@/renderer/screens/PageNotFound';
import Main from '@/renderer/screens/Main';

const App = () => (
  <HashRouter>
    <Routes>
      <Route path="/">
        <Route index element={<Main />} />
        <Route path="*" element={PageNotFound()} />
      </Route>
    </Routes>
  </HashRouter>
);

export default App;
