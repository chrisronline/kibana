/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';
import { PolicyConfiguration as PresentationComponent } from './policy_configuration';
import {
  getSelectedPolicyName, getIsSelectedPolicySet,
} from '../../../../store/selectors';

export const PolicyConfiguration = connect(
  state => ({
    selectedPolicyName: getSelectedPolicyName(state),
    isSelectedPolicySet: getIsSelectedPolicySet(state)
  }),
)(PresentationComponent);
