/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { autoSetNodeAttrs } from '../auto_set_node_attrs';

jest.mock('../../selectors', () => {
  return {
    getPhaseData: () => {}
  };
});

describe('autoSetNodeAttrs', () => {
  it('should set the warm phase if the hot phase has been set', () => {
    const state = {};
    const store = {
      getState: () => state,
      dispatch: jest.fn(),
    };
    const next = jest.fn();
    const action = {
      type: 'SET_SELECTED_NODE_ATTRS',
      payload: 'warm_node:true'
    };

    const executor = autoSetNodeAttrs(store)(next);
    executor(action);

    expect(store.dispatch.mock.calls.length).toBe(1);
    expect(store.dispatch.mock.calls[0]).toEqual([{
      type: 'SET_PHASE_DATA',
      payload: {
        phase: 'warm',
        key: 'selectedNodeAttrs',
        value: 'warm_node:true'
      }
    }]);
  });

  it('should set the cold phase if the warm phase has been set', () => {
    const state = {};
    const store = {
      getState: () => state,
      dispatch: jest.fn(),
    };
    const next = jest.fn();
    const action = {
      type: 'SET_PHASE_DATA',
      payload: {
        phase: 'warm',
        key: 'selectedNodeAttrs',
        value: 'warm_node:true'
      }
    };

    const executor = autoSetNodeAttrs(store)(next);
    executor(action);

    expect(store.dispatch.mock.calls.length).toBe(1);
    expect(store.dispatch.mock.calls[0]).toEqual([{
      type: 'SET_PHASE_DATA',
      payload: {
        phase: 'cold',
        key: 'selectedNodeAttrs',
        value: 'warm_node:true'
      }
    }]);
  });
});
