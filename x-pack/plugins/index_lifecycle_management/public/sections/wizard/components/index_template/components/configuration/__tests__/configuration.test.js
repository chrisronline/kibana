/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { Configuration } from '../';
import { indexLifecycleManagement } from '../../../../../../../store/reducers';

jest.mock('@elastic/eui', () => ({
  EuiDescribedFormGroup: props => props.children || '',
  EuiFlexGroup: props => props.children || '',
  EuiFlexItem: props => props.children || '',
  EuiSpacer: props => props.children || '',
  EuiSelect: props => props.children || '',
  EuiFieldNumber: props => props.children || '',
  EuiCallOut: props => props.children || '',
  EuiButtonEmpty: props => props.children || '',
  EuiLink: props => props.children || '',
  EuiDescribedFormGroup: props => props.children || '',
}));

jest.mock('../../../../../../../store/actions', () => ({
  setSelectedNodeAttrs: jest.fn(),
  fetchNodes: jest.fn(),
  setSelectedPrimaryShardCount: jest.fn(),
  setSelectedReplicaCount: jest.fn()
}));
jest.mock('../../../../../form_errors', () => ({
  ErrableFormRow: props => props.children || '',
}));
jest.mock('../../../../node_attrs_details', () => ({
  NodeAttrsDetails: props => props.children || '',
}));

const defaultStore = {
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};

describe('Configuration', () => {
  it('should render properly', () => {
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
        <Configuration
          validate={() => {}}
          isShowingErrors={false}
          errors={{}}
        />
      </Provider>
    );

    expect(component.find('Configuration')).toMatchSnapshot();
  });

  it('should show a warning about shard counts if they are higher than node attrs count', () => {
    const defaultState = indexLifecycleManagement({}, {});
    const store = {
      getState: () => ({
        ...defaultState,
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}]
        },
        nodes: {
          ...defaultState.nodes,
          selectedPrimaryShardCount: 2,
          selectedNodeAttrs: 'foo',
          nodes: {
            foo: [1]
          }
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <Configuration
          validate={() => {}}
          isShowingErrors={false}
          errors={{}}
        />
      </Provider>
    );

    expect(component.find('EuiCallOut').get(1)).toMatchSnapshot();
  });

  describe('should validate fields when they change', () => {
    const defaultState = indexLifecycleManagement({}, {});
    const actions = require('../../../../../../../store/actions');
    const store = {
      getState: () => ({
        ...defaultState,
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}]
        },
      }),
      ...defaultStore,
    };

    test('for node attrs', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <Configuration
            validate={validate}
            isShowingErrors={false}
            errors={{}}
          />
        </Provider>
      );

      await component.find('EuiSelect').prop('onChange')({ target: { value: '1' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setSelectedNodeAttrs).toHaveBeenCalledWith('1');
    });

    test('for primary shards', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <Configuration
            validate={validate}
            isShowingErrors={false}
            errors={{}}
          />
        </Provider>
      );

      await component.find('EuiFieldNumber').get(0).props.onChange({ target: { value: '1' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setSelectedPrimaryShardCount).toHaveBeenCalledWith('1');
    });

    test('for replicas', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <Configuration
            validate={validate}
            isShowingErrors={false}
            errors={{}}
          />
        </Provider>
      );

      await component.find('EuiFieldNumber').get(1).props.onChange({ target: { value: '1' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setSelectedReplicaCount).toHaveBeenCalledWith('1');
    });
  });

  it('should show the flyout', () => {
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
        <Configuration
          validate={() => {}}
          isShowingErrors={false}
          errors={{}}
        />
      </Provider>
    );

    component.find('Configuration').instance().setState({ isShowingNodeDetailsFlyout: true });
    component.update();

    expect(component.find('NodeAttrsDetails')).toMatchSnapshot();
  });
});
