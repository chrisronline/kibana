/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { PolicyConfiguration } from '../';
import { indexLifecycleManagement } from '../../../../../store/reducers';
import { PHASE_HOT, PHASE_WARM, PHASE_COLD, PHASE_DELETE, PHASE_ROLLOVER_ALIAS } from '../../../../../store/constants';

jest.mock('@elastic/eui', () => ({
  EuiTitle: props => props.children || '',
  EuiText: props => props.children || '',
  EuiSpacer: props => props.children || '',
  EuiHorizontalRule: props => props.children || '',
  EuiButton: props => props.children || '',
  EuiButtonEmpty: props => props.children || '',
}));

jest.mock('../../../../../store/actions', () => ({
  setBootstrapEnabled: jest.fn(),
  setIndexName: jest.fn(),
  setAliasName: jest.fn(),
  setSelectedPolicyName: jest.fn(),
  setSaveAsNewPolicy: jest.fn(),
}));

jest.mock('../../policy_selection', () => ({
  PolicySelection: props => props.children || ''
}));
jest.mock('../../node_attrs_details', () => ({
  NodeAttrsDetails: props => props.children || ''
}));

jest.mock('../components/hot_phase', () => ({
  HotPhase: props => props.children || ''
}));
jest.mock('../components/warm_phase', () => ({
  WarmPhase: props => props.children || ''
}));
jest.mock('../components/cold_phase', () => ({
  ColdPhase: props => props.children || ''
}));
jest.mock('../components/delete_phase', () => ({
  DeletePhase: props => props.children || ''
}));

const defaultErrors = {
  [PHASE_HOT]: {},
  [PHASE_WARM]: {},
  [PHASE_COLD]: {},
  [PHASE_DELETE]: {},
};

const defaultStore = {
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};

describe('PolicyConfiguration', () => {
  it('should render just the policy selection if no policy is selected yet', () => {
    const defaultState = indexLifecycleManagement({}, {});
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
        <PolicyConfiguration
          validate={() => {}}
          errors={defaultErrors}
          done={() => {}}
          back={() => {}}
        />
      </Provider>
    );

    expect(component.find('PolicyConfiguration').children()).toMatchSnapshot();
  });

  it('should render the selected new policy', () => {
    const defaultState = indexLifecycleManagement({}, {});
    const store = {
      getState: () => ({
        ...defaultState,
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}]
        },
        policies: {
          ...defaultState.policies,
          selectedPolicySet: true,
          selectedPolicy: {
            saveAsNew: true,
            name: 'my_policy'
          }
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <PolicyConfiguration
          validate={() => {}}
          errors={defaultErrors}
          done={() => {}}
          back={() => {}}
        />
      </Provider>
    );

    expect(component.find('PolicyConfiguration')).toMatchSnapshot();
  });

  it('should return error state on validation', async () => {
    const defaultState = indexLifecycleManagement({}, {});
    const store = {
      getState: () => ({
        ...defaultState,
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}]
        },
        policies: {
          ...defaultState.policies,
          selectedPolicySet: true,
          selectedPolicy: {
            saveAsNew: true,
            name: 'my_policy'
          }
        }
      }),
      ...defaultStore,
    };
    const validate = jest.fn();
    const component = mount(
      <Provider store={store}>
        <PolicyConfiguration
          validate={validate}
          errors={{
            ...defaultErrors,
            [PHASE_HOT]: {
              [PHASE_ROLLOVER_ALIAS]: ['There is an error.'],
            }
          }}
          done={() => {}}
          back={() => {}}
        />
      </Provider>
    );

    const result = await component.find('PolicyConfiguration').instance().validate();
    expect(result).toBe(false);
    expect(validate).toHaveBeenCalled();
  });

  it('should submit if valid', async () => {
    const defaultState = indexLifecycleManagement({}, {});
    const store = {
      getState: () => ({
        ...defaultState,
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}]
        },
        policies: {
          ...defaultState.policies,
          selectedPolicySet: true,
          selectedPolicy: {
            saveAsNew: true,
            name: 'my_policy'
          }
        }
      }),
      ...defaultStore,
    };
    const done = jest.fn();
    const component = mount(
      <Provider store={store}>
        <PolicyConfiguration
          validate={() => {}}
          errors={{
            ...defaultErrors,
            [PHASE_WARM]: {
              [PHASE_ROLLOVER_ALIAS]: ['There is an error.'],
            }
          }}
          done={done}
          back={() => {}}
        />
      </Provider>
    );

    await component.find('PolicyConfiguration').instance().submit();
    expect(done).not.toHaveBeenCalled();

    const noErrorComponent = mount(
      <Provider store={store}>
        <PolicyConfiguration
          validate={() => {}}
          errors={{
            ...defaultErrors,
            [PHASE_WARM]: {
              [PHASE_ROLLOVER_ALIAS]: [],
            }
          }}
          done={done}
          back={() => {}}
        />
      </Provider>
    );

    await noErrorComponent.find('PolicyConfiguration').instance().submit();
    expect(done).toHaveBeenCalled();
  });

  it('should render the flyout', () => {
    const defaultState = indexLifecycleManagement({}, {});
    const store = {
      getState: () => ({
        ...defaultState,
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}]
        },
        policies: {
          ...defaultState.policies,
          selectedPolicySet: true,
          selectedPolicy: {
            saveAsNew: true,
            name: 'my_policy'
          }
        }
      }),
      ...defaultStore,
    };
    const component = mount(
      <Provider store={store}>
        <PolicyConfiguration
          validate={() => {}}
          errors={defaultErrors}
          done={() => {}}
          back={() => {}}
        />
      </Provider>
    );

    component.find('PolicyConfiguration').instance().showNodeDetailsFlyout('foo');
    component.update();

    expect(component.find('PolicyConfiguration').find('NodeAttrsDetails')).toMatchSnapshot();
  });
});
