/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  getLifecycle,
  validatePhase,
  validateLifecycle
} from '../lifecycle';
import {
  PHASE_ENABLED,
  PHASE_ROLLOVER_ENABLED,
  PHASE_ROLLOVER_MAX_AGE,
  PHASE_ROLLOVER_MAX_SIZE_STORED,
  PHASE_ATTRIBUTES_THAT_ARE_NUMBERS,
  PHASE_SHRINK_ENABLED,
  PHASE_FORCE_MERGE_ENABLED,
  PHASE_FORCE_MERGE_SEGMENTS,
  STRUCTURE_INDEX_TEMPLATE,
  STRUCTURE_TEMPLATE_SELECTION,
  STRUCTURE_ALIAS_NAME,
  STRUCTURE_TEMPLATE_NAME,
  STRUCTURE_INDEX_NAME,
  STRUCTURE_CONFIGURATION,
  STRUCTURE_PRIMARY_NODES,
  STRUCTURE_REPLICAS,
  STRUCTURE_REVIEW,
  STRUCTURE_POLICY_NAME,
  STRUCTURE_POLICY_CONFIGURATION,
  PHASE_HOT,
  PHASE_WARM,
  PHASE_COLD,
  PHASE_DELETE,
  PHASE_PRIMARY_SHARD_COUNT
} from '../../constants';

