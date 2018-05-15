/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';
import { PolicyList } from './components/policy_list';
import { ManagePolicy } from './components/manage_policy';

export const PolicyManagement = ({ match }) => {
  return (
    <Fragment>
      <Route path={`${match.url}/edit_policy/:name`} render={() => (<ManagePolicy isEditMode/>)}/>
      <Route path={`${match.url}/new`} render={() => (<ManagePolicy isCreateMode/>)}/>
      <Route exact path={`${match.url}`} component={PolicyList}/>
    </Fragment>
  );
};
