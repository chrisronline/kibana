/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */




import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ManageIndexTemplate as PresentationComponent } from './manage_index_template';
import { getFullSelectedIndexTemplate } from '../../../../store/selectors';
import { fetchIndexTemplate, resetSelectedIndexTemplate } from '../../../../store/actions';

export const ManageIndexTemplate = connect(
  (state) => ({
    indexTemplate: getFullSelectedIndexTemplate(state),
  }),
  {
    fetchIndexTemplate,
    resetSelectedIndexTemplate,
  }
)(withRouter(PresentationComponent));
