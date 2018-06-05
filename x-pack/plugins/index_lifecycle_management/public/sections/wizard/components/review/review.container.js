/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */




import { connect } from 'react-redux';
import { Review as PresentationComponent } from './review';
import {
  getSelectedIndexTemplateName,
  getAffectedIndexTemplates,
  getTemplateDiff,
  getLifecycle,
  getSelectedPolicyName,
  getSaveAsNewPolicy,
  getSelectedOriginalPolicyName,
  getAliasName,
  getBootstrapEnabled,
  getIndexName,
  getPolicies,
} from '../../../../store/selectors';
import {
  setSelectedPolicyName,
  setSaveAsNewPolicy,
} from '../../../../store/actions';

export const Review = connect(
  state => ({
    selectedIndexTemplateName: getSelectedIndexTemplateName(state),
    affectedIndexTemplates: getAffectedIndexTemplates(state),
    policies: getPolicies(state),
    templateDiff: getTemplateDiff(state),
    lifecycle: getLifecycle(state),
    bootstrapEnabled: getBootstrapEnabled(state),
    aliasName: getAliasName(state),
    selectedPolicyName: getSelectedPolicyName(state),
    saveAsNewPolicy: getSaveAsNewPolicy(state),
    originalPolicyName: getSelectedOriginalPolicyName(state),
    indexName: getIndexName(state),
  }),
  {
    setSelectedPolicyName,
    setSaveAsNewPolicy,
  }
)(PresentationComponent);
