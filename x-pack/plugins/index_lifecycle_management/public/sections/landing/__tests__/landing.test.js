/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { Landing } from '../';

jest.mock('../../wizard', () => ({
  Wizard: () => '',
}));

const defaultStore = {
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};

describe('Landing', () => {
  it('should render null if loading', () => {
    const store = {
      getState: () => ({
        indexTemplate: {
          indexTemplates: null
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <Landing/>
      </Provider>
    );

    expect(component.find('Landing').children().length).toBe(0);
  });

  it('should render a message if there are no templates', () => {
    const store = {
      getState: () => ({
        indexTemplate: {
          indexTemplates: []
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <Landing/>
      </Provider>
    );

    expect(component.find('h1')).toMatchSnapshot();
  });

  it('should render the wizard if there are templates', () => {
    const store = {
      getState: () => ({
        indexTemplate: {
          indexTemplates: [{ }]
        }
      }),
      ...defaultStore,
    };

    const component = mount(
      <Provider store={store}>
        <Landing/>
      </Provider>
    );

    expect(component.find('Wizard').length).toBe(1);
  });
});