describe('lifecycle', () => {
  it('should get the lifecycle', () => {
    const state = {
      policies: {
        selectedPolicy: {
          name: 'my_policy',
          saveAsNew: true,
          phases: {
            hot: {
              phaseEnabled: true,
            },
            warm: {
              phaseEnabled: true
            },
            cold: {
              phaseEnabled: false,
            },
            delete: {
              phaseEnabled: true,
            }
          }
        }
      }
    };

    const lifecycle = getLifecycle(state);
    expect(lifecycle).toEqual({
      name: 'my_policy',
      phases: {
        hot: {
          actions: {},
          after: '0s',
        },
        warm: {
          actions: {}
        },
        delete: {
          actions: {
            delete: {}
          }
        }
      }
    });
  });

  describe('validatePhase()', () => {
    it('should return no errors if the phase is not enabled', () => {
      expect(validatePhase('warm', {
        [PHASE_ENABLED]: false,
      })).toEqual({});
    });

    it('should ensure rollover numbers are legit if enabled', () => {
      expect(validatePhase('warm', {
        [PHASE_ENABLED]: true,
        [PHASE_ROLLOVER_ENABLED]: true,
        [PHASE_ROLLOVER_MAX_AGE]: 1,
        [PHASE_ROLLOVER_MAX_SIZE_STORED]: 2,
      })).toEqual({});

      const errors = validatePhase('warm', {
        [PHASE_ENABLED]: true,
        [PHASE_ROLLOVER_ENABLED]: true,
        [PHASE_ROLLOVER_MAX_AGE]: 'foo',
        [PHASE_ROLLOVER_MAX_SIZE_STORED]: 'bar',
      });

      expect(errors[PHASE_ROLLOVER_MAX_AGE].length).toBe(1);
      expect(errors[PHASE_ROLLOVER_MAX_SIZE_STORED].length).toBe(1);
    });

    it('should ensure force merge numbers are legit if enabled', () => {
      expect(validatePhase('warm', {
        [PHASE_ENABLED]: true,
        [PHASE_FORCE_MERGE_ENABLED]: true,
        [PHASE_FORCE_MERGE_SEGMENTS]: 1,
      })).toEqual({});

      const errors = validatePhase('warm', {
        [PHASE_ENABLED]: true,
        [PHASE_FORCE_MERGE_ENABLED]: true,
        [PHASE_FORCE_MERGE_SEGMENTS]: 'foo',
      });

      expect(errors[PHASE_FORCE_MERGE_SEGMENTS].length).toBe(1);
    });

    it('should ensure numbers are numbers', () => {
      const phase = PHASE_ATTRIBUTES_THAT_ARE_NUMBERS.reduce((accum, attr) => ({
        ...accum,
        [attr]: 'foo',
      }), {});

      const errors = validatePhase('warm', {
        [PHASE_ENABLED]: true,
        [PHASE_SHRINK_ENABLED]: true,
        [PHASE_FORCE_MERGE_ENABLED]: true,
        ...phase,
      });

      PHASE_ATTRIBUTES_THAT_ARE_NUMBERS.forEach(attr => {
        expect(errors.hasOwnProperty(attr)).toBeTruthy();
        expect(errors[attr].length).toBe(1);
      });
    });
  });

  describe('validateLifecycle()', () => {
    const basicState = {
      general: {},
      nodes: {},
      policies: {
        selectedPolicy: {
          phases: {
            hot: {},
            warm: {},
            cold: {},
            delete: {}
          }
        },
      },
      indexTemplate: {}
    };

    it('should error if no template is selected', () => {
      const errors = validateLifecycle({
        ...basicState,
        indexTemplate: {
          selectedIndexTemplateName: undefined,
        }
      });

      expect(errors[STRUCTURE_INDEX_TEMPLATE][STRUCTURE_TEMPLATE_SELECTION][STRUCTURE_TEMPLATE_NAME].length).toBe(1);
    });

    it('should error if bootstrap is enabled but there is no index name', () => {
      const errors = validateLifecycle({
        ...basicState,
        general: {
          bootstrapEnabled: true,
        }
      });

      expect(errors[STRUCTURE_INDEX_TEMPLATE][STRUCTURE_TEMPLATE_SELECTION][STRUCTURE_INDEX_NAME].length).toBe(1);
    });

    it('should error if bootstrap is enabled but there is no alias name', () => {
      const errors = validateLifecycle({
        ...basicState,
        general: {
          bootstrapEnabled: true,
        }
      });

      expect(errors[STRUCTURE_INDEX_TEMPLATE][STRUCTURE_TEMPLATE_SELECTION][STRUCTURE_ALIAS_NAME].length).toBe(1);
    });

    it('should error if the primary shard count is not valid', () => {
      const notNumberErrors = validateLifecycle({
        ...basicState,
        nodes: {
          selectedPrimaryShardCount: 'foo',
        }
      });

      const invaldNumberErrors = validateLifecycle({
        ...basicState,
        nodes: {
          selectedPrimaryShardCount: -1,
        }
      });

      expect(notNumberErrors[STRUCTURE_INDEX_TEMPLATE][STRUCTURE_CONFIGURATION][STRUCTURE_PRIMARY_NODES].length).toBe(1);
      expect(invaldNumberErrors[STRUCTURE_INDEX_TEMPLATE][STRUCTURE_CONFIGURATION][STRUCTURE_PRIMARY_NODES].length).toBe(1);
    });

    it('should error if the replica count is not valid', () => {
      const notNumberErrors = validateLifecycle({
        ...basicState,
        nodes: {
          selectedReplicaCount: 'foo',
        }
      });

      const invaldNumberErrors = validateLifecycle({
        ...basicState,
        nodes: {
          selectedReplicaCount: -1,
        }
      });

      expect(notNumberErrors[STRUCTURE_INDEX_TEMPLATE][STRUCTURE_CONFIGURATION][STRUCTURE_REPLICAS].length).toBe(1);
      expect(invaldNumberErrors[STRUCTURE_INDEX_TEMPLATE][STRUCTURE_CONFIGURATION][STRUCTURE_REPLICAS].length).toBe(1);
    });

    it('should error if there is no policy name', () => {
      const errors = validateLifecycle({
        ...basicState,
        policies: {
          selectedPolicy: {
            phases: {
              hot: {},
              warm: {},
              cold: {},
              delete: {},
            }
          }
        }
      });

      expect(errors[STRUCTURE_REVIEW][STRUCTURE_POLICY_NAME].length).toBe(1);
    });

    it('should error if there is the policy name is the same as the original one', () => {
      const errors = validateLifecycle({
        ...basicState,
        policies: {
          selectedPolicy: {
            originalPolicyName: 'my_policy',
            selectedPolicyName: 'my_policy',
            saveAsNew: true,
            phases: {
              hot: {},
              warm: {},
              cold: {},
              delete: {},
            }
          }
        }
      });

      expect(errors[STRUCTURE_REVIEW][STRUCTURE_POLICY_NAME].length).toBe(1);
    });

    it('should validate each phase', () => {
      const errors = validateLifecycle(basicState);
      expect(errors[STRUCTURE_POLICY_CONFIGURATION][PHASE_HOT]).toBeDefined();
      expect(errors[STRUCTURE_POLICY_CONFIGURATION][PHASE_WARM]).toBeDefined();
      expect(errors[STRUCTURE_POLICY_CONFIGURATION][PHASE_COLD]).toBeDefined();
      expect(errors[STRUCTURE_POLICY_CONFIGURATION][PHASE_DELETE]).toBeDefined();
    });

    it('should error is the warm shard count is not a divisor of the hot phase shard count', () => {
      const hasErrors = validateLifecycle({
        ...basicState,
        nodes: {
          selectedPrimaryShardCount: 5,
        },
        policies: {
          selectedPolicy: {
            phases: {
              ...basicState.policies.selectedPolicy.phases,
              warm: {
                [PHASE_ENABLED]: true,
                [PHASE_SHRINK_ENABLED]: true,
                [PHASE_PRIMARY_SHARD_COUNT]: 2,
              }
            }
          }
        }
      });
      const noErrors = validateLifecycle({
        ...basicState,
        nodes: {
          selectedPrimaryShardCount: 4,
        },
        policies: {
          selectedPolicy: {
            phases: {
              ...basicState.policies.selectedPolicy.phases,
              warm: {
                [PHASE_ENABLED]: true,
                [PHASE_SHRINK_ENABLED]: true,
                [PHASE_PRIMARY_SHARD_COUNT]: 2,
              }
            }
          }
        }
      });


      expect(hasErrors[STRUCTURE_POLICY_CONFIGURATION][PHASE_WARM][PHASE_PRIMARY_SHARD_COUNT].length).toBe(1);
      expect(noErrors[STRUCTURE_POLICY_CONFIGURATION][PHASE_WARM][PHASE_PRIMARY_SHARD_COUNT].length).toBe(0);
    });
  });
});
