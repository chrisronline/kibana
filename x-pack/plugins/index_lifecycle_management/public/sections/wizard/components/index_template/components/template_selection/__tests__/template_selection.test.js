/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { TemplateSelection } from '../';
import { indexLifecycleManagement } from '../../../../../../../store/reducers';

jest.mock('@elastic/eui', () => ({
  EuiSelect: props => props.children || '',
  EuiFormRow: props => props.children || '',
  EuiSwitch: props => props.children || '',
  EuiFieldText: props => props.children || '',
  EuiDescribedFormGroup: props => props.children || '',
  EuiLink: props => props.children || '',
}));

jest.mock('../../../../../../../store/actions', () => ({
  fetchIndexTemplates: jest.fn(),
  setSelectedIndexTemplate: jest.fn(),
  setBootstrapEnabled: jest.fn(),
  setIndexName: jest.fn(),
  setAliasName: jest.fn()
}));
jest.mock('../../../../../form_errors', () => ({
  ErrableFormRow: props => props.children || '',
}));

const defaultState = indexLifecycleManagement({}, {});
const defaultStore = {
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};
const actions = require('../../../../../../../store/actions');

describe('TemplateSelection', () => {
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
        <TemplateSelection
          validate={() => {}}
          isShowingErrors={false}
          errors={{}}
        />
      </Provider>
    );

    expect(component.find('TemplateSelection')).toMatchSnapshot();
  });

  describe('should validate fields when they change', () => {
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

    test('for template selection', async () => {
      const validate = jest.fn();
      const component = mount(
        <Provider store={store}>
          <TemplateSelection
            validate={validate}
            isShowingErrors={false}
            errors={{}}
          />
        </Provider>
      );

      await component.find('EuiSelect').prop('onChange')({ target: { value: '1' } });
      expect(validate).toHaveBeenCalled();
      expect(actions.setSelectedIndexTemplate).toHaveBeenCalledWith('1');
    });
  });

  describe('bootstrap options', () => {
    const defaultState = indexLifecycleManagement({}, {});
    const updatedState = {
      ...defaultState,
      indexTemplate: {
        ...defaultState.indexTemplate,
        indexTemplates: [{
          name: 'foobar',
          indices: []
        }],
        selectedIndexTemplateName: 'foobar',
      },
      nodes: {
        ...defaultState.nodes,
        selectedPrimaryShardCount: 2,
        selectedNodeAttrs: 'foo',
        nodes: {
          foo: [1]
        }
      }
    };

    const store = {
      getState: () => (updatedState),
      ...defaultStore,
    };

    it('should show bootstrap options', () => {
      const component = mount(
        <Provider store={store}>
          <TemplateSelection
            validate={() => {}}
            isShowingErrors={false}
            errors={{}}
          />
        </Provider>
      );

      expect(component.find('EuiFormRow').get(0)).toMatchSnapshot();
    });

    it('should show index and alias name', () => {
      const store = {
        getState: () => ({
          ...updatedState,
          general: {
            ...updatedState.general,
            bootstrapEnabled: true
          }
        }),
        ...defaultStore,
      };

      const component = mount(
        <Provider store={store}>
          <TemplateSelection
            validate={() => {}}
            isShowingErrors={false}
            errors={{}}
          />
        </Provider>
      );

      const uiParts = (
        <React.Fragment>
          {component.find('ErrableFormRow').get(1)}
          {component.find('ErrableFormRow').get(2)}
        </React.Fragment>
      );

      expect(uiParts).toMatchSnapshot();
    });

    describe('should validate fields when they change', () => {
      const store = {
        getState: () => ({
          ...updatedState,
          general: {
            ...updatedState.general,
            bootstrapEnabled: true
          }
        }),
        ...defaultStore,
      };

      test('for index name', async () => {
        const validate = jest.fn();
        const component = mount(
          <Provider store={store}>
            <TemplateSelection
              validate={validate}
              isShowingErrors={false}
              errors={{}}
            />
          </Provider>
        );

        await component.find('EuiFieldText').get(0).props.onChange({ target: { value: '1' } });
        expect(validate).toHaveBeenCalled();
        expect(actions.setIndexName).toHaveBeenCalledWith('1');
      });

      test('for alias name', async () => {
        const validate = jest.fn();
        const component = mount(
          <Provider store={store}>
            <TemplateSelection
              validate={validate}
              isShowingErrors={false}
              errors={{}}
            />
          </Provider>
        );

        await component.find('EuiFieldText').get(1).props.onChange({ target: { value: '1' } });
        expect(validate).toHaveBeenCalled();
        expect(actions.setAliasName).toHaveBeenCalledWith('1');
      });
    });
  });
});
