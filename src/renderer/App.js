import React from 'react';
import { Route, HashRouter, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';

import PageNotFound from './PageNotFound';
import Main from './screens/Main';

const App = () => (
  <HashRouter>
    <Switch>
      <Route exact path="/" component={Main} />
      <Route component={PageNotFound} />
    </Switch>
  </HashRouter>
);

export default withRouter(App);
