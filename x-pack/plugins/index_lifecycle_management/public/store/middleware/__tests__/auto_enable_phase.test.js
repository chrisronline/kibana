/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { autoEnablePhase } from '../auto_enable_phase';

jest.mock('../../selectors', () => {
  return {
    getPhaseData: () => {}
  };
});

describe('autoEnablePhase', () => {
  it('should enable a phase if some data has been set', () => {
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
      }
    };

    const executor = autoEnablePhase(store)(next);
    executor(action);

    expect(store.dispatch.mock.calls.length).toBe(1);
    expect(store.dispatch.mock.calls[0]).toEqual([{
      type: 'SET_PHASE_DATA',
      payload: {
        phase: 'warm',
        key: 'phaseEnabled',
        value: true
      }
    }]);

    // Calling it twice should stil result in one call to our mocks
    executor(action);
    expect(store.dispatch.mock.calls.length).toBe(1);
  });
});
