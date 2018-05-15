/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */




import { createAction } from 'redux-actions';
import { toastNotifications } from 'ui/notify';
import { loadPolicies, loadPolicy, savePolicy as savePolicyApi } from '../../api';
import { getLifecycle } from '../selectors';

export const fetchedPolicies = createAction('FETCHED_POLICIES');
export const fetchPolicies = () => async dispatch => {
  let policies;
  try {
    policies = await loadPolicies();
  }
  catch (err) {
    return toastNotifications.addDanger(err.data.message);
  }

  dispatch(fetchedPolicies(policies));
};

export const fetchedPolicy = createAction('FETCHED_POLICY');
export const fetchPolicy = name => async dispatch => {
  let policy;
  try {
    policy = await loadPolicy(name);
  }
  catch (err) {
    return toastNotifications.addDanger(err.data.message);
  }

  dispatch(fetchedPolicy(policy));
};

export const setSelectedPolicy = createAction('SET_SELECTED_POLICY');
export const setSelectedPolicyName = createAction('SET_SELECTED_POLICY_NAME');
export const setSaveAsNewPolicy = createAction('SET_SAVE_AS_NEW_POLICY');

export const setPhaseData = createAction('SET_PHASE_DATA', (phase, key, value) => ({ phase, key, value }));

export const savedPolicy = createAction('SAVED_POLICY');
export const savePolicy = () => async (dispatch, getState) => {
  const state = getState();
  const policy = getLifecycle(state);

  let saved;
  try {
    saved = await savePolicyApi(policy);
  }
  catch (err) {
    return toastNotifications.addDanger(err.data.message);
  }

  toastNotifications.addSuccess(`Successfully saved policy '${policy.name}'`);

  dispatch(savedPolicy(saved));
};
