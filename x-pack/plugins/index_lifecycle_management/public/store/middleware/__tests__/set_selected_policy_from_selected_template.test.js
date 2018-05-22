/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { setSelectedPolicyFromSelectedTemplate } from '../set_selected_policy_from_selected_template';

jest.mock('../../selectors', () => {
  return {
    getPhaseData: () => {},
    getSelectedNodeAttrs: () => {
      return 'hot_node:true';
    },
  };
});

jest.mock('../../actions', () => {
  return {
    fetchPolicies: () => () => ([
      {
        name: 'my_policy'
      }
    ]),
    fetchedIndexTemplate: () => ({
      type: 'FETCHED_INDEX_TEMPLATE'
    }),
    setSelectedPolicy: jest.fn(),
    setPhaseData: jest.fn(),
  };
});

describe('setSelectedPolicyFromSelectedTemplate', () => {
  it('should set the selected policy off the template', async () => {
    const state = {};
    const store = {
      getState: () => state,
      dispatch: jest.fn(),
    };
    const next = jest.fn();
    const action = {
      type: 'FETCHED_INDEX_TEMPLATE',
      payload: {
        settings: {
          index: {
            lifecycle: {
              name: 'my_policy'
            }
          }
        }
      }
    };

    const executor = setSelectedPolicyFromSelectedTemplate(store)(next);
    await executor(action);

    const setSelectedPolicy = require('../../actions').setSelectedPolicy;
    const setPhaseData = require('../../actions').setPhaseData;

    expect(setSelectedPolicy.mock.calls.length).toBe(1);
    expect(setSelectedPolicy.mock.calls[0]).toEqual([
      { name: 'my_policy' }
    ]);

    expect(setPhaseData.mock.calls.length).toBe(2);
    expect(setPhaseData.mock.calls[0]).toEqual([
      'warm', 'selectedNodeAttrs', 'hot_node:true'
    ]);
    expect(setPhaseData.mock.calls[1]).toEqual([
      'cold', 'selectedNodeAttrs', 'hot_node:true'
    ]);
  });
});
