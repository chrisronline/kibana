/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  getSelectedPolicyName,
  splitSizeAndUnits,
  phaseFromES,
  policyFromES,
  phaseToES
} from '..';
import {
  defaultPolicy
} from '../../reducers/policies';
import {
  PHASE_ENABLED,
  PHASE_ROLLOVER_AFTER,
  PHASE_ROLLOVER_AFTER_UNITS,
  PHASE_ROLLOVER_ENABLED,
  PHASE_ROLLOVER_MAX_AGE,
  PHASE_ROLLOVER_MAX_AGE_UNITS,
  PHASE_ROLLOVER_MAX_SIZE_STORED,
  PHASE_ROLLOVER_MAX_SIZE_STORED_UNITS,
  MAX_SIZE_TYPE_DOCUMENT,
  PHASE_NODE_ATTRS,
  PHASE_FORCE_MERGE_ENABLED,
  PHASE_FORCE_MERGE_SEGMENTS,
  PHASE_REPLICA_COUNT,
  PHASE_PRIMARY_SHARD_COUNT,
  PHASE_ROLLOVER_ALIAS,
  PHASE_SHRINK_ENABLED
} from '../../constants';

describe('policies', () => {
  it('should return the policy name', () => {
    expect(getSelectedPolicyName({
      policies: {
        selectedPolicy: {
          name: 'my_policy',
          saveAsNew: true,
        }
      }
    })).toBe('my_policy');

    expect(getSelectedPolicyName({
      policies: {
        originalPolicyName: 'my_policy2',
        selectedPolicy: {
          name: 'my_policy',
          saveAsNew: false,
        }
      }
    })).toBe('my_policy2');
  });

  it('should split size and units from a string', () => {
    expect(splitSizeAndUnits('5d')).toEqual({
      size: 5,
      units: 'd'
    });

    expect(splitSizeAndUnits('0s')).toEqual({
      size: 0,
      units: 's'
    });
  });

  describe('phaseFromES()', () => {
    it('should auto set the phase to enabled', () => {
      const phase = phaseFromES({}, defaultPolicy);

      expect(phase[PHASE_ENABLED]).toBeTruthy();
      expect(phase[PHASE_ROLLOVER_ENABLED]).toBeFalsy();
    });

    it('should handle the `after` property', () => {
      const phase = phaseFromES({
        after: '0s'
      }, defaultPolicy);

      expect(phase[PHASE_ROLLOVER_AFTER]).toBe(0);
      expect(phase[PHASE_ROLLOVER_AFTER_UNITS]).toBe('s');
    });

    it('should handle `rollover` property', () => {
      const phase = phaseFromES({
        actions: {
          rollover: {
            max_age: '5d',
            max_size: '10g',
            // max_docs: '10000',
          }
        }
      }, defaultPolicy);

      expect(phase[PHASE_ROLLOVER_ENABLED]).toBeTruthy();
      expect(phase[PHASE_ROLLOVER_MAX_AGE]).toBe(5);
      expect(phase[PHASE_ROLLOVER_MAX_AGE_UNITS]).toBe('d');
      expect(phase[PHASE_ROLLOVER_MAX_SIZE_STORED]).toBe(10);
      expect(phase[PHASE_ROLLOVER_MAX_SIZE_STORED_UNITS]).toBe('g');

      const phaseWithDocs = phaseFromES({
        actions: {
          rollover: {
            max_docs: '10000',
          }
        }
      }, defaultPolicy);

      expect(phaseWithDocs[PHASE_ROLLOVER_MAX_SIZE_STORED]).toBe(10000);
      expect(phaseWithDocs[PHASE_ROLLOVER_MAX_SIZE_STORED_UNITS]).toBe(MAX_SIZE_TYPE_DOCUMENT);
    });

    it('should handle the `allocate` property', () => {
      const phase = phaseFromES({
        actions: {
          allocate: {
            require: {
              _name: 'foobar'
            }
          }
        }
      }, defaultPolicy);

      expect(phase[PHASE_NODE_ATTRS]).toBe('foobar');
    });

    it('should handle the `forcemerge` property', () => {
      const phase = phaseFromES({
        actions: {
          forcemerge: {
            max_num_segments: 10,
          }
        }
      }, defaultPolicy);

      expect(phase[PHASE_FORCE_MERGE_ENABLED]).toBeTruthy();
      expect(phase[PHASE_FORCE_MERGE_SEGMENTS]).toBe(10);
    });

    it('should handle the `shrink` property', () => {
      const phase = phaseFromES({
        actions: {
          shrink: {
            number_of_shards: 1,
          }
        }
      }, defaultPolicy);

      expect(phase[PHASE_PRIMARY_SHARD_COUNT]).toBe(1);
    });

    it('should handle the `replicas` property', () => {
      const phase = phaseFromES({
        actions: {
          replicas: {
            number_of_replicas: 2,
          }
        }
      }, defaultPolicy);

      expect(phase[PHASE_REPLICA_COUNT]).toBe(2);
    });
  });

  describe('policyFromES', () => {
    it('should return all phases', () => {
      const policy = policyFromES({
        name: 'my_policy',
        type: 'foobar',
        phases: {
          hot: {},
          warm: {},
          cold: {},
          delete: {}
        }
      });

      expect(policy.name).toBe('my_policy');
      expect(policy.type).toBe('foobar');
      expect(policy.phases.hot).toBeDefined();
      expect(policy.phases.warm).toBeDefined();
      expect(policy.phases.cold).toBeDefined();
      expect(policy.phases.delete).toBeDefined();
    });
  });

  describe('phaseToES', () => {
    it('should handle `PHASE_ROLLOVER_AFTER`', () => {
      const toES = phaseToES(null, {
        [PHASE_ENABLED]: true,
        [PHASE_ROLLOVER_AFTER]: 4,
        [PHASE_ROLLOVER_AFTER_UNITS]: 'd',
      });
      expect(toES.after).toBe('4d');
    });

    it('should handle `PHASE_ROLLOVER_ALIAS`', () => {
      const toES = phaseToES(null, {
        [PHASE_ENABLED]: true,
        [PHASE_ROLLOVER_ENABLED]: true,
        [PHASE_ROLLOVER_ALIAS]: 'my_alias',
      });
      expect(toES.actions.rollover.alias).toBe('my_alias');
    });

    it('should handle `PHASE_ROLLOVER_MAX_AGE`', () => {
      const toES = phaseToES(null, {
        [PHASE_ENABLED]: true,
        [PHASE_ROLLOVER_ENABLED]: true,
        [PHASE_ROLLOVER_MAX_AGE]: 3,
        [PHASE_ROLLOVER_MAX_AGE_UNITS]: 'd',
      });
      expect(toES.actions.rollover.max_age).toBe('3d');
    });

    it('should handle `PHASE_ROLLOVER_MAX_SIZE_STORED`', () => {
      const toES = phaseToES(null, {
        [PHASE_ENABLED]: true,
        [PHASE_ROLLOVER_ENABLED]: true,
        [PHASE_ROLLOVER_MAX_SIZE_STORED]: 3,
        [PHASE_ROLLOVER_MAX_SIZE_STORED_UNITS]: 'g',
      });
      expect(toES.actions.rollover.max_size).toBe('3g');
    });

    it('should handle `PHASE_ROLLOVER_MAX_SIZE_STORED` with docs', () => {
      const toES = phaseToES(null, {
        [PHASE_ENABLED]: true,
        [PHASE_ROLLOVER_ENABLED]: true,
        [PHASE_ROLLOVER_MAX_SIZE_STORED]: 3,
        [PHASE_ROLLOVER_MAX_SIZE_STORED_UNITS]: MAX_SIZE_TYPE_DOCUMENT,
      });
      expect(toES.actions.rollover.max_docs).toBe(3);
    });

    it('should handle `PHASE_NODE_ATTRS`', () => {
      const toES = phaseToES(null, {
        [PHASE_ENABLED]: true,
        [PHASE_NODE_ATTRS]: 'warm_node:true'
      });
      expect(toES.actions.allocate.require._name).toBe('warm_node:true');
    });

    it('should handle `PHASE_FORCE_MERGE_ENABLED`', () => {
      const toES = phaseToES(null, {
        [PHASE_ENABLED]: true,
        [PHASE_FORCE_MERGE_ENABLED]: true,
        [PHASE_FORCE_MERGE_SEGMENTS]: 5,
      });
      expect(toES.actions.forcemerge.max_num_segments).toBe(5);
    });

    it('should handle `PHASE_SHRINK_ENABLED`', () => {
      const toES = phaseToES(null, {
        [PHASE_ENABLED]: true,
        [PHASE_SHRINK_ENABLED]: true,
        [PHASE_PRIMARY_SHARD_COUNT]: 1,
      });
      expect(toES.actions.shrink.number_of_shards).toBe(1);
    });

    it('should handle `PHASE_REPLICA_COUNT`', () => {
      const toES = phaseToES(null, {
        [PHASE_ENABLED]: true,
        [PHASE_REPLICA_COUNT]: 2,
      });
      expect(toES.actions.replicas.number_of_replicas).toBe(2);
    });
  });
});
