/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';
import { IndexTemplateList } from './components/index_template_list';
import { ManageIndexTemplate } from './components/manage_index_template';

export const IndexTemplateManagement = ({ match }) => {
  return (
    <Fragment>
      <Route path={`${match.url}/edit_template/:name`} render={() => (<ManageIndexTemplate isEditMode/>)}/>
      <Route path={`${match.url}/new`} render={() => (<ManageIndexTemplate isCreateMode/>)}/>
      <Route exact path={`${match.url}`} component={IndexTemplateList}/>
    </Fragment>
  );
};
