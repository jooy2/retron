import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import PageNotFound from './PageNotFound';
import Main from './screens/Main';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/">
        <Route index element={<Main />} />
        <Route path="*" element={PageNotFound} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
