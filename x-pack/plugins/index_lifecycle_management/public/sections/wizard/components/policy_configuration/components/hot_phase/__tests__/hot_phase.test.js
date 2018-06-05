/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { HotPhase } from '../';
import { indexLifecycleManagement } from '../../../../../../../store/reducers';
import {
  PHASE_HOT,
  PHASE_ENABLED,
  PHASE_ROLLOVER_ENABLED,
  PHASE_ROLLOVER_MAX_SIZE_STORED,
  PHASE_ROLLOVER_MAX_SIZE_STORED_UNITS,
  PHASE_ROLLOVER_MAX_AGE,
  PHASE_ROLLOVER_MAX_AGE_UNITS
} from '../../../../../../../store/constants';

jest.mock('@elastic/eui', () => ({
  EuiFlexGroup: props => props.children || '',
  EuiFlexItem: props => props.children || '',
  EuiSpacer: props => props.children || '',
  EuiText: props => props.children || '',
  EuiTextColor: props => props.children || '',
  EuiFieldNumber: props => props.children || '',
  EuiSelect: props => props.children || '',
  EuiSwitch: props => props.children || '',
  EuiLink: props => props.children || '',
  EuiFormRow: props => props.children || '',
  EuiDescribedFormGroup: props => props.children || '',
  EuiBetaBadge: props => props.children || '',
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

describe('HotPhase', () => {
  it('should render just the activate button if not activated', () => {
    const store = {
      getState: () => ({
        ...defaultState,
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <HotPhase
          validate={() => {}}
          errors={{}}
          isShowingErrors={false}
        />
      </Provider>
    );

    expect(component.find('HotPhase')).toMatchSnapshot();
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
              [PHASE_HOT]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_HOT],
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
        <HotPhase
          validate={() => {}}
          errors={{}}
          isShowingErrors={false}
        />
      </Provider>
    );

    expect(component.find('HotPhase')).toMatchSnapshot();
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
              [PHASE_HOT]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_HOT],
                [PHASE_ENABLED]: true
              }
            }
          }
        }
      }),
      ...defaultStore,
    };

    const storeWithRolloverEnabled = {
      getState: () => ({
        ...defaultState,
        policies: {
          ...defaultState.policies,
          selectedPolicy: {
            ...defaultState.policies.selectedPolicy,
            phases: {
              ...defaultState.policies.selectedPolicy.phases,
              [PHASE_HOT]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_HOT],
                [PHASE_ENABLED]: true,
                [PHASE_ROLLOVER_ENABLED]: true
              }
            }
          }
        }
      }),
      ...defaultStore,
    };

    test('rollover', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <HotPhase
            validate={validate}
            errors={{}}

            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiSwitch').get(0).props.onChange({ target: { checked: true } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_HOT, PHASE_ROLLOVER_ENABLED, true);
    });

    test('rollover disabled', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={storeWithRolloverEnabled}>
          <HotPhase
            validate={validate}
            errors={{}}

            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiSwitch').get(0).props.onChange({ target: { checked: false } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_HOT, PHASE_ROLLOVER_ENABLED, false);
    });

    test('max index size', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={storeWithRolloverEnabled}>
          <HotPhase
            validate={validate}
            errors={{}}

            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiFieldNumber').get(0).props.onChange({ target: { value: '2' } });
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_HOT, PHASE_ROLLOVER_MAX_SIZE_STORED, '2');
    });

    test('max index size units', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={storeWithRolloverEnabled}>
          <HotPhase
            validate={validate}
            errors={{}}

            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiSelect').get(0).props.onChange({ target: { value: 'gb' } });
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_HOT, PHASE_ROLLOVER_MAX_SIZE_STORED_UNITS, 'gb');
    });

    test('max age', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={storeWithRolloverEnabled}>
          <HotPhase
            validate={validate}
            errors={{}}

            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiFieldNumber').get(1).props.onChange({ target: { value: '2' } });
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_HOT, PHASE_ROLLOVER_MAX_AGE, '2');
    });

    test('max age units', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={storeWithRolloverEnabled}>
          <HotPhase
            validate={validate}
            errors={{}}

            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiSelect').get(1).props.onChange({ target: { value: 'h' } });
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_HOT, PHASE_ROLLOVER_MAX_AGE_UNITS, 'h');
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
              [PHASE_HOT]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_HOT],
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
        <HotPhase
          validate={() => {}}
          errors={{
            [PHASE_ROLLOVER_MAX_SIZE_STORED]: ['Error'],
            [PHASE_ROLLOVER_MAX_SIZE_STORED_UNITS]: ['Error'],
            [PHASE_ROLLOVER_MAX_AGE]: ['Error'],
            [PHASE_ROLLOVER_MAX_AGE_UNITS]: ['Error'],
          }}
          isShowingErrors={true}
        />
      </Provider>
    );

    expect(component.find('HotPhase')).toMatchSnapshot();
  });
});
