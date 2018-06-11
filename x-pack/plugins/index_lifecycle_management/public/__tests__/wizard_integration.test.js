/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { indexLifecycleManagementStore } from '../store';
import { Wizard } from '../sections/wizard';
import * as api from '../api';

const baseApi = `/api/index_lifecycle_management`;
api.setHttpClient({
  get: url => {
    let data;
    const myTemplate = {
      name: 'my_template',
      indices: ['my_indices1', 'my_indices2'],
      index_patterns: ['my_indices*'],
      settings: {}
    };

    switch (url) {
      case `${baseApi}/templates`:
        data = [
          myTemplate
        ];
        break;
      case `${baseApi}/nodes/list`:
        data = {
          'warm_node:true': ['warmNode1'],
          'cold_node:true': ['coldNode1', 'coldNode2'],
          'hot_node:true': ['hotNode1', 'hotNode2']
        };
        break;
      case `${baseApi}/policies`:
        data = [];
        break;
      case `${baseApi}/template/my_template`:
        data = myTemplate;
        break;
      default:
        console.log(url);
    }

    return { data };
  },
  post: (url, data) => {
    // Just return the data so we can inspect it in the test
    return data;
  }
});

jest.mock('../sections/wizard/components/review/diff_view', () => ({
  DiffView: () => ''
}));

