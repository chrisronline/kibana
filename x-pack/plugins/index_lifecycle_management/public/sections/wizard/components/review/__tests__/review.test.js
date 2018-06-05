/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { Review } from '../';
import { indexLifecycleManagement } from '../../../../../store/reducers';
import { STRUCTURE_POLICY_NAME } from '../../../../../store/constants';

jest.useFakeTimers();

jest.mock('@elastic/eui', () => ({
  EuiTitle: props => props.children || '',
  EuiCode: props => props.children || '',
  EuiCallOut: props => props.children || '',
  EuiSpacer: props => props.children || '',
  EuiHorizontalRule: props => props.children || '',
  EuiButton: props => props.children || '',
  EuiFlexItem: props => props.children || '',
  EuiText: props => props.children || '',
  EuiButtonEmpty: props => props.children || '',
  EuiFormRow: props => props.children || '',
  EuiSwitch: props => props.children || '',
  EuiFieldText: props => props.children || '',
  EuiLoadingSpinner: props => props.children || '',
  EuiFlexGroup: props => props.children || '',
}));

jest.mock('brace/theme/github', () => {});
jest.mock('brace/mode/json', () => {});
jest.mock('brace/snippets/json', () => {});
jest.mock('brace/ext/language_tools', () => {});

jest.mock('../diff_view', () => ({
  DiffView: () => ''
}));

jest.mock('../../../../../store/actions', () => ({
  setSelectedPolicyName: jest.fn(),
  setSaveAsNewPolicy: jest.fn(),
}));

jest.mock('../../../../../api', () => ({
  getAffectedIndices: () => ([
    'foobar*',
    'boofar*'
  ]),
}));

const defaultState = indexLifecycleManagement({}, {});
const defaultStore = {
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};
const actions = require('../../../../../store/actions');

describe('Review', () => {
  it('should render properly', async () => {
    const store = {
      getState: () => ({
        ...defaultState,
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}],
          fullSelectedIndexTemplate: {
            settings: {
              index: {
                number_of_shards: '' + defaultState.nodes.selectedPrimaryShardCount,
                number_of_replicas: '' + defaultState.nodes.selectedReplicaCount,
                lifecycle: {
                  name: defaultState.policies.selectedPolicy.name,
                },
                routing: {
                  allocation: {
                    include: {
                      sattr_name: defaultState.nodes.selectedNodeAttrs,
                    }
                  }
                }
              }
            }
          }
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <Review
          validate={() => {}}
          done={() => {}}
          errors={{
            [STRUCTURE_POLICY_NAME]: []
          }}
          back={() => {}}
        />
      </Provider>
    );

    jest.runAllTimers();
    // Ensure all promises resolve
    await new Promise(resolve => process.nextTick(resolve));
    // Ensure the state changes are reflected
    component.update();

    expect(component.find('Review')).toMatchSnapshot();
  });

  it('should a loading state for affected indices', () => {
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
        <Review
          validate={() => {}}
          done={() => {}}
          errors={{
            [STRUCTURE_POLICY_NAME]: []
          }}
          back={() => {}}
        />
      </Provider>
    );

    expect(component.find('EuiLoadingSpinner').length).toBe(1);
  });

  it('should show the aliases if bootstrap is enabled', () => {
    const store = {
      getState: () => ({
        ...defaultState,
        general: {
          ...defaultState.general,
          bootstrapEnabled: true,
          aliasName: 'my_alias'
        },
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}]
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <Review
          validate={() => {}}
          done={() => {}}
          errors={{
            [STRUCTURE_POLICY_NAME]: []
          }}
          back={() => {}}
        />
      </Provider>
    );

    expect(component.find('EuiCallOut').get(1)).toMatchSnapshot();
  });

  it('should show the diff if there are changes', () => {
    const store = {
      getState: () => ({
        ...defaultState,
        general: {
          ...defaultState.general,
          bootstrapEnabled: true,
          aliasName: 'my_alias'
        },
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}],
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <Review
          validate={() => {}}
          done={() => {}}
          errors={{
            [STRUCTURE_POLICY_NAME]: []
          }}
          back={() => {}}
        />
      </Provider>
    );

    expect(component.find('DiffView')).toMatchSnapshot();
  });

  it('should show a warning if editing an existing policy', () => {
    const store = {
      getState: () => ({
        ...defaultState,
        policies: {
          ...defaultState.policies,
          originalPolicyName: 'foo',
          selectedPolicy: {
            ...defaultState.policies.selectedPolicy,
            saveAsNew: false
          }
        },
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}],
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <Review
          validate={() => {}}
          done={() => {}}
          errors={{
            [STRUCTURE_POLICY_NAME]: []
          }}
          back={() => {}}
        />
      </Provider>
    );

    expect(component.find('EuiText')).toMatchSnapshot();
  });

  it('should finish the wizard when clicking the submit button', () => {
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

    const done = jest.fn();
    const component = mount(
      <Provider store={store}>
        <Review
          validate={() => {}}
          done={done}
          errors={{
            [STRUCTURE_POLICY_NAME]: []
          }}
          back={() => {}}
        />
      </Provider>
    );

    component.find('Review').find('EuiButton').get(0).props.onClick();
    expect(done).toHaveBeenCalled();
  });

  it('should show errors', () => {
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

    const done = jest.fn();
    const component = mount(
      <Provider store={store}>
        <Review
          validate={() => {}}
          done={done}
          errors={{
            [STRUCTURE_POLICY_NAME]: ['Error']
          }}
          back={() => {}}
        />
      </Provider>
    );

    expect(component.find('ErrableFormRow')).toMatchSnapshot();
  });

  describe('should validate fields when they change', () => {
    const store = {
      getState: () => ({
        ...defaultState,
        policies: {
          ...defaultState.policies,
          originalPolicyName: 'foo',
          selectedPolicy: {
            ...defaultState.policies.selectedPolicy,
            saveAsNew: true
          }
        },
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}]
        }
      }),
      ...defaultStore,
    };

    test('save as new policy', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <Review
            validate={validate}
            done={() => {}}
            errors={{
              [STRUCTURE_POLICY_NAME]: []
            }}
            back={() => {}}
          />
        </Provider>
      );

      await component.find('EuiSwitch').get(0).props.onChange({ target: { checked: true } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setSaveAsNewPolicy).toHaveBeenCalledWith(true);
    });

    test('policy name', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <Review
            validate={validate}
            done={() => {}}
            errors={{
              [STRUCTURE_POLICY_NAME]: []
            }}
            back={() => {}}
          />
        </Provider>
      );

      await component.find('EuiFieldText').get(0).props.onChange({ target: { value: 'lala' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setSelectedPolicyName).toHaveBeenCalledWith('lala');
    });
  });
});
