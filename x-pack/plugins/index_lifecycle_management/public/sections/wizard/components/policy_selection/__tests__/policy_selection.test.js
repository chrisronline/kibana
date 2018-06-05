/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { PolicySelection } from '../';
import { indexLifecycleManagement } from '../../../../../store/reducers';

jest.mock('@elastic/eui', () => ({
  EuiFlexGroup: props => props.children || '',
  EuiFlexItem: props => props.children || '',
  EuiButton: props => props.children || '',
  EuiDescribedFormGroup: props => props.children || '',
  EuiFormRow: props => props.children || '',
  EuiSelect: props => props.children || '',
}));

jest.mock('../../../../../store/actions', () => ({
  fetchPolicies: jest.fn(),
  setSelectedPolicy: jest.fn(),
}));

const defaultState = indexLifecycleManagement({}, {});
const defaultStore = {
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};
const actions = require('../../../../../store/actions');

describe('PolicySelection', () => {
  it('should render properly', () => {
    const store = {
      getState: () => ({
        ...defaultState,
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}]
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <PolicySelection/>
      </Provider>
    );

    expect(component.find('PolicySelection')).toMatchSnapshot();
  });

  it('should call the selected policy prop when selecting a policy', () => {
    const policy = { name: 'foo' };
    const store = {
      getState: () => ({
        ...defaultState,
        policies: {
          ...defaultState.policies,
          policies: [
            policy
          ]
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <PolicySelection/>
      </Provider>
    );

    component.find('PolicySelection').find('EuiSelect').get(0).props.onChange({ target: { value: policy.name } });
    expect(actions.setSelectedPolicy).toBeCalledWith(policy);
  });

  it('should call the selected policy prop when creating a new policy', () => {
    const policy = { name: 'foo' };
    const store = {
      getState: () => ({
        ...defaultState,
        policies: {
          ...defaultState.policies,
          policies: [
            policy
          ]
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <PolicySelection/>
      </Provider>
    );

    component.find('PolicySelection').find('EuiButton').get(0).props.onClick();
    expect(actions.setSelectedPolicy).toBeCalledWith(undefined);
  });
});
