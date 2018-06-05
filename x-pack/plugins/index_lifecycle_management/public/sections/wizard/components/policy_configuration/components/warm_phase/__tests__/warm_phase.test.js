/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { WarmPhase } from '../';
import { indexLifecycleManagement } from '../../../../../../../store/reducers';
import {
  PHASE_WARM,
  PHASE_ENABLED,
  PHASE_ROLLOVER_AFTER,
  PHASE_ROLLOVER_AFTER_UNITS,
  PHASE_NODE_ATTRS,
  PHASE_REPLICA_COUNT,
  PHASE_SHRINK_ENABLED,
  PHASE_PRIMARY_SHARD_COUNT,
  PHASE_FORCE_MERGE_ENABLED,
  PHASE_FORCE_MERGE_SEGMENTS
} from '../../../../../../../store/constants';

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
  EuiSwitch: props => props.children || '',
  EuiButtonEmpty: props => props.children || '',
  EuiLink: props => props.children || '',
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

describe('WarmPhase', () => {
  it('should render just the activate button if not activated', () => {
    const store = {
      getState: () => ({
        ...defaultState,
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <WarmPhase
          validate={() => {}}
          errors={{
            [PHASE_ROLLOVER_AFTER]: [],
            [PHASE_NODE_ATTRS]: [],

          }}
          showNodeDetailsFlyout={() => {}}
          isShowingErrors={false}
        />
      </Provider>
    );

    expect(component.find('WarmPhase')).toMatchSnapshot();
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
              [PHASE_WARM]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_WARM],
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
        <WarmPhase
          validate={() => {}}
          errors={{
            [PHASE_ROLLOVER_AFTER]: [],
            [PHASE_NODE_ATTRS]: [],

          }}
          showNodeDetailsFlyout={() => {}}
          isShowingErrors={false}
        />
      </Provider>
    );

    expect(component.find('WarmPhase')).toMatchSnapshot();
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
              [PHASE_WARM]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_WARM],
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
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiButton').get(0).props.onClick();
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_WARM, PHASE_ENABLED, true);
    });

    test('phase disablement', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiButton').get(0).props.onClick();
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_WARM, PHASE_ENABLED, false);
    });

    test('apply on rollover', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiSwitch').get(0).props.onChange({ target: { checked: true } });
      expect(validate).toHaveBeenCalled();
      expect(component.find('WarmPhase').instance().state.applyOnRollover).toBe(true);
    });

    test('rollover', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiFieldNumber').get(0).props.onChange({ target: { value: '1' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_WARM, PHASE_ROLLOVER_AFTER, '1');
    });

    test('rollover after', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiSelect').get(0).props.onChange({ target: { value: 'd' } });
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_WARM, PHASE_ROLLOVER_AFTER_UNITS, 'd');
    });

    test('node allocation', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiSelect').get(1).props.onChange({ target: { value: '1' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_WARM, PHASE_NODE_ATTRS, '1');
    });

    test('replicas', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiFieldNumber').get(1).props.onChange({ target: { value: '1' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_WARM, PHASE_REPLICA_COUNT, '1');
    });

    test('replicas from hot phase', async () => {
      const store = {
        getState: () => ({
          ...defaultState,
          nodes: {
            ...defaultState.nodes,
            selectedReplicaCount: 5,
          },
          policies: {
            ...defaultState.policies,
            selectedPolicy: {
              ...defaultState.policies.selectedPolicy,
              phases: {
                ...defaultState.policies.selectedPolicy.phases,
                [PHASE_WARM]: {
                  ...defaultState.policies.selectedPolicy.phases[PHASE_WARM],
                  [PHASE_ENABLED]: true
                },
              }
            }
          }
        }),
        ...defaultStore,
      };
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiButtonEmpty').get(0).props.onClick();
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_WARM, PHASE_REPLICA_COUNT, 5);
    });

    test('shrink enablement', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiSwitch').get(1).props.onChange({ target: { checked: true } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_WARM, PHASE_SHRINK_ENABLED, true);
    });

    test('shrink shards', async () => {
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
                  [PHASE_ENABLED]: true,
                  [PHASE_SHRINK_ENABLED]: true
                }
              }
            }
          }
        }),
        ...defaultStore,
      };
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiFieldNumber').get(2).props.onChange({ target: { value: '2' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_WARM, PHASE_PRIMARY_SHARD_COUNT, '2');
    });

    test('shrink shards with same value from hot phase', async () => {
      const store = {
        getState: () => ({
          ...defaultState,
          nodes: {
            ...defaultState.nodes,
            [PHASE_PRIMARY_SHARD_COUNT]: 4,
          },
          policies: {
            ...defaultState.policies,
            selectedPolicy: {
              ...defaultState.policies.selectedPolicy,
              phases: {
                ...defaultState.policies.selectedPolicy.phases,
                [PHASE_WARM]: {
                  ...defaultState.policies.selectedPolicy.phases[PHASE_WARM],
                  [PHASE_ENABLED]: true,
                  [PHASE_SHRINK_ENABLED]: true
                },
              }
            }
          }
        }),
        ...defaultStore,
      };
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiButtonEmpty').get(1).props.onClick();
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_WARM, PHASE_PRIMARY_SHARD_COUNT, 4);
    });

    test('force merge enablement', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiSwitch').get(2).props.onChange({ target: { checked: true } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_WARM, PHASE_FORCE_MERGE_ENABLED, true);
    });

    test('force merge segments', async () => {
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
                  [PHASE_ENABLED]: true,
                  [PHASE_FORCE_MERGE_ENABLED]: true
                }
              }
            }
          }
        }),
        ...defaultStore,
      };
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <WarmPhase
            validate={validate}
            errors={{
              [PHASE_ROLLOVER_AFTER]: [],
              [PHASE_NODE_ATTRS]: [],
              [PHASE_REPLICA_COUNT]: [],
              [PHASE_PRIMARY_SHARD_COUNT]: [],
              [PHASE_FORCE_MERGE_SEGMENTS]: []
            }}
            showNodeDetailsFlyout={() => {}}
            isShowingErrors={false}
          />
        </Provider>
      );

      await component.find('EuiFieldNumber').get(3).props.onChange({ target: { value: '2' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setPhaseData).toHaveBeenCalledWith(PHASE_WARM, PHASE_FORCE_MERGE_SEGMENTS, '2');
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
              [PHASE_WARM]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_WARM],
                [PHASE_ENABLED]: true,
                [PHASE_SHRINK_ENABLED]: true,
                [PHASE_FORCE_MERGE_ENABLED]: true
              }
            }
          }
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <WarmPhase
          validate={() => {}}
          errors={{
            [PHASE_ROLLOVER_AFTER]: ['Error'],
            [PHASE_NODE_ATTRS]: ['Error'],
            [PHASE_REPLICA_COUNT]: ['Error'],
            [PHASE_PRIMARY_SHARD_COUNT]: ['Error'],
            [PHASE_FORCE_MERGE_SEGMENTS]: ['Error']
          }}
          showNodeDetailsFlyout={() => {}}
          isShowingErrors={true}
        />
      </Provider>
    );

    expect(component.find('WarmPhase')).toMatchSnapshot();
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
              [PHASE_WARM]: {
                ...defaultState.policies.selectedPolicy.phases[PHASE_WARM],
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
        <WarmPhase
          validate={() => {}}
          errors={{
            [PHASE_ROLLOVER_AFTER]: [],
            [PHASE_NODE_ATTRS]: [],
            [PHASE_REPLICA_COUNT]: [],
            [PHASE_PRIMARY_SHARD_COUNT]: [],
            [PHASE_FORCE_MERGE_SEGMENTS]: []
          }}
          showNodeDetailsFlyout={showNodeDetailsFlyout}
          isShowingErrors={true}
        />
      </Provider>
    );

    component.find('WarmPhase').find('ErrableFormRow').get(1).props.helpText.props.onClick();
    expect(showNodeDetailsFlyout).toHaveBeenCalledWith('foo');
  });
});
