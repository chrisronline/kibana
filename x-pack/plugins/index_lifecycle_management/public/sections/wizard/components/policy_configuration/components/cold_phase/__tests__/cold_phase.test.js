/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { ColdPhase } from '../';
import { indexLifecycleManagement } from '../../../../../../../store/reducers';
import {
  PHASE_COLD,
  PHASE_ENABLED,
  PHASE_WARM,
  PHASE_ROLLOVER_AFTER,
  PHASE_ROLLOVER_AFTER_UNITS,
  PHASE_NODE_ATTRS,
  PHASE_REPLICA_COUNT
} from '../../../../../../../store/constants';

jest.mock('@elastic/eui', () => ({
  EuiFlexGroup: props => props.children || '',
  EuiFlexItem: props => props.children || '',
  EuiSpacer: props => props.children || '',
  EuiText: props => props.children || '',
  EuiTextColor: props => props.children || '',
  EuiFormRow: props => props.children || '',
  EuiFieldNumber: props => props.children || '',
  EuiSelect: props => props.children || '',
  EuiButtonEmpty: props => props.children || '',
  EuiDescribedFormGroup: props => props.children || '',
  EuiBetaBadge: props => props.children || '',
  EuiButton: props => props.children || '',
}));

jest.mock('../../../../../../../store/actions', () => ({
  fetchNodes: jest.fn(),
  setPhaseData: jest.fn(),
}));

const defaultStore = {
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};

const defaultState = indexLifecycleManagement({}, {});
const actions = require('../../../../../../../store/actions');

describe('ColdPhase', () => {
  it('should render just the activate button if not activated', () => {
    const store = {
      getState: () => ({
        ...defaultState,
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <ColdPhase
          validate={() => {}}
          errors={{}}
          showNodeDetailsFlyout={() => {}}
          isShowingErrors={false}
        />
      </Provider>
    );

    expect(component.find('ColdPhase')).toMatchSnapshot();
  });

  it('should show configuration options when activated', async () => {
    const store = {
      getState: () => ({
        ...defaultState,
        policies: {
          ...defaultState.policies,
          selectedPolicy: {
            ...defaultState.policies.selectedPolicy,
            phases: {
              ...defaultState.policies.selectedPolicy.phases,
              [PHASE_COLD]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_COLD],
                [PHASE_ENABLED]: true
              }
            }
          }
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <ColdPhase
          validate={() => {}}
          errors={{}}
          showNodeDetailsFlyout={() => {}}
          isShowingErrors={false}
        />
      </Provider>
    );

    expect(component.find('ColdPhase').find('EuiFlexGroup')).toMatchSnapshot();
  });

  describe('should change fields through actions and validate if necessary', () => {
    const store = {
      getState: () => ({
        ...defaultState,
        policies: {
          ...defaultState.policies,
          selectedPolicy: {
            ...defaultState.policies.selectedPolicy,
            phases: {
              ...defaultState.policies.selectedPolicy.phases,
              [PHASE_COLD]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_COLD],
                [PHASE_ENABLED]: true
              }
            }
          }
        }
      }),
      ...defaultStore,
    };

    test('phase enablement', async () => {
      const store = {
        getState: () => ({
          ...defaultState,
        }),
        ...defaultStore,
      };

      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <ColdPhase
            validate={validate}
            errors={{}}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiButton').get(0).props.onClick();
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_COLD, PHASE_ENABLED, true);
    });

    test('phase disablement', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <ColdPhase
            validate={validate}
            errors={{}}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiButton').get(0).props.onClick();
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_COLD, PHASE_ENABLED, false);
    });

    test('rollover', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <ColdPhase
            validate={validate}
            errors={{}}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiFieldNumber').get(0).props.onChange({ target: { value: '1' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_COLD, PHASE_ROLLOVER_AFTER, '1');
    });

    test('rollover after', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <ColdPhase
            validate={validate}
            errors={{}}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiSelect').get(0).props.onChange({ target: { value: 'd' } });
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_COLD, PHASE_ROLLOVER_AFTER_UNITS, 'd');
    });

    test('node allocation', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <ColdPhase
            validate={validate}
            errors={{}}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiSelect').get(1).props.onChange({ target: { value: '1' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_COLD, PHASE_NODE_ATTRS, '1');
    });

    test('replicas', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <ColdPhase
            validate={validate}
            errors={{}}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiFieldNumber').get(1).props.onChange({ target: { value: '1' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_COLD, PHASE_REPLICA_COUNT, '1');
    });
  });

  it('should show errors', () => {
    const store = {
      getState: () => ({
        ...defaultState,
        policies: {
          ...defaultState.policies,
          selectedPolicy: {
            ...defaultState.policies.selectedPolicy,
            phases: {
              ...defaultState.policies.selectedPolicy.phases,
              [PHASE_COLD]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_COLD],
                [PHASE_ENABLED]: true
              }
            }
          }
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <ColdPhase
          validate={() => {}}
          errors={{
            [PHASE_ROLLOVER_AFTER]: ['Error'],
            [PHASE_NODE_ATTRS]: ['Error'],
            [PHASE_REPLICA_COUNT]: ['Error'],
          }}
          showNodeDetailsFlyout={() => {}}
          isShowingErrors={true}
        />
      </Provider>
    );

    expect(component.find('ColdPhase').find('EuiFlexGroup')).toMatchSnapshot();
  });

  it('should call the prop to show the node details flyout', () => {
    const store = {
      getState: () => ({
        ...defaultState,
        policies: {
          ...defaultState.policies,
          selectedPolicy: {
            ...defaultState.policies.selectedPolicy,
            phases: {
              ...defaultState.policies.selectedPolicy.phases,
              [PHASE_COLD]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_COLD],
                [PHASE_ENABLED]: true,
                [PHASE_NODE_ATTRS]: 'foo'
              }
            }
          }
        }
      }),
      ...defaultStore,
    };

    const showNodeDetailsFlyout = jest.fn();
    const component = mount(
      <Provider store={store}>
        <ColdPhase
          validate={() => {}}
          errors={{
            [PHASE_ROLLOVER_AFTER]: [],
            [PHASE_NODE_ATTRS]: [],
            [PHASE_REPLICA_COUNT]: [],
          }}
          showNodeDetailsFlyout={showNodeDetailsFlyout}
          isShowingErrors={true}
        />
      </Provider>
    );

    component.find('ColdPhase').find('ErrableFormRow').get(1).props.helpText.props.onClick();
    expect(showNodeDetailsFlyout).toHaveBeenCalledWith('foo');
  });

  it('should set the replicas to the same as the warm phase', () => {
    const store = {
      getState: () => ({
        ...defaultState,
        policies: {
          ...defaultState.policies,
          selectedPolicy: {
            ...defaultState.policies.selectedPolicy,
            phases: {
              ...defaultState.policies.selectedPolicy.phases,
              [PHASE_WARM]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_WARM],
                [PHASE_REPLICA_COUNT]: 4,
              },
              [PHASE_COLD]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_COLD],
                [PHASE_ENABLED]: true,
              }
            }
          }
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <ColdPhase
          validate={() => {}}
          errors={{
            [PHASE_ROLLOVER_AFTER]: [],
            [PHASE_NODE_ATTRS]: [],
            [PHASE_REPLICA_COUNT]: [],
          }}
          showNodeDetailsFlyout={() => {}}
          isShowingErrors={true}
        />
      </Provider>
    );

    component.find('ColdPhase').find('EuiButtonEmpty').get(0).props.onClick();
    expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_COLD, PHASE_REPLICA_COUNT, 4);
  });
});
