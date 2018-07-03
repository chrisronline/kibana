/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */




import { connect } from 'react-redux';
import { IndexTemplateList as PresentationComponent } from './index_template_list';
import { getIndexTemplates } from '../../../../store/selectors';
import { fetchIndexTemplates, deleteIndexTemplate } from '../../../../store/actions';

export const IndexTemplateList = connect(
  state => ({
    indexTemplates: getIndexTemplates(state),
  }),
  {
    fetchIndexTemplates,
    deleteIndexTemplate,
  }
)(PresentationComponent);
