/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */




import { connect } from 'react-redux';
import { EditPolicy as PresentationComponent } from './edit_policy';
import { validateLifecycle, getSelectedPolicy } from '../../../../store/selectors';
import { fetchPolicy, savePolicy } from '../../../../store/actions';

export const EditPolicy = connect(
  (state) => ({
    policy: getSelectedPolicy(state),
    validateLifecycle: () => validateLifecycle(state),
  }),
  {
    fetchPolicy,
    savePolicy,
  }
)(PresentationComponent);
