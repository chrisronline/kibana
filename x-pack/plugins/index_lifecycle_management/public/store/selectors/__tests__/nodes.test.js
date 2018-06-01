/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { getNodeOptions } from '../nodes';

describe('nodes', () => {
  it('should get node options', () => {
    const state = {
      nodes: {
        nodes: {
          'warm_node:true': ['1', '2'],
          'hot_node:true': ['3']
        }
      }
    };

    expect(getNodeOptions(state)).toEqual([
      { text: '-- Do not reallocate my indices --' },
      { text: 'hot_node:true (1)', value: 'hot_node:true' },
      { text: 'warm_node:true (2)', value: 'warm_node:true' }
    ]);
  });
});
