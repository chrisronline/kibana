/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */




import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import { Landing } from './sections/landing';
import { PolicyManagement } from './sections/policy_management';

export const App = ({ baseName }) => {
  const basename = baseName.endsWith('/') ? baseName.slice(0, -1) : baseName;
  return (
    <HashRouter basename={basename}>
      <Switch>
        <Route path="/policies" component={PolicyManagement}/>
        <Route component={Landing}/>
      </Switch>
    </HashRouter>
  );
};