describe('Wizard Integration', () => {
  it('create a new policy', async () => {
    const store = indexLifecycleManagementStore();
    const component = mount(
      <Provider store={store}>
        <Wizard/>
      </Provider>
    );

    await new Promise(resolve => process.nextTick(resolve));

    // Fill out the first step
    const indexTemplateSelectControl = component.find('Wizard').find('TemplateSelection').find('EuiSelect').at(0);
    await indexTemplateSelectControl.prop('onChange')({
      target: {
        value: 'my_template'
      }
    });

    const allocationControl = component.find('Wizard').find('Configuration').find('EuiSelect').at(0);
    await allocationControl.prop('onChange')({
      target: {
        value: 'hot_node:true'
      }
    });

    const primaryShardControl = component.find('Wizard').find('Configuration').find('EuiFieldNumber').at(0);
    await primaryShardControl.prop('onChange')({
      target: {
        value: '3'
      }
    });

    const replicaCountControl = component.find('Wizard').find('Configuration').find('EuiFieldNumber').at(1);
    await replicaCountControl.prop('onChange')({
      target: {
        value: '2'
      }
    });

    // Go to the second step
    const goToStep2Btn = component.find('Wizard').find('IndexTemplate').find('EuiButton').at(0);
    await goToStep2Btn.prop('onClick')();
    component.update();

    // Create a new policy
    const createNewPolicyBtn = component.find('Wizard').find('PolicySelection').find('EuiButton').at(0);
    await createNewPolicyBtn.prop('onClick')();
    component.update();

    // Set a max index size in gb
    const maxIndexSizeControl = component.find('Wizard').find('HotPhase').find('EuiFieldNumber').at(0);
    await maxIndexSizeControl.prop('onChange')({
      target: {
        value: '10'
      }
    });
    const maxIndexSizeUnitsControl = component.find('Wizard').find('HotPhase').find('EuiSelect').at(0);
    await maxIndexSizeUnitsControl.prop('onChange')({
      target: {
        value: 'gb'
      }
    });

    // Enable the warm phase
    const warmPhaseEnableBtn = component.find('Wizard').find('WarmPhase').find('EuiButton').at(0);
    await warmPhaseEnableBtn.prop('onClick')();
    component.update();

    // Move on rollover
    const warmPhaseOnRolloverControl = component.find('Wizard').find('WarmPhase').find('EuiSwitch').at(0);
    await warmPhaseOnRolloverControl.prop('onChange')({
      target: {
        checked: true,
      }
    });
    component.update();

    // Allocate to warm nodes
    const warmPhaseAllocationControl = component.find('Wizard').find('WarmPhase').find('EuiSelect').at(0);
    await warmPhaseAllocationControl.prop('onChange')({
      target: {
        value: 'warm_node:true',
      }
    });

    // Set replicas to same as hot phase
    const warmPhaseSetReplicasSameAsHot = component.find('Wizard').find('WarmPhase').find('EuiButtonEmpty').at(0);
    await warmPhaseSetReplicasSameAsHot.prop('onClick')();
    component.update();

    // Shrink to 1 shard
    const warmPhaseShrinkShardCountControl = component.find('Wizard').find('WarmPhase').find('EuiFieldNumber').at(1);
    await warmPhaseShrinkShardCountControl.prop('onChange')({
      target: {
        value: '1',
      }
    });

    // Force merge to a single segment
    const warmPhaseForceMergeSwitchControl = component.find('Wizard').find('WarmPhase').find('EuiSwitch').at(2);
    await warmPhaseForceMergeSwitchControl.prop('onChange')({
      target: {
        checked: true
      }
    });
    component.update();
    const warmPhaseForceMergeSegmentCountControl = component.find('Wizard').find('WarmPhase').find('EuiFieldNumber').at(2);
    await warmPhaseForceMergeSegmentCountControl.prop('onChange')({
      target: {
        value: '1',
      }
    });

    // Enable the cold phase
    const coldPhaseEnableBtn = component.find('Wizard').find('ColdPhase').find('EuiButton').at(0);
    await coldPhaseEnableBtn.prop('onClick')();
    component.update();

    // Move after 10 days
    const coldPhaseRolloverAfterControl = component.find('Wizard').find('ColdPhase').find('EuiFieldNumber').at(0);
    await coldPhaseRolloverAfterControl.prop('onChange')({
      target: {
        value: '10',
      }
    });

    // Allocate to cold nodes
    const coldPhaseAllocationControl = component.find('Wizard').find('ColdPhase').find('EuiSelect').at(1);
    await coldPhaseAllocationControl.prop('onChange')({
      target: {
        value: 'cold_node:true',
      }
    });

    // Set replicas to the same as warm phase
    const coldPhaseSetReplicasSameAsHot = component.find('Wizard').find('ColdPhase').find('EuiButtonEmpty').at(0);
    await coldPhaseSetReplicasSameAsHot.prop('onClick')();
    component.update();

    // Enable the delete phase
    const deletePhaseEnableBtn = component.find('Wizard').find('DeletePhase').find('EuiButton').at(0);
    await deletePhaseEnableBtn.prop('onClick')();
    component.update();

    // Move after 30 days
    const deletePhaseRolloverAfterControl = component.find('Wizard').find('DeletePhase').find('EuiFieldNumber').at(0);
    await deletePhaseRolloverAfterControl.prop('onChange')({
      target: {
        value: '30',
      }
    });

    // Move on to step 3
    const goToStep3Btn = component.find('Wizard').find('PolicyConfiguration').find('EuiButton').at(4);
    await goToStep3Btn.prop('onClick')();
    component.update();

    // Name the policy
    const policyNameControl = component.find('Wizard').find('Review').find('EuiFieldText').at(0);
    await policyNameControl.prop('onChange')({
      target: {
        value: 'my_new_policy'
      }
    });
    component.update();

    // Create it
    jest.spyOn(api, 'saveLifecycle');
    const createLifecycleBtn = component.find('Wizard').find('Review').find('EuiButton').at(0);
    await createLifecycleBtn.prop('onClick')();
    expect(api.saveLifecycle).toHaveBeenCalledWith(
      {
        name: 'my_new_policy',
        phases: {
          hot: {
            actions: {
              rollover: {
                max_size: '10gb',
              }
            },
            after: '0s'
          },
          warm: {
            actions: {
              allocate: {
                exclude: {},
                include: {},
                require: {
                  _name: 'warm_node:true'
                }
              },
              forcemerge: {
                max_num_segments: 1
              },
              replicas: {
                number_of_replicas: 2
              },
              shrink: {
                number_of_shards: 1
              }
            }
          },
          cold: {
            actions: {
              allocate: {
                exclude: {},
                include: {},
                require: {
                  _name: 'cold_node:true'
                }
              }
            },
            after: '10d'
          },
          delete: {
            actions: {
              delete: {}
            },
            after: '30d'
          }
        }
      },
      {
        indexTemplate: 'my_template',
        lifecycleName: 'my_new_policy',
        nodeAttrs: 'hot_node:true',
        primaryShardCount: 3,
        replicaCount: 2,
      }
    );
  });
});
