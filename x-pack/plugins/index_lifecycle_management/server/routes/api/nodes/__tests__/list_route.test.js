/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import sinon from 'sinon';
import proxyquire from 'proxyquire';

const callWithRequestFactorySpy = sinon.fake(((method) => {
  if (method === 'nodes.stats') {
    const ignorableNodes = ['ml.enabled', 'ml.machine_memory', 'ml.max_open_jobs'].reduce((accum, key, index) => ({
      ...accum,
      [index + 4]: {
        [key]: true,
      }
    }), {});
    return {
      nodes: {
        1: {
          attributes: {
            'hot_node': true,
          }
        },
        2: {
          attributes: {
            'hot_node': true,
          }
        },
        3: {
          attributes: {
            'warm_node': true,
          }
        },
        ...ignorableNodes,
      }
    };
  }
}));

const registerListRoute = proxyquire('../register_list_route', {
  '../../../lib/call_with_request_factory': {
    callWithRequestFactory: () => callWithRequestFactorySpy
  }
}).registerListRoute;

let routeHandler;
const mockServer = {
  route: options => {
    routeHandler = options.handler;
  }
};

describe('ilmListNodesRoute', () => {
  it('should call nodes.stats and format the results', async () => {
    registerListRoute(mockServer);

    const reply = sinon.fake();

    await routeHandler({}, reply);

    sinon.assert.match(callWithRequestFactorySpy.callCount, 1);
    sinon.assert.calledWith(callWithRequestFactorySpy, 'nodes.stats', {
      format: 'json'
    });
    sinon.assert.calledWith(reply, {
      'hot_node:true': ['1', '2'],
      'warm_node:true': ['3']
    });
  });
});
