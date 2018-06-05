/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { DeletePhase } from '../';
import { indexLifecycleManagement } from '../../../../../../../store/reducers';
import { PHASE_DELETE, PHASE_ENABLED, PHASE_ROLLOVER_AFTER, PHASE_ROLLOVER_AFTER_UNITS } from '../../../../../../../store/constants';

jest.mock('@elastic/eui', () => ({
  EuiFlexGroup: props => props.children || '',
  EuiFlexItem: props => props.children || '',
  EuiTitle: props => props.children || '',
  EuiSpacer: props => props.children || '',
  EuiText: props => props.children || '',
  EuiTextColor: props => props.children || '',
  EuiFormRow: props => props.children || '',
  EuiFieldNumber: props => props.children || '',
  EuiSelect: props => props.children || '',
  EuiDescribedFormGroup: props => props.children || '',
  EuiBetaBadge: props => props.children || '',
  EuiButton: props => props.children || '',
}));

jest.mock('../../../../../../../store/actions', () => ({
  setPhaseData: jest.fn(),
}));

const defaultStore = {
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};

const defaultState = indexLifecycleManagement({}, {});
const actions = require('../../../../../../../store/actions');

describe('DeletePhase', () => {
  it('should render just the activate button if not activated', () => {
    const store = {
      getState: () => ({
        ...defaultState,
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <DeletePhase
          validate={() => {}}
          errors={{}}
          showNodeDetailsFlyout={() => {}}
          isShowingErrors={false}
        />
      </Provider>
    );

    expect(component.find('DeletePhase')).toMatchSnapshot();
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
              [PHASE_DELETE]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_DELETE],
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
        <DeletePhase
          validate={() => {}}
          errors={{}}
          showNodeDetailsFlyout={() => {}}
          isShowingErrors={false}
        />
      </Provider>
    );

    expect(component.find('DeletePhase').find('EuiFlexGroup')).toMatchSnapshot();
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
              [PHASE_DELETE]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_DELETE],
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
          <DeletePhase
            validate={validate}
            errors={{}}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiButton').get(0).props.onClick();
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_DELETE, PHASE_ENABLED, true);
    });

    test('phase disablement', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <DeletePhase
            validate={validate}
            errors={{}}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiButton').get(0).props.onClick();
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_DELETE, PHASE_ENABLED, false);
    });

    test('rollover', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <DeletePhase
            validate={validate}
            errors={{}}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiFieldNumber').get(0).props.onChange({ target: { value: '1' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_DELETE, PHASE_ROLLOVER_AFTER, '1');
    });

    test('rollover after', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <DeletePhase
            validate={validate}
            errors={{}}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiSelect').get(0).props.onChange({ target: { value: 'd' } });
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_DELETE, PHASE_ROLLOVER_AFTER_UNITS, 'd');
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
              [PHASE_DELETE]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_DELETE],
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
        <DeletePhase
          validate={() => {}}
          errors={{
            [PHASE_ROLLOVER_AFTER]: ['Error'],
          }}
          isShowingErrors={true}
        />
      </Provider>
    );

    expect(component.find('DeletePhase').find('EuiFlexGroup')).toMatchSnapshot();
  });
});
