/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { Wizard } from '../';
import { indexLifecycleManagement } from '../../../store/reducers';

jest.mock('../../../api', () => ({
  bootstrap: jest.fn()
}));
jest.mock('../../../store/actions', () => ({
  saveLifecycle: jest.fn(),
}));
jest.mock('../components/index_template', () => ({
  IndexTemplate: () => '',
}));
jest.mock('../components/policy_configuration', () => ({
  PolicyConfiguration: () => '',
}));
jest.mock('../components/review', () => ({
  Review: () => '',
}));

jest.mock('@elastic/eui', () => ({
  EuiPage: props => props.children || '',
  EuiPageBody: props => props.children || '',
  EuiPageContent: props => props.children || '',
  EuiTitle: props => props.children || '',
  EuiSpacer: props => props.children || '',
  EuiStepsHorizontal: props => props.children || '',
}));

const defaultStore = {
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};

describe('Wizard', () => {
  it('should render the first step', () => {
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
        <Wizard/>
      </Provider>
    );

    expect(component.find('EuiPageContent')).toMatchSnapshot();
  });

  it('should render the second step', () => {
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
        <Wizard/>
      </Provider>
    );

    component.find('Wizard').instance().setState({ selectedStep: 2 });
    component.update();

    expect(component.find('EuiPageContent')).toMatchSnapshot();
  });

  it('should render the third step', () => {
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
        <Wizard/>
      </Provider>
    );

    component.find('Wizard').instance().setState({ selectedStep: 3 });
    component.update();

    expect(component.find('EuiPageContent')).toMatchSnapshot();
  });

  it('should expose a addLifecycle method that saves the lifecycle and bootstraps the index/alias', async () => {
    const defaultState = indexLifecycleManagement({}, {});
    const store = {
      getState: () => ({
        ...defaultState,
        indexTemplate: {
          ...defaultState.indexTemplate,
          indexTemplates: [{}]
        },
        general: {
          ...defaultState.general,
          bootstrapEnabled: true,
          indexName: 'my_index',
          aliasName: 'my_alias',
        }
      }),
      ...defaultStore,
    };

    const actions = require('../../../store/actions');
    const api = require('../../../api');
    const component = mount(
      <Provider store={store}>
        <Wizard/>
      </Provider>
    );

    const lifecycle = { foo: 1 };
    await component.find('Wizard').instance().addLifecycle(lifecycle);
    expect(actions.saveLifecycle.mock.calls[0][0]).toEqual(lifecycle);
    expect(actions.saveLifecycle.mock.calls[0][1]).toEqual({
      indexTemplate: '',
      primaryShardCount: 1,
      replicaCount: 1,
      lifecycleName: '',
      nodeAttrs: ''
    });
    expect(api.bootstrap).toHaveBeenCalledWith('my_index', 'my_alias');
  });
});
