/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */




import { connect } from 'react-redux';
import { PolicyList as PresentationComponent } from './policy_list';
import { getPolicies } from '../../../../store/selectors';
import { fetchPolicies } from '../../../../store/actions';

export const PolicyList = connect(
  state => ({
    policies: getPolicies(state),
  }),
  {
    fetchPolicies,
  }
)(PresentationComponent);
