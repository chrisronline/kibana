/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  policies,
  defaultPolicy
} from '../policies';
import {
  fetchedPolicies,
  setSelectedPolicy,
  setSelectedPolicyName,
  setSaveAsNewPolicy,
  setPhaseData
} from '../../actions';
import {
  PHASE_HOT,
  PHASE_WARM,
  PHASE_COLD,
  PHASE_DELETE,
  PHASE_ENABLED,
  PHASE_ROLLOVER_ENABLED,
  PHASE_ROLLOVER_AFTER,
  PHASE_ROLLOVER_ALIAS,
  PHASE_ROLLOVER_MAX_AGE,
  PHASE_ROLLOVER_MAX_AGE_UNITS,
  PHASE_ROLLOVER_MAX_SIZE_STORED,
  PHASE_ROLLOVER_MAX_SIZE_STORED_UNITS,
  PHASE_ROLLOVER_MAX_DOC_SIZE,
  PHASE_ROLLOVER_AFTER_UNITS,
  PHASE_FORCE_MERGE_ENABLED,
  PHASE_FORCE_MERGE_SEGMENTS,
  PHASE_SHRINK_ENABLED,
  PHASE_NODE_ATTRS,
  PHASE_PRIMARY_SHARD_COUNT,
  PHASE_REPLICA_COUNT,
  PHASE_ATTRIBUTES_THAT_ARE_NUMBERS
} from '../../constants';

jest.mock('../../selectors', () => ({
  policyFromES: jest.fn()
}));

describe('policies', () => {
  it('should handle the `fetchedPolicies` action', () => {
    const policyList = [{
      id: 1
    }, {
      id: 2
    }];
    const result = policies({}, fetchedPolicies(policyList));
    expect(result.isLoading).toBe(false);
    expect(result.policies).toEqual(policyList);
  });

  it('should handle the `setSelectedPolicy` action', () => {
    const selectedPolicy = {
      name: 'foo'
    };
    const result = policies({}, setSelectedPolicy(selectedPolicy));
    const policyFromES = require('../../selectors').policyFromES;

    expect(result).toEqual({
      originalPolicyName: 'foo',
      selectedPolicySet: true,
      selectedPolicy: defaultPolicy
    });
    expect(policyFromES.mock.calls.length).toBe(1);

    const resultFromNoPolicy = policies({}, setSelectedPolicy());
    expect(resultFromNoPolicy).toEqual({
      selectedPolicySet: true,
      selectedPolicy: defaultPolicy
    });
  });

  it('should handle the `setSelectedPolicyName` action', () => {
    const result = policies({}, setSelectedPolicyName('foo'));
    expect(result.selectedPolicy.name).toEqual('foo');
  });

  it('should handle the `setSaveAsNewPolicy` action', () => {
    const result = policies({}, setSaveAsNewPolicy(true));
    expect(result.selectedPolicy.saveAsNew).toEqual(true);
  });

  describe('setPhaseData', () => {
    const phases = [PHASE_HOT, PHASE_WARM, PHASE_COLD, PHASE_DELETE];
    const phaseActions = [
      PHASE_ENABLED,
      PHASE_ROLLOVER_ENABLED,
      PHASE_ROLLOVER_ALIAS,
      PHASE_ROLLOVER_MAX_AGE,
      PHASE_ROLLOVER_MAX_AGE_UNITS,
      PHASE_ROLLOVER_MAX_SIZE_STORED,
      PHASE_ROLLOVER_MAX_SIZE_STORED_UNITS,
      PHASE_ROLLOVER_MAX_DOC_SIZE,
      PHASE_ROLLOVER_AFTER,
      PHASE_ROLLOVER_AFTER_UNITS,
      PHASE_FORCE_MERGE_ENABLED,
      PHASE_FORCE_MERGE_SEGMENTS,
      PHASE_SHRINK_ENABLED,
      PHASE_NODE_ATTRS,
      PHASE_PRIMARY_SHARD_COUNT,
      PHASE_REPLICA_COUNT
    ];

    phases.forEach(phase => {
      phaseActions.forEach(action => {
        it(`should set ${action} for the ${phase} phase`, () => {
          const selectedPolicy = defaultPolicy;
          let value = 'foo';
          if (PHASE_ATTRIBUTES_THAT_ARE_NUMBERS.includes(action)) {
            value = 1;
          }
          const result = policies({
            selectedPolicy
          }, setPhaseData(phase, action, value));
          expect(result.selectedPolicy.phases[phase][action]).toBe(value);
        });
      });
    });
  });
});
