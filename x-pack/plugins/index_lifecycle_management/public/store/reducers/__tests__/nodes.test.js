/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  nodes
} from '../nodes';
import {
  fetchedNodes,
  fetchedNodeDetails,
  setSelectedNodeAttrs,
  setSelectedPrimaryShardCount,
  setSelectedReplicaCount
} from '../../actions';

describe('nodes', () => {
  it('should handle the `fetchedNodes` action', () => {
    const nodeList = [{
      id: 1
    }, {
      id: 2
    }];
    const result = nodes({}, fetchedNodes(nodeList));
    expect(result.isLoading).toBe(false);
    expect(result.nodes).toEqual(nodeList);
  });

  it('should handle the `fetchedNodeDetails` action', () => {
    const result = nodes({}, fetchedNodeDetails('warm_node:true', {
      foo: 1
    }));
    expect(result.details['warm_node:true']).toEqual({
      foo: 1
    });
  });

  it('should handle the `setSelectedNodeAttrs` action', () => {
    const result = nodes({}, setSelectedNodeAttrs('warm_node:true'));
    expect(result.selectedNodeAttrs).toEqual('warm_node:true');
  });

  it('should handle the `setSelectedPrimaryShardCount` action', () => {
    const result = nodes({}, setSelectedPrimaryShardCount(1));
    expect(result.selectedPrimaryShardCount).toEqual(1);

    const resultFromStringNumber = nodes({}, setSelectedPrimaryShardCount('1'));
    expect(resultFromStringNumber.selectedPrimaryShardCount).toEqual(1);

    const resultFromRandomString = nodes({}, setSelectedPrimaryShardCount('foobar'));
    expect(resultFromRandomString.selectedPrimaryShardCount).toEqual('');
  });

  it('should handle the `setSelectedReplicaCount` action', () => {
    const result = nodes({}, setSelectedReplicaCount(1));
    expect(result.selectedReplicaCount).toEqual(1);

    const resultFromStringNumber = nodes({}, setSelectedReplicaCount('1'));
    expect(resultFromStringNumber.selectedReplicaCount).toEqual(1);

    const resultFromRandomString = nodes({}, setSelectedReplicaCount('foobar'));
    expect(resultFromRandomString.selectedReplicaCount).toEqual('');
  });
});
